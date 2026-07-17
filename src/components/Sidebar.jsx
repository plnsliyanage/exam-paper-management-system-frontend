import { NavLink, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { sidebarMenus } from "../config/sidebarMenus";

export default function Sidebar() {
  const { getRole, getUsername, logout } = useAuth();
  const navigate = useNavigate();
  const role = getRole();
  const menu = sidebarMenus[role];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!menu) return null;

  return (
    <div className="w-64 min-h-screen bg-[#0f172a] flex flex-col text-white">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#7c4dff] flex items-center justify-center font-bold text-sm">
          ET
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight">ExamTrack</p>
          <p className="text-xs text-white/40">University System</p>
        </div>
      </div>

      {/* Role label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">
          {menu.title}
        </p>
      </div>

      {/* Menu items */}
      <nav className="flex-1 px-3">
        {menu.items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
                isActive
                  ? "bg-[#7c4dff] text-white font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#7c4dff] flex items-center justify-center text-xs font-semibold">
            {getUsername()?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{getUsername()}</p>
            <p className="text-xs text-white/40">{menu.shortTitle}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
        >
          <MdLogout size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}