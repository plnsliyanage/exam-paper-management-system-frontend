import {
  MdDashboard,
  MdFolder,
  MdAccountTree,
  MdBarChart,
  MdNotifications,
  MdPeople,
  MdSettings,
} from "react-icons/md";

export const sidebarMenus = {
  ROLE_ADMIN: {
    title: "Assistant Registrar",
    shortTile: "AR",
    items: [
      { label: "Dashboard", icon: MdDashboard, path: "/dashboard" },
      { label: "Packets", icon: MdFolder, path: "/packets" },
      { label: "Workflow", icon: MdAccountTree, path: "/workflow" },
      { label: "Reports", icon: MdBarChart, path: "/reports" },
      { label: "Notifications", icon: MdNotifications, path: "/notifications" },
      { label: "User Management", icon: MdPeople, path: "/users" },
      { label: "Settings", icon: MdSettings, path: "/settings" },
    ],
  },
  ROLE_MODERATOR: {
    title: "Moderator",
    shortTitle: "MOD",
    items: [
      { label: "Dashboard", icon: MdDashboard, path: "/dashboard" },
      { label: "Packets", icon: MdFolder, path: "/packets" },
      { label: "Workflow", icon: MdAccountTree, path: "/workflow" },
      { label: "Notifications", icon: MdNotifications, path: "/notifications" },
      { label: "Settings", icon: MdSettings, path: "/settings" },
    ],
  },
  ROLE_USER: {
    title: "Lecturer",
    shortTitle: "LEC",
    items: [
      { label: "Dashboard", icon: MdDashboard, path: "/dashboard" },
      { label: "Packets", icon: MdFolder, path: "/packets" },
      { label: "Notifications", icon: MdNotifications, path: "/notifications" },
      { label: "Settings", icon: MdSettings, path: "/settings" },
    ],
  },
  ROLE_GUEST: {
    title: "Head of Department",
    shortTitle: "HOD",
    items: [
      { label: "Dashboard", icon: MdDashboard, path: "/dashboard" },
      { label: "Packets", icon: MdFolder, path: "/packets" },
      { label: "Reports", icon: MdBarChart, path: "/reports" },
      { label: "Notifications", icon: MdNotifications, path: "/notifications" },
      { label: "Settings", icon: MdSettings, path: "/settings" },
    ],
  },
};
