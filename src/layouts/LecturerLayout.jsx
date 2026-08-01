import { Outlet } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

const LecturerLayout = () => {
  return (
    <div
      className="
            flex
            min-h-screen
            bg-gray-100
        "
    >
      {/* Sidebar */}

      <Sidebar />

      <div
        className="
                flex-1
            "
      >
        {/* Navbar */}

        <Navbar />

        {/* Page Content */}

        <main
          className="
                    p-6
                "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
