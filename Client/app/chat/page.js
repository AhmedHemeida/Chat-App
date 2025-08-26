"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/inbox", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await res.json();
        setConversations(data);
        console.log("Fetched conversations:", data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="flex h-screen">
      {loading ? (
        <div className="m-auto">Loading...</div>
      ) : (
        <>
          {/* Sidebar with conversation list */}
          <Sidebar
            conversations={conversations.inbox}
            activeId={activeConv?._id}
            onSelect={(conv) => setActiveConv(conv)} // pass whole conv
          />

          {/* Show chat window only when a conversation is selected */}
          {activeConv ? (
<ChatWindow conversation={activeConv} currentUser={conversations.userId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </>
      )}
    </div>
  );
}
