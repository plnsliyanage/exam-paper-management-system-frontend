import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MdSearch, MdNotifications } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance"; 

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    sub: "Faculty-wide overview — Semester 2, 2026",
  },
  "/packets": { title: "Packets", sub: "Manage exam packets" },
  "/workflow": { title: "Workflow", sub: "Track packet workflow" },
  "/reports": { title: "Reports", sub: "View reports" },
  "/notifications": { title: "Notifications", sub: "Your notifications" },
  "/users": { title: "User Management", sub: "Manage system users" },
  "/settings": { title: "Settings", sub: "System settings" },
};

export default function DashboardLayout() {
  const { getUsername, getRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageTitles[location.pathname] || { title: "Dashboard", sub: "" };

  const roleLabels = {
    ROLE_ADMIN: "AR",
    ROLE_MODERATOR: "MOD",
    ROLE_USER: "LEC",
    ROLE_GUEST: "HOD",
  };

  const username = getUsername();
  const role = getRole();
  const roleLabel = roleLabels[role] || "";
  const initials = username?.slice(0, 2).toUpperCase();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(() => {
    if (!username) return;
    axiosInstance
      .get("/notifications/unread-count")
      .then((res) => {
        if (res.data && typeof res.data.count === "number") {
          setUnreadCount(res.data.count);
        }
      })
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    fetchUnreadCount();

    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener("notificationsUpdated", handleUpdate);
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      window.removeEventListener("notificationsUpdated", handleUpdate);
      clearInterval(interval);
    };
  }, [fetchUnreadCount, location.pathname]);

  const subtitle =
    location.pathname === "/dashboard" && role === "ROLE_MODERATOR"
      ? "Moderator review workspace — Semester 2, 2026"
      : page.sub;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
          {/* Page title */}
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {page.title}
            </h1>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>


          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search packets, courses..."
                className="bg-transparent text-sm outline-none text-gray-600 w-52"
              />
            </div>

            {/* Notifications */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-lg text-gray-500 hover:text-[#7c4dff] hover:bg-gray-100 transition cursor-pointer"
              title="Notifications"
            >
              <MdNotifications size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#7c4dff] text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm pointer-events-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#7c4dff] flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {username}
                </p>
                <p className="text-xs text-gray-400">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
