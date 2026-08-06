import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TYPE_CONFIG = {
  URGENT: {
    bg: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    icon: "⚠",
    iconColor: "text-red-500",
  },
  MODERATION: {
    bg: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
    icon: "🕐",
    iconColor: "text-yellow-500",
  },
  APPROVED: {
    bg: "bg-green-50 border-green-200",
    iconBg: "bg-green-100",
    icon: "✓",
    iconColor: "text-green-500",
  },
  COMPLETED: {
    bg: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
    icon: "✓",
    iconColor: "text-green-500",
  },
};

const DEFAULT_CONFIG = {
  bg: "bg-gray-50 border-gray-200",
  iconBg: "bg-gray-100",
  icon: "🔔",
  iconColor: "text-gray-500",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    await axiosInstance.put("/notifications/mark-all-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id) => {
    await axiosInstance.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = async (id) => {
    await axiosInstance.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentCount = notifications.filter((n) => n.isUrgent).length;

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "URGENT") return n.isUrgent;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading notifications...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>;

  return (
    <div className="space-y-4">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { key: "ALL", label: "All" },
            { key: "UNREAD", label: `Unread (${unreadCount})` },
            { key: "URGENT", label: "Urgent" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === tab.key
                  ? "bg-[#7c4dff] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2"
        >
          ✓ Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16 bg-white rounded-2xl border border-gray-100">
            No notifications found.
          </div>
        ) : (
          filtered.map((n) => {
            const config = TYPE_CONFIG[n.type] || DEFAULT_CONFIG;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                  n.isRead ? "bg-white border-gray-100" : config.bg
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0 ${config.iconColor} font-bold text-lg`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${n.isRead ? "text-gray-600" : "text-gray-800"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    {n.courseCode && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                        {n.courseCode}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{n.message}</p>
                  <p className="text-xs text-gray-400">{n.timeAgo}</p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="text-gray-300 hover:text-red-400 transition text-lg shrink-0"
                >
                  🗑
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}