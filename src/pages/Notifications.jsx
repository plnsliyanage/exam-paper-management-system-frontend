import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TYPE_CONFIG = {
  URGENT: {
    bg: "bg-red-50/40 border-red-200 hover:bg-red-50/70",
    iconBg: "bg-red-100 text-red-500",
    icon: "⚠",
  },
  MODERATION: {
    bg: "bg-amber-50/40 border-amber-200 hover:bg-amber-50/70",
    iconBg: "bg-amber-100 text-amber-600",
    icon: "🕐",
  },
  APPROVED: {
    bg: "bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70",
    iconBg: "bg-emerald-100 text-emerald-600",
    icon: "✓",
  },
  COMPLETED: {
    bg: "bg-teal-50/40 border-teal-200 hover:bg-teal-50/70",
    iconBg: "bg-teal-100 text-teal-600",
    icon: "✓",
  },
};

const DEFAULT_CONFIG = {
  bg: "bg-white border-gray-100 hover:bg-gray-50",
  iconBg: "bg-gray-100 text-gray-500",
  icon: "🔔",
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
      setLoading(true);
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data);
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "URGENT") return n.isUrgent;
    return true;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4dff] mr-3"></div>
        Loading notifications...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );

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
                  ? "bg-[#7c4dff] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm transition"
        >
          ✓ Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            No notifications found.
          </div>
        ) : (
          filtered.map((n) => {
            const config = TYPE_CONFIG[n.type] || DEFAULT_CONFIG;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition shadow-sm ${
                  n.isRead ? "bg-white border-gray-100 hover:bg-gray-50/70" : config.bg
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0 font-bold text-base`}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p
                      className={`text-sm font-bold ${
                        n.isRead ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    {n.courseCode && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-semibold border border-blue-100">
                        {n.courseCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {n.timeAgo}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="text-gray-300 hover:text-red-500 transition text-base shrink-0 p-1 rounded-lg hover:bg-red-50"
                  title="Delete notification"
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