import { Outlet } from "react-router-dom";

const DeanLayout = () => {
  return (
    <div>
      <h1>Dean Layout</h1>

      <Outlet />
    </div>
  );
};

export default DeanLayout;
