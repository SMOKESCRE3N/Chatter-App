import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthstore";
import { useChatStore } from "../store/useChatstore";

const Sidebar = () => {
  const { authUser, logout } = useAuthStore();
  const { users, getUsers, selectedUser, setSelectedUser, onlineUsers, unreadCounts } = useChatStore();

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full">

      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-indigo-400">Chatter 💬</h1>
        <p className="text-gray-500 text-xs mt-1">
          {onlineUsers.length - 1 > 0 ? `${onlineUsers.length - 1} online` : "No one else online"}
        </p>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto py-2">
        {users.length === 0 && (
          <p className="text-gray-600 text-sm text-center mt-8">No other users yet</p>
        )}

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800 transition
              ${selectedUser?._id === user._id ? "bg-gray-800 border-l-4 border-indigo-500" : ""}
            `}
          >
            {/* Avatar with online indicator */}
            <div className="flex items-center gap-3 flex-1">
  {/* Avatar */}
  <div className="relative shrink-0">
    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
      {user.fullName.charAt(0).toUpperCase()}
    </div>
    {onlineUsers.map(id => id.toString()).includes(user._id.toString()) && (
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
)}
  </div>

  {/* Name + badge */}
  <div className="flex-1 flex items-center justify-between">
    <div>
      <p className="text-white text-sm font-medium">{user.fullName}</p>
      <p className="text-gray-500 text-xs">
        {onlineUsers.map(id => id.toString()).includes(user._id.toString()) ? "Online" : "Offline"}
      </p>
    </div>

    {unreadCounts[user._id] > 0 && (
      <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
        {unreadCounts[user._id] > 99 ? "99+" : unreadCounts[user._id]}
      </span>
    )}
  </div>
</div>

           
          </div>
        ))}
      </div>

      {/* Bottom - logged in user + logout */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white font-semibold text-sm">
            {authUser?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{authUser?.fullName}</p>
            <p className="text-green-400 text-xs">● Online</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-400 text-xs transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;