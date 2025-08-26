"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // هنا تقدر تجيب الـ user من localStorage (بعد تسجيل الدخول)
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);

    if (savedUser) {
      fetchConversations(savedUser._id);
    }
  }, []);

  const fetchConversations = async (userId) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${userId}`
      );
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome to Chat App</h1>
        <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>

      <div className="w-full max-w-md space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv._id}
              href={`/chat/${conv._id}`}
              className="flex justify-between items-center border p-4 rounded hover:bg-gray-100"
            >
              <div>
                <p className="font-semibold">
                  {conv.participants
                    .filter((p) => p._id !== user._id)
                    .map((p) => p.username)
                    .join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  {conv.lastMessage?.text?.slice(0, 20) ||
                    (conv.lastMessage?.imageUrl ? "📷 Image" : "No messages")}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(conv.updatedAt).toLocaleTimeString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
