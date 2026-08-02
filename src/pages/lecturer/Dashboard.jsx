import { useEffect, useState } from "react";
import DashboardCard from "../../components/lecturer/DashboardCard";
import { getDashboard } from "../../api/lecturerApi";

const Dashboard = () => {
  const lecturerId = "U1"; // Replace with logged-in lecturer ID later

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard(lecturerId);
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Assigned Packets"
          value={dashboard?.assignedPackets ?? 0}
        />

        <DashboardCard
          title="Pending Tasks"
          value={dashboard?.pendingTasks ?? 0}
        />

        <DashboardCard
          title="Completed Tasks"
          value={dashboard?.completedTasks ?? 0}
        />

        <DashboardCard
          title="Overdue Tasks"
          value={dashboard?.overdueTasks ?? 0}
        />
      </div>
    </div>
  );
};

export default Dashboard;
