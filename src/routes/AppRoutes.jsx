import { Routes, Route } from "react-router-dom";

// Lecturer Pages
import LecturerDashboard from "../pages/lecturer/Dashboard";

// HOD Pages
import HodDashboard from "../pages/hod/Dashboard";

// Dean Pages
import DeanDashboard from "../pages/dean/Dashboard";

// Layouts
import LecturerLayout from "../layouts/LecturerLayout";
import HodLayout from "../layouts/HodLayout";
import DeanLayout from "../layouts/DeanLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Lecturer Routes */}

      <Route path="/lecturer" element={<LecturerLayout />}>
        <Route path="dashboard" element={<LecturerDashboard />} />
      </Route>

      {/* HOD Routes */}

      <Route path="/hod" element={<HodLayout />}>
        <Route path="dashboard" element={<HodDashboard />} />
      </Route>

      {/* Dean Routes */}

      <Route path="/dean" element={<DeanLayout />}>
        <Route path="dashboard" element={<DeanDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
