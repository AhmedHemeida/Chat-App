"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Sidebar({ conversations, activeId, onSelect }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search) return; 

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/api/users`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        console.log(data)
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
      conv.lastMessage?.text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 border-r bg-gray-50 h-screen overflow-y-auto flex flex-col">
      <h2 className="p-4 font-bold text-lg border-b">Inbox</h2>

      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <ul className="flex-1">
        {search ? (
          loading ? (
            <li className="p-4 text-gray-500 text-sm">Loading...</li>
          ) : users.length > 0 ? (
            users.map((user) => (
              <li
                key={user._id}
                onClick={() => onSelect(user)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-200 ${
                  activeId === user._id ? "bg-gray-300" : ""
                }`}
              >
                <div className="relative">
                  <Image
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium truncate">{user.name}</span>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-gray-500 text-sm">
              No users found, search people and start new conversation
            </li>
          )
        ) : (
          filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <li
                key={conv.conversationId}
                onClick={() => onSelect(conv)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-200 ${
                  activeId === conv.conversationId ? "bg-gray-300" : ""
                }`}
              >
                <div className="relative">
                  <Image
                    src={conv.otherUser?.avatarUrl || "/default-avatar.png"}
                    alt={conv.otherUser?.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">
                      {conv.otherUser.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {conv.lastMessage?.text || "No messages yet"}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-gray-500 text-sm">
              No conversations found
            </li>
          )
        )}
      </ul>
    </div>
  );
}
