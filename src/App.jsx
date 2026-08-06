import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/DashboardLayout";
import "./index.css";
import ARDashboard from "./pages/AR/Dashboard";
import Packets from "./pages/Packets";
import PacketDetail from "./pages/PacketDetail";
import Workflow from "./pages/Workflow";
import Reports from "./pages/Reports";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
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
        <Route path="/dashboard" element={<ARDashboard />} />
        <Route path="/packets" element={<Packets />} />
        <Route path="/packets/:id" element={<PacketDetail />} />
        <Route path="/packets" element={<div className="text-xl font-semibold">Packets</div>} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<div className="text-xl font-semibold">Notifications</div>} />
        <Route path="/users" element={<div className="text-xl font-semibold">User Management</div>} />
        <Route path="/settings" element={<div className="text-xl font-semibold">Settings</div>} />
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