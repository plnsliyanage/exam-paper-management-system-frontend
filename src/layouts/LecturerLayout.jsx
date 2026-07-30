import { Outlet } from "react-router-dom";

const LecturerLayout = () => {
  return (
    <div>
      <h1>Lecturer Layout</h1>

      <Outlet />
    </div>
  );
};

export default LecturerLayout;
