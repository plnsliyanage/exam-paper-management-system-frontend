import React, { useEffect, useState } from "react";
import { Bell, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { lecturerApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LecturerNotificationsPage() {
  const { getUsername } = useAuth();
  const currentUserId = getUsername() || "1";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedNotificationId, setExpandedNotificationId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [currentUserId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await lecturerApi.getNotifications(currentUserId);
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (id) => {
    setExpandedNotificationId((prev) => (prev === id ? null : id));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await lecturerApi.markAllNotificationsAsRead(currentUserId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "Read" }))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-xs mt-1">
            Stay updated with recent exam packets and status alerts.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading notifications...</div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          No notifications found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
          {notifications.map((n, idx) => {
            const isRead = n.status === "Read";
            const isExpanded = expandedNotificationId === (n.notificationId || idx);
            return (
              <div
                key={n.notificationId || idx}
                onClick={() => toggleNotification(n.notificationId || idx)}
                className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition ${
                  isRead ? "bg-white" : "bg-[#7c4dff]/5"
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${isRead ? "bg-slate-100 text-slate-400" : "bg-[#7c4dff]/10 text-[#7c4dff]"}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#7c4dff] uppercase">
                      {n.type || "NOTIFICATION"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isRead ? "text-slate-600" : "font-bold text-slate-900"} ${!isExpanded ? "truncate" : ""}`}>
                    {n.message}
                  </p>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
