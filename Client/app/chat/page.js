"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { User as UserIcon } from "lucide-react";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const Name = localStorage.getItem("name");
        setUserName(Name || "Welcome");

        const res = await fetch("http://localhost:3000/api/inbox", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await res.json();

        setConversations(data.inbox || []);
        setCurrentUserId(data.userId);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleSelect = (item) => {
    if (item.conversationId) {
      setActiveConv(item);
    } else {
      const tempConv = {
        conversationId: `temp-${item._id}`,
        otherUser: {
          _id: item._id,
          name: item.name,
          avatarUrl: item.avatarUrl,
        },
        lastMessage: null,
        updatedAt: new Date().toISOString(),
      };
      setActiveConv(tempConv);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-4 bg-gray-800 text-white text-lg font-semibold shadow-md flex items-center gap-2">
        <UserIcon size={22} className="text-white" />
        {userName}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {loading ? (
          <div className="m-auto">Loading...</div>
        ) : (
          <>
            <Sidebar
              conversations={conversations}
              activeId={activeConv?.conversationId || activeConv?._id}
              onSelect={handleSelect}
            />

            {activeConv ? (
              <div className="flex-1 overflow-y-auto">
                <ChatWindow
                  conversation={activeConv}
                  currentUser={currentUserId}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
