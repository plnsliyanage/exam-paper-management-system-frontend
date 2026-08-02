const WorkloadCard = ({ title, value, color }) => {
  return (
    <div
      className={`
                rounded-lg
                shadow-md
                p-6
                text-white
                ${color}
            `}
    >
      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="text-4xl font-bold mt-4">{value}</p>
    </div>
  );
};

export default WorkloadCard;
