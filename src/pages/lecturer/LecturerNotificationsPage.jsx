import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { lecturerApi } from "../../services/api";

export default function LecturerNotificationsPage() {
  // Temporary user ID until login/authentication is implemented
  const USER_ID = "U1";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(`Loading notifications for user: ${USER_ID}`);

      const response = await lecturerApi.getNotifications(USER_ID);

      console.log("Notification API response:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];

      const formattedNotifications = data.map((notification) => ({
        id: notification.notificationId,
        message: notification.message,
        type: notification.type,
        status: notification.status,
        createdAt: notification.createdAt,

        // Backend status should be READ or UNREAD
        read: notification.status === "READ",
      }));

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);

      if (err.response) {
        console.error("Backend response:", err.response.data);
        console.error("Status:", err.response.status);
      } else if (err.request) {
        console.error("No response received from backend.");
      }

      setError(
        "Unable to load notifications. Please check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE / TIME
  // =========================================================
  const formatTimestamp = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }

    const now = new Date();

    const differenceInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000,
    );

    if (differenceInSeconds < 0) {
      return date.toLocaleString();
    }

    if (differenceInSeconds < 60) {
      return "Just now";
    }

    if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);

      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (differenceInSeconds < 86400) {
      const hours = Math.floor(differenceInSeconds / 3600);

      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (differenceInSeconds < 604800) {
      const days = Math.floor(differenceInSeconds / 86400);

      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    return date.toLocaleDateString();
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================
  const markAllAsRead = () => {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        read: true,
        status: "READ",
      })),
    );
  };

  // =========================================================
  // COUNT UNREAD NOTIFICATIONS
  // =========================================================
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="min-h-full bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                <Bell className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Notifications
                </h1>

                <p className="text-sm text-slate-500">
                  Stay updated on packet assignments, reviews, and deadline
                  alerts.
                </p>
              </div>
            </div>

            {/* Temporary user information */}
            <p className="text-xs text-slate-400 mt-2 ml-1">
              Logged in as lecturer: <strong>{USER_ID}</strong>
            </p>
          </div>

          {/* MARK ALL AS READ */}
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || loading}
            className={`px-4 py-2 rounded-xl border font-semibold
              flex items-center justify-center gap-2 transition
              ${
                unreadCount === 0 || loading
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
            {unreadCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />

              <p className="text-sm text-slate-500 mt-3">
                Loading notifications...
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-50 text-red-500">
                <Bell className="w-6 h-6" />
              </div>

              <h3 className="font-semibold text-red-700 mt-4">
                Unable to load notifications
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-md">{error}</p>

              <button
                type="button"
                onClick={fetchNotifications}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl
                           flex items-center gap-2 hover:bg-brand-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}
        {!loading && !error && notifications.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-slate-100 text-slate-400">
                <Bell className="w-8 h-8" />
              </div>

              <h3 className="font-semibold text-slate-700 mt-4">
                No notifications
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                You don't have any notifications at the moment.
              </p>

              <button
                type="button"
                onClick={fetchNotifications}
                className="mt-4 px-4 py-2 border border-slate-200
                             rounded-xl text-slate-600 hover:bg-slate-50
                             flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            NOTIFICATIONS LIST
        ====================================================== */}
        {!loading && !error && notifications.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {notifications.map((notification, index) => (
              <div
                key={notification.id || index}
                className={`
                    p-4 md:p-5
                    flex items-start gap-4
                    transition
                    border-b border-slate-100
                    last:border-b-0
                    ${notification.read ? "bg-white" : "bg-brand-50/40"}
                  `}
              >
                {/* =================================================
                      NOTIFICATION ICON
                  ================================================== */}
                <div
                  className={`
                      flex-shrink-0
                      p-2.5
                      rounded-xl
                      ${
                        notification.read
                          ? "bg-slate-100 text-slate-500"
                          : "bg-brand-50 text-brand-600"
                      }
                    `}
                >
                  <Bell className="w-5 h-5" />
                </div>

                {/* =================================================
                      NOTIFICATION CONTENT
                  ================================================== */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`
                          text-sm leading-6
                          ${
                            notification.read
                              ? "font-normal text-slate-700"
                              : "font-semibold text-slate-900"
                          }
                        `}
                    >
                      {notification.message}
                    </p>

                    {/* UNREAD DOT */}
                    {!notification.read && (
                      <span
                        className="flex-shrink-0
                                     w-2.5 h-2.5
                                     rounded-full
                                     bg-brand-600
                                     mt-2"
                      />
                    )}
                  </div>

                  {/* =================================================
                        TYPE + TIME
                    ================================================== */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {notification.type && (
                      <span
                        className="text-[10px]
                                     uppercase
                                     tracking-wide
                                     font-semibold
                                     px-2 py-1
                                     rounded-md
                                     bg-slate-100
                                     text-slate-500"
                      >
                        {notification.type}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            REFRESH BUTTON
        ====================================================== */}
        {!loading && !error && notifications.length > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={fetchNotifications}
              className="px-4 py-2
                         bg-white
                         border border-slate-200
                         rounded-xl
                         text-sm font-medium
                         text-slate-600
                         hover:bg-slate-50
                         flex items-center gap-2
                         transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
