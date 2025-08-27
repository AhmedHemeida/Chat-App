"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { io } from "socket.io-client";

export default function ChatWindow({ conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [file, setFile] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000", {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {});

      socketRef.current.on("new-msg", (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });
    }
  }, []);

  useEffect(() => {
    if (conversation?.otherUser) {
      setActiveUser(conversation.otherUser);
    }
  }, [conversation]);

  useEffect(() => {
    if (!conversation?.conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/${conversation.conversationId}/messages`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    );
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() && !file) return;

    const formData = new FormData();
    formData.append("text", newMsg);
    formData.append("receiverId", conversation.otherUser.id);
    if (file) formData.append("images", file);

    try {
      await fetch(`http://localhost:3000/api/messages/send`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      setNewMsg("");
      setFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b flex items-center gap-3 mt-12 mr-4 rounded-lg shadow-sm">
        <Image
          src={activeUser.avatarUrl || "/default-avatar.png"}
          alt={activeUser.name || "User"}
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
        <h2 className="font-medium text-lg">{activeUser.name}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50 mt-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-10">
            <p className="mb-2 text-lg">Start a new conversation</p>
            <p className="text-sm">
              Send your first message to {activeUser.name}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.sender._id === currentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                  msg.sender._id === currentUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text && <div>{msg.text}</div>}
                {msg.attachments?.map((att, i) => (
                  <img
                    key={i}
                    src={`http://localhost:3000${att}`}
                    alt="attachment"
                    className="mt-2 max-w-full rounded"
                  />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex items-center gap-2 bg-gray-100">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none shadow-sm"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />

        <label
          htmlFor="fileInput"
          className="cursor-pointer px-3 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
        >
          📎
        </label>

        {file && (
          <div className="relative w-16 h-16">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-full h-full object-cover rounded-md border"
            />
            <button
              onClick={() => setFile(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}

        <button
          onClick={handleSend}
          className="px-8 py-2 bg-gray-800 text-white rounded-l hover:bg-blue-800 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
