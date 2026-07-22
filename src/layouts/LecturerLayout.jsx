import { Outlet } from "react-router-dom";
import LecturerNavbar from "../components/lecturer/LecturerNavbar";
import LecturerSidebar from "../components/lecturer/LecturerSidebar";

const LecturerLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <LecturerSidebar />

      <div style={{ flex: 1 }}>
        <LecturerNavbar />

        <main style={{ padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
