import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Lecturer Pages
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerPacketsPage from "./pages/lecturer/LecturerPacketsPage";
import LecturerPreviousRecordsPage from "./pages/lecturer/LecturerPreviousRecordsPage";
import LecturerCalendarPage from "./pages/lecturer/LecturerCalendarPage";
import LecturerNotificationsPage from "./pages/lecturer/LecturerNotificationsPage";

// HOD Pages
import HodDepartmentView from "./pages/hod/HodDepartmentView";
import HodDepartmentPacketsPage from "./pages/hod/HodDepartmentPacketsPage";
import HodWorkloadPage from "./pages/hod/HodWorkloadPage";
import HodOverduePage from "./pages/hod/HodOverduePage";
import HodPreviousRecordsPage from "./pages/hod/HodPreviousRecordsPage";
import HodReportsPage from "./pages/hod/HodReportsPage";

// AR Pages
import ArOverview from "./pages/ar/ArOverview";
import ArUserAndPrintingManagement from "./pages/ar/ArUserAndPrintingManagement";
import ArPacketsPage from "./pages/ar/ArPacketsPage";
import ArAuditLogsPage from "./pages/ar/ArAuditLogsPage";

// A sub-component to safely use useLocation inside Router
function MainLayout() {
  const location = useLocation();
  const [user, setUser] = useState({ name: "Mock User", role: "lecturer" });

  // Automatically switch sidebar role based on what URL you are currently visiting!
  let roleKey = "lecturer";
  if (location.pathname.startsWith("/hod")) {
    roleKey = "hod";
  } else if (location.pathname.startsWith("/ar")) {
    roleKey = "ar";
  } else if (location.pathname.startsWith("/lecturer")) {
    roleKey = "lecturer";
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      <Sidebar currentRole={roleKey} />
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Lecturer Routes */}
          <Route path="/lecturer" element={<LecturerDashboard />} />
          <Route path="/lecturer/packets" element={<LecturerPacketsPage />} />
          <Route
            path="/lecturer/previous"
            element={<LecturerPreviousRecordsPage />}
          />
          <Route path="/lecturer/calendar" element={<LecturerCalendarPage />} />
          <Route
            path="/lecturer/notifications"
            element={<LecturerNotificationsPage />}
          />

          {/* HOD Routes */}
          <Route path="/hod" element={<HodDepartmentView />} />
          <Route path="/hod/packets" element={<HodDepartmentPacketsPage />} />
          <Route path="/hod/workload" element={<HodWorkloadPage />} />
          <Route path="/hod/overdue" element={<HodOverduePage />} />
          <Route path="/hod/previous" element={<HodPreviousRecordsPage />} />
          <Route path="/hod/reports" element={<HodReportsPage />} />

          {/* AR Routes */}
          <Route path="/ar" element={<ArOverview />} />
          <Route path="/ar/packets" element={<ArPacketsPage />} />
          <Route
            path="/ar/printing"
            element={<ArUserAndPrintingManagement />}
          />
          <Route path="/ar/users" element={<ArUserAndPrintingManagement />} />
          <Route path="/ar/logs" element={<ArAuditLogsPage />} />

          {/* Default Landing / Catch-all */}
          <Route path="/" element={<Navigate to="/lecturer" replace />} />
          <Route path="*" element={<Navigate to="/lecturer" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
