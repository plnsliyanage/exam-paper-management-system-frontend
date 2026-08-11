import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ currentRole }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Define navigation links based on current role
  const getNavLinks = () => {
    switch (currentRole) {
      case "lecturer":
        return [
          { name: "Dashboard", path: "/lecturer" },
          { name: "Packets", path: "/lecturer/packets" },
          { name: "Previous Records", path: "/lecturer/previous" },
          { name: "Calendar", path: "/lecturer/calendar" },
          { name: "Notifications", path: "/lecturer/notifications" },
        ];
      case "hod":
        return [
          { name: "Department View", path: "/hod" },
          { name: "Packets", path: "/hod/packets" },
          { name: "Workload", path: "/hod/workload" },
          { name: "Overdue", path: "/hod/overdue" },
          { name: "Previous Records", path: "/hod/previous" },
          { name: "Reports", path: "/hod/reports" },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
          Exam System
        </h1>
        <p className="text-xs text-slate-500 mt-1 capitalize">
          Role: {currentRole}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
