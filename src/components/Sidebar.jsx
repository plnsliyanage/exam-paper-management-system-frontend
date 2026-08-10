import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Printer,
  Users,
  BarChart3,
  ClipboardList,
  History,
  FileSpreadsheet,
  Bell,
  LogOut,
} from "lucide-react";

export default function Sidebar({ currentRole }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session/storage if applicable
    localStorage.removeItem("user");
    // Redirect to login or home route
    navigate("/login");
  };

  const roleMenus = {
    lecturer: [
      { name: "Dashboard", path: "/lecturer", icon: LayoutDashboard },

      { name: "Previous Records", path: "/lecturer/previous", icon: History },
      {
        name: "Calendar & Deadlines",
        path: "/lecturer/calendar",
        icon: Calendar,
      },
      { name: "Notifications", path: "/lecturer/notifications", icon: Bell },
    ],
    hod: [
      { name: "Overview", path: "/hod", icon: LayoutDashboard },
      { name: "Department Packets", path: "/hod/packets", icon: FileText },
      {
        name: "Workload & Performance",
        path: "/hod/workload",
        icon: BarChart3,
      },
      { name: "Overdue Monitoring", path: "/hod/overdue", icon: ClipboardList },
      { name: "Previous Records", path: "/hod/previous", icon: History },
      {
        name: "Reports & Analytics",
        path: "/hod/reports",
        icon: FileSpreadsheet,
      },
    ],
    ar: [
      { name: "Faculty Overview", path: "/ar", icon: LayoutDashboard },
      { name: "Packet Management", path: "/ar/packets", icon: FileText },
      { name: "Printing Schedule", path: "/ar/printing", icon: Printer },
      { name: "User Management", path: "/ar/users", icon: Users },
      { name: "Audit Logs", path: "/ar/logs", icon: History },
    ],
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wide">
          ExamFlow Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Academic Packet Management
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {roleMenus[currentRole]?.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${currentRole}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="text-xs text-slate-500">
          Logged in as:{" "}
          <span className="text-slate-300 font-medium capitalize">
            {currentRole}_01
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
