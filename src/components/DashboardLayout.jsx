import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MdSearch, MdNotifications, MdHistory, MdArrowForward } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useAcademicCycle } from "../context/AcademicCycleContext";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const pageTitles = {
  "/dashboard": {
    title: "Dashboard",
    sub: "Faculty-wide overview",
  },
  "/packets": { title: "Packets", sub: "Manage exam packets" },
  "/workflow": { title: "Workflow", sub: "Track packet workflow" },
  "/courses": { title: "Course Management", sub: "Manage courses and departmental curriculum" },
  "/hod/courses": { title: "Department Courses", sub: "Manage courses and curriculum for your department" },
  "/departments": { title: "Department Management", sub: "Manage university departments and academic leadership" },
  "/hod/department": { title: "Department Profile", sub: "Overview of your department staff, courses, and examination workload" },
  "/reports": { title: "Reports", sub: "View reports & multi-semester analytics" },
  "/notifications": { title: "Notifications", sub: "Your notifications" },
  "/users": { title: "User Management", sub: "Manage system users" },
  "/settings": { title: "Settings", sub: "System settings" },
};

export default function DashboardLayout() {
  const { getUsername, getRole } = useAuth();
  const {
    cycles,
    activeCycle,
    selectedCycleId,
    selectedCycle,
    selectCycle,
    isHistoricalView,
  } = useAcademicCycle();

  const location = useLocation();
  const navigate = useNavigate();
  const page = pageTitles[location.pathname] || { title: "Dashboard", sub: "" };

  const roleLabels = {
    ROLE_ADMIN: "AR",
    ROLE_MODERATOR: "MOD",
    ROLE_USER: "LEC",
    ROLE_GUEST: "HOD",
    ROLE_SYSTEM_ADMIN: "SYS",
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
      .catch(() => { });
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

  const cycleSubtitle = selectedCycle ? `Cycle: ${selectedCycle.cycleName || selectedCycle.cycleId}` : "";
  const subtitle =
    location.pathname === "/dashboard" && (role === "ROLE_USER" || role === "ROLE_MODERATOR")
      ? `Lecturer & moderation workspace — ${cycleSubtitle}`
      : `${page.sub} ${cycleSubtitle ? `— ${cycleSubtitle}` : ""}`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 gap-4">
          {/* Page title */}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-800 leading-tight truncate">
              {page.title}
            </h1>
            <p className="text-xs text-gray-400 truncate">{subtitle}</p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Academic Cycle: Editable for System Admin, Read-only badge for other users */}
            {role === "ROLE_SYSTEM_ADMIN" ? (
              <div className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-2.5 py-1.5 transition shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Semester:
                </span>
                <select
                  value={selectedCycleId}
                  onChange={(e) => selectCycle(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-800 outline-none cursor-pointer pr-1"
                >
                  {cycles.map((c) => (
                    <option key={c.cycleId} value={c.cycleId}>
                      {c.cycleName || c.cycleId} {c.status === "ACTIVE" ? "🟢 [Active]" : `📁 [${c.status}]`}
                    </option>
                  ))}
                  <option value="ALL">All Semesters / All Time</option>
                </select>

                {selectedCycle && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      selectedCycle.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {selectedCycle.status}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Semester:
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {selectedCycle?.cycleName || selectedCycle?.cycleId || activeCycle?.cycleName || "Active Semester"}
                </span>
                {selectedCycle && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      selectedCycle.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selectedCycle.status}
                  </span>
                )}
              </div>
            )}

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <MdSearch size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search packets, courses..."
                className="bg-transparent text-sm outline-none text-gray-600 w-44"
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
            <div className="flex items-center gap-2 cursor-pointer pl-1">
              <div className="w-8 h-8 rounded-full bg-[#7c4dff] flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                {initials}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-700 leading-tight">
                  {username}
                </p>
                <p className="text-xs text-gray-400">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Historical Archive Notice Banner */}
        {isHistoricalView && selectedCycle && (
          <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-between text-xs font-medium shadow-xs shrink-0">
            <div className="flex items-center gap-2">
              <MdHistory size={16} className="shrink-0" />
              <span>
                <strong>Historical Archive View:</strong> Viewing data for{" "}
                <strong>{selectedCycle.cycleName || selectedCycle.cycleId}</strong> (Archived / Completed).
              </span>
            </div>
            {activeCycle && (
              <button
                onClick={() => selectCycle(activeCycle.cycleId)}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-3 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
              >
                <span>Switch to Active Semester</span>
                <MdArrowForward size={14} />
              </button>
            )}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

