import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Lecturer Pages
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import LecturerPacketsPage from './pages/lecturer/LecturerPacketsPage';
import LecturerPreviousRecordsPage from './pages/lecturer/LecturerPreviousRecordsPage';
import LecturerCalendarPage from './pages/lecturer/LecturerCalendarPage';

// HOD Pages
import HodDepartmentView from './pages/hod/HodDepartmentView';
import HodDepartmentPacketsPage from './pages/hod/HodDepartmentPacketsPage';
import HodWorkloadPage from './pages/hod/HodWorkloadPage';
import HodOverduePage from './pages/hod/HodOverduePage';
import HodPreviousRecordsPage from './pages/hod/HodPreviousRecordsPage';
import HodReportsPage from './pages/hod/HodReportsPage';

// AR Pages
import ArOverview from './pages/ar/ArOverview';
import ArUserAndPrintingManagement from './pages/ar/ArUserAndPrintingManagement';
import ArPacketsPage from './pages/ar/ArPacketsPage';
import ArAuditLogsPage from './pages/ar/ArAuditLogsPage';

export default function App() {
  const [role, setRole] = useState('hod');

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
        <Sidebar currentRole={role} setRole={setRole} />
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            {/* Lecturer Routes */}
            <Route path="/lecturer" element={<LecturerDashboard />} />
            <Route path="/lecturer/packets" element={<LecturerPacketsPage />} />
            <Route path="/lecturer/previous" element={<LecturerPreviousRecordsPage />} />
            <Route path="/lecturer/calendar" element={<LecturerCalendarPage />} />

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
<Route path="/ar/printing" element={<ArUserAndPrintingManagement />} />
<Route path="/ar/users" element={<ArUserAndPrintingManagement />} />
<Route path="/ar/logs" element={<ArAuditLogsPage />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={`/${role}`} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}