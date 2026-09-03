import {
  MdDashboard,
  MdFolder,
  MdAccountTree,
  MdBarChart,
  MdNotifications,
  MdPeople,
  MdSettings,
  MdEvent,
  MdHistory,
  MdWarning,
  MdWork,
} from "react-icons/md";

export const sidebarMenus = {
  ROLE_ADMIN: {
    title: "Assistant Registrar",
    shortTitle: "AR",
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
      { label: "Schedule & Deadlines", icon: MdEvent, path: "/lecturer/calendar" },
      { label: "Previous Records", icon: MdHistory, path: "/lecturer/previous" },
      { label: "Notifications", icon: MdNotifications, path: "/notifications" },
      { label: "Settings", icon: MdSettings, path: "/settings" },
    ],
  },
  ROLE_GUEST: {
    title: "Head of Department",
    shortTitle: "HOD",
    items: [
      { label: "Overview", icon: MdDashboard, path: "/dashboard" },
      { label: "Department Packets", icon: MdFolder, path: "/hod/packets" },
      { label: "Staff Workload", icon: MdWork, path: "/hod/workload" },
      { label: "Department Reports", icon: MdBarChart, path: "/hod/reports" },
      { label: "Overdue Items", icon: MdWarning, path: "/hod/overdue" },
      { label: "Academic Archives", icon: MdHistory, path: "/hod/previous" },
      { label: "Notifications", icon: MdNotifications, path: "/notifications" },
      { label: "Settings", icon: MdSettings, path: "/settings" },
    ],
  },
};
