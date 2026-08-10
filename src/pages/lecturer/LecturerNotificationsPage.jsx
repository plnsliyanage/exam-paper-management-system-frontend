import React, { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

export default function LecturerNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Exam packet for CS1022 has been approved by department.",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message:
        "Reminder: Deadline for CS2032 marks entry is approaching in 3 days.",
      timestamp: "1 day ago",
      read: false,
    },
    {
      id: 3,
      message: "Dr. Perera added feedback notes on packet PKT-2026-02.",
      timestamp: "2 days ago",
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto text-xs">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">
            Stay updated on packet assignments, reviews, and deadline alerts.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold flex items-center gap-1 text-slate-700"
        >
          <CheckCheck className="w-4 h-4 text-brand-600" /> Mark all as read
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 flex items-start gap-3 transition ${notif.read ? "bg-white" : "bg-brand-50/40"}`}
          >
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p
                className={`font-semibold text-slate-800 ${notif.read ? "font-normal" : "font-bold"}`}
              >
                {notif.message}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {notif.timestamp}
              </span>
            </div>
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-brand-600 self-center" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
