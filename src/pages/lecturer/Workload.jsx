import { useEffect, useState } from "react";
import { getWorkloadSummary } from "../../api/lecturerApi";
import WorkloadCard from "../../components/lecturer/WorkloadCard";

const Workload = () => {
  const lecturerId = "L001";

  const [workload, setWorkload] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkload();
  }, []);

  const loadWorkload = async () => {
    try {
      const data = await getWorkloadSummary(lecturerId);

      setWorkload(data);
    } catch (error) {
      console.error("Workload loading error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2 className="text-xl font-bold">Loading Workload...</h2>;
  }

  if (!workload) {
    return <h2 className="text-red-500 text-xl">No workload data found</h2>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Workload Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WorkloadCard
          title="Assigned Packets"
          value={workload.assignedPackets}
          color="bg-blue-600"
        />

        <WorkloadCard
          title="Completed Packets"
          value={workload.completedPackets}
          color="bg-green-600"
        />

        <WorkloadCard
          title="Pending Packets"
          value={workload.pendingPackets}
          color="bg-yellow-500"
        />

        <WorkloadCard
          title="Overdue Packets"
          value={workload.overduePackets}
          color="bg-red-600"
        />
      </div>
    </div>
  );
};

export default Workload;
