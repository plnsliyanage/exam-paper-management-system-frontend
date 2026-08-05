import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const roleKey = user ? user.role.toLowerCase() : "lecturer";

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
                <Sidebar currentRole={roleKey} setRole={() => {}} />
                <main className="flex-1 overflow-x-hidden">
                  <Routes>
                    {/* Lecturer Routes */}
                    <Route path="/lecturer" element={<LecturerDashboard />} />
                    <Route
                      path="/lecturer/packets"
                      element={<LecturerPacketsPage />}
                    />
                    <Route
                      path="/lecturer/previous"
                      element={<LecturerPreviousRecordsPage />}
                    />
                    <Route
                      path="/lecturer/calendar"
                      element={<LecturerCalendarPage />}
                    />

                    {/* HOD Routes */}
                    <Route path="/hod" element={<HodDepartmentView />} />
                    <Route
                      path="/hod/packets"
                      element={<HodDepartmentPacketsPage />}
                    />
                    <Route path="/hod/workload" element={<HodWorkloadPage />} />
                    <Route path="/hod/overdue" element={<HodOverduePage />} />
                    <Route
                      path="/hod/previous"
                      element={<HodPreviousRecordsPage />}
                    />
                    <Route path="/hod/reports" element={<HodReportsPage />} />

                    {/* AR Routes */}
                    <Route path="/ar" element={<ArOverview />} />
                    <Route path="/ar/packets" element={<ArPacketsPage />} />
                    <Route
                      path="/ar/printing"
                      element={<ArUserAndPrintingManagement />}
                    />
                    <Route
                      path="/ar/users"
                      element={<ArUserAndPrintingManagement />}
                    />
                    <Route path="/ar/logs" element={<ArAuditLogsPage />} />

                    {/* Catch-all redirect */}
                    <Route
                      path="*"
                      element={<Navigate to={`/${roleKey}`} replace />}
                    />
                  </Routes>
                </main>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}
