import DashboardStats from "../../components/lecturer/DashboardStats";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>

        <p className="text-gray-500 mt-2">
          Welcome to the Exam Paper Packet Tracking System.
        </p>
      </div>

      <DashboardStats />
    </div>
  );
};

export default Dashboard;
