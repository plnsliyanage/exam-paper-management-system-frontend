import { Link } from "react-router-dom";

const LecturerSidebar = () => {
  return (
    <div
      style={{
        width: "250px",
        background: "#1f2937",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>Lecturer</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <Link to="/lecturer/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/lecturer/packets">Assigned Packets</Link>
        </li>
        <li>
          <Link to="/lecturer/records">Previous Records</Link>
        </li>
        <li>
          <Link to="/lecturer/marking">Marking Process</Link>
        </li>
        <li>
          <Link to="/lecturer/calendar">Calendar</Link>
        </li>
        <li>
          <Link to="/lecturer/notifications">Notifications</Link>
        </li>
      </ul>
    </div>
  );
};

export default LecturerSidebar;
