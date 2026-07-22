import { useEffect, useState } from "react";

import PacketTable from "../../components/lecturer/PacketTable";

import { getAssignedPackets } from "../../services/lecturerService";

const AssignedPackets = () => {
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    loadPackets();
  }, []);

  const loadPackets = async () => {
    try {
      // Temporary lecturer id
      const lecturerId = 1;

      const data = await getAssignedPackets(lecturerId);

      setPackets(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assigned Exam Packets</h1>

        <p className="text-gray-500 mt-2">
          View all exam paper packets assigned for the current semester.
        </p>
      </div>

      <PacketTable packets={packets} />
    </div>
  );
};

export default AssignedPackets;
