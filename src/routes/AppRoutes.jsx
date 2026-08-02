import { Routes, Route, Navigate } from "react-router-dom";

import LecturerLayout from "../layouts/LecturerLayout";
import Dashboard from "../pages/lecturer/Dashboard";
import AssignedPackets from "../pages/lecturer/AssignedPackets";
import PacketDetails from "../pages/lecturer/PacketDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lecturer/dashboard" replace />} />

      <Route path="/lecturer" element={<LecturerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="packets" element={<AssignedPackets />} />
        <Route path="packets/:packetId" element={<PacketDetails />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
