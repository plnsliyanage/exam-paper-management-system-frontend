import { Routes, Route } from "react-router-dom";

import LecturerLayout from "./layouts/LecturerLayout";

import Dashboard from "./pages/lecturer/Dashboard";
import AssignedPackets from "./pages/lecturer/AssignedPackets";
import PacketDetails from "./pages/lecturer/PacketDetails";
import PreviousRecords from "./pages/lecturer/PreviousRecords";
import MarkingProcess from "./pages/lecturer/MarkingProcess";
import Notifications from "./pages/lecturer/Notifications";
import Calendar from "./pages/lecturer/Calendar";

function App() {
  return (
    <Routes>
      <Route path="/lecturer" element={<LecturerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="packets" element={<AssignedPackets />} />

        <Route path="packets/:id" element={<PacketDetails />} />

        <Route path="records" element={<PreviousRecords />} />

        <Route path="marking" element={<MarkingProcess />} />

        <Route path="calendar" element={<Calendar />} />

        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}

export default App;
