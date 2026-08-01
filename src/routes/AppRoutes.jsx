import { Routes, Route, Navigate } from "react-router-dom";

import LecturerLayout from "../layouts/LecturerLayout";
import Dashboard from "../pages/lecturer/Dashboard";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirect to dashboard */}
      <Route path="/" element={<Navigate to="/lecturer/dashboard" replace />} />

      {/* Lecturer Routes */}
      <Route path="/lecturer" element={<LecturerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
