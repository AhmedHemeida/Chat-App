import Image from "next/image";

export default function Sidebar({ conversations, activeId, onSelect }) {
  return (
    <div className="w-72 border-r bg-gray-50 h-screen overflow-y-auto">
      <h2 className="p-4 font-bold text-lg border-b">Inbox</h2>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.conversationId}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-200 ${
              activeId === conv.conversationId ? "bg-gray-300" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <Image
                src={conv.otherUser.avatarUrl}
                alt={conv.otherUser.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>

            {/* Info */}
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
        ))}
      </ul>
    </div>
  );
}
