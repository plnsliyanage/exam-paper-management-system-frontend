import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";

// Lecturer Pages
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerPreviousRecordsPage from "./pages/lecturer/LecturerPreviousRecordsPage";
import LecturerCalendarPage from "./pages/lecturer/LecturerCalendarPage";
import LecturerNotificationsPage from "./pages/lecturer/LecturerNotificationsPage";

// HOD Pages
import HodDepartmentView from "./pages/hod/HodDepartmentView";
import HodDepartmentPacketsPage from "./pages/hod/HodDepartmentPacketsPage";
import HodWorkloadPage from "./pages/hod/HodWorkloadPage";
import HodReportsPage from "./pages/hod/HodReportsPage";
// Reachable from buttons inside HodDepartmentView ("Overdue Packets" /
// "Access Previous Academic Records") but intentionally left out of the
// sidebar, which only lists the 4 required HOD items.
import HodOverduePage from "./pages/hod/HodOverduePage";
import HodPreviousRecordsPage from "./pages/hod/HodPreviousRecordsPage";

function MainLayout() {
  const location = useLocation();

  let roleKey = "lecturer";
  if (location.pathname.startsWith("/hod")) {
    roleKey = "hod";
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      <Sidebar currentRole={roleKey} />
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          {/* Lecturer Routes */}
          <Route path="/lecturer" element={<LecturerDashboard />} />
          <Route
            path="/lecturer/previous"
            element={<LecturerPreviousRecordsPage />}
          />
          <Route path="/lecturer/calendar" element={<LecturerCalendarPage />} />
          <Route
            path="/lecturer/notifications"
            element={<LecturerNotificationsPage />}
          />

          {/* HOD Routes - the 4 sidebar items */}
          <Route path="/hod" element={<HodDepartmentView />} />
          <Route path="/hod/packets" element={<HodDepartmentPacketsPage />} />
          <Route path="/hod/workload" element={<HodWorkloadPage />} />
          <Route path="/hod/reports" element={<HodReportsPage />} />

          {/* HOD Routes - reachable via in-page buttons, not the sidebar */}
          <Route path="/hod/overdue" element={<HodOverduePage />} />
          <Route path="/hod/previous" element={<HodPreviousRecordsPage />} />

          {/* Default Landing / Catch-all */}
          <Route path="/" element={<Navigate to="/hod" replace />} />
          <Route path="*" element={<Navigate to="/hod" replace />} />
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
