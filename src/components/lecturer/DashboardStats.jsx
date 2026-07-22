import DashboardCard from "./DashboardCard";

const DashboardStats = () => {
  const stats = [
    {
      title: "Assigned Packets",
      value: 15,
      color: "bg-blue-600",
    },
    {
      title: "Pending Tasks",
      value: 5,
      color: "bg-yellow-500",
    },
    {
      title: "Completed Tasks",
      value: 8,
      color: "bg-green-600",
    },
    {
      title: "Overdue Tasks",
      value: 2,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => (
        <DashboardCard
          key={item.title}
          title={item.title}
          value={item.value}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
