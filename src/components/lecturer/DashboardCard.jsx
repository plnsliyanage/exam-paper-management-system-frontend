const DashboardCard = ({ title, value, color }) => {
  return (
    <div className={`rounded-xl shadow-md p-6 text-white ${color}`}>
      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="text-4xl font-bold mt-4">{value}</p>
    </div>
  );
};

export default DashboardCard;
