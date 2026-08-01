import DashboardCard from "../../components/lecturer/DashboardCard";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Assigned Packets" value="12" />

        <DashboardCard title="Pending Tasks" value="5" />

        <DashboardCard title="Completed Tasks" value="18" />

        <DashboardCard title="Overdue Tasks" value="2" />
      </div>
    </div>
  );
};

export default Dashboard;
