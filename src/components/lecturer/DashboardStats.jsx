import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import { getDashboard } from "../../services/lecturerService";

const DashboardStats = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Change this later after login
      const lecturerId = 1;

      const data = await getDashboard(lecturerId);

      setDashboard(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!dashboard) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <DashboardCard
        title="Assigned Packets"
        value={dashboard.totalAssigned}
        color="bg-blue-600"
      />

      <DashboardCard
        title="Pending Tasks"
        value={dashboard.pending}
        color="bg-yellow-500"
      />

      <DashboardCard
        title="Completed Tasks"
        value={dashboard.completed}
        color="bg-green-600"
      />

      <DashboardCard
        title="Overdue Tasks"
        value={dashboard.overdue}
        color="bg-red-600"
      />
    </div>
  );
};

export default DashboardStats;
