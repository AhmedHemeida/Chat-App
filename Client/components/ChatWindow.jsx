"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { io } from "socket.io-client";

export default function ChatWindow({ conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // initialize socket once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000", {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected");
      });

      socketRef.current.on("new-msg", (msg) => {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });
    }
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation) return;

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
      }
    };

    fetchMessages();
  }, [conversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
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
      // ما تضيفش الرسالة هنا، سيب الـ socket يعملها
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-white shadow-sm">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-gray-100">
        <Image
          src={conversation.otherUser?.avatarUrl || "/default-avatar.png"}
          alt={conversation.otherUser?.name || "User"}
          width={40}
          height={40}
          className="rounded-full"
        />
        <h2 className="font-medium">{conversation.otherUser?.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
        {messages.map((msg) => (
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
          className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
