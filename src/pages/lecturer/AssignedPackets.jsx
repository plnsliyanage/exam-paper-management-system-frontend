import { useEffect, useState } from "react";
import { getAssignedPackets } from "../../api/lecturerApi";
import PacketCard from "../../components/lecturer/PacketCard";

const AssignedPackets = () => {
  const lecturerId = "U1";

  const [packets, setPackets] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackets();
  }, []);

  const loadPackets = async () => {
    try {
      const data = await getAssignedPackets(lecturerId);

      setPackets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading Packets...</h2>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Assigned Packets</h1>

      <div className="grid gap-6">
        {packets.map((packet) => (
          <PacketCard key={packet.packetId} packet={packet} />
        ))}
      </div>
    </div>
  );
};

export default AssignedPackets;
