import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/DashboardLayout";
import "./index.css";
import ARDashboard from "./pages/AR/Dashboard";
import ModeratorDashboard from "./pages/Moderator/Dashboard";
import Packets from "./pages/Packets";
import PacketDetail from "./pages/PacketDetail";
import Workflow from "./pages/Workflow";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import UserManagement from "./pages/AR/UserManagement";
import AddPacket from "./pages/AR/AddPacket";
import AddUser from "./pages/AR/AddUser";
import CourseManagement from "./pages/CourseManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import PrintingSchedule from "./pages/PrintingSchedule";

// Lecturer Pages
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerCalendarPage from "./pages/lecturer/LecturerCalendarPage";
import LecturerNotificationsPage from "./pages/lecturer/LecturerNotificationsPage";
import LecturerPreviousRecordsPage from "./pages/lecturer/LecturerPreviousRecordsPage";

// HOD Pages
import HodDepartmentView from "./pages/hod/HodDepartmentView";
import HodDepartmentPacketsPage from "./pages/hod/HodDepartmentPacketsPage";
import HodWorkloadPage from "./pages/hod/HodWorkloadPage";
import HodReportsPage from "./pages/hod/HodReportsPage";
import HodOverduePage from "./pages/hod/HodOverduePage";
import HodPreviousRecordsPage from "./pages/hod/HodPreviousRecordsPage";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { token, getRole } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role !== "ROLE_ADMIN" && role !== "ROLE_SYSTEM_ADMIN") return <Navigate to="/packets" replace />;
  return children;
}

function SystemAdminRoute({ children }) {
  const { token, getRole } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role !== "ROLE_SYSTEM_ADMIN") return <Navigate to="/packets" replace />;
  return children;
}

function RoleBasedDashboard() {
  const { getRole } = useAuth();
  const role = getRole();
  if (role === "ROLE_MODERATOR" || role === "ROLE_USER") {
    return <LecturerDashboard />;
  }
  if (role === "ROLE_GUEST") {
    return <HodDepartmentView />;
  }
  return <ARDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleBasedDashboard />} />

        <Route path="/packets" element={<Packets />} />
        <Route path="/packets/:id" element={<PacketDetail />} />

        <Route path="/packets/add" element={<SystemAdminRoute><AddPacket /></SystemAdminRoute>} />
        <Route path="/packets/edit/:id" element={<SystemAdminRoute><AddPacket /></SystemAdminRoute>} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/users/add" element={<SystemAdminRoute><AddUser /></SystemAdminRoute>} />
        <Route path="/users/edit/:id" element={<SystemAdminRoute><AddUser /></SystemAdminRoute>} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/departments" element={<DepartmentManagement />} />
        <Route path="/printing/schedule" element={<PrintingSchedule />} />

        {/* Lecturer specific routes */}
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
        <Route path="/lecturer/calendar" element={<LecturerCalendarPage />} />
        <Route path="/lecturer/notifications" element={<LecturerNotificationsPage />} />
        <Route path="/lecturer/previous" element={<LecturerPreviousRecordsPage />} />

        {/* HOD specific routes */}
        <Route path="/hod/dashboard" element={<HodDepartmentView />} />
        <Route path="/hod/packets" element={<HodDepartmentPacketsPage />} />
        <Route path="/hod/courses" element={<CourseManagement isHod={true} />} />
        <Route path="/hod/department" element={<DepartmentManagement isHod={true} />} />
        <Route path="/hod/workload" element={<HodWorkloadPage />} />
        <Route path="/hod/reports" element={<HodReportsPage />} />
        <Route path="/hod/overdue" element={<HodOverduePage />} />
        <Route path="/hod/previous" element={<HodPreviousRecordsPage />} />

        <Route
          path="/settings"
          element={<div className="text-xl font-semibold">Settings</div>}
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

