import { Routes, Route, Navigate } from "react-router-dom";

import LecturerLayout from "../layouts/LecturerLayout";
import Dashboard from "../pages/lecturer/Dashboard";
import AssignedPackets from "../pages/lecturer/AssignedPackets";
import PacketDetails from "../pages/lecturer/PacketDetails";
import AddMarking from "../pages/lecturer/AddMarking";
import PreviousPackets from "../pages/lecturer/PreviousPackets";
import PacketMovementHistory from "../pages/lecturer/PacketMovementHistory";
import Notifications from "../pages/lecturer/Notifications";
import Workload from "../pages/lecturer/Workload";
import Calendar from "../pages/lecturer/Calendar";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lecturer/dashboard" replace />} />

      <Route path="/lecturer" element={<LecturerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="packets" element={<AssignedPackets />} />
        <Route path="packets/:packetId" element={<PacketDetails />} />
        <Route path="marking" element={<AddMarking />} />
        <Route path="previous" element={<PreviousPackets />} />
        <Route
          path="packets/:packetId/movements"
          element={<PacketMovementHistory />}
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="workload" element={<Workload />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
