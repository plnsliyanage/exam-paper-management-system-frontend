import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPacketDetails } from "../../api/lecturerApi";

const PacketDetails = () => {
  const { packetId } = useParams();

  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacket();
  }, []);

  const loadPacket = async () => {
    try {
      const data = await getPacketDetails(packetId);
      setPacket(data);
    } catch (error) {
      console.error("Failed to load packet details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading Packet Details...</h2>;
  }

  if (!packet) {
    return <h2>Packet not found.</h2>;
  }

  return (
    <div className="max-w-3xl bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-6">Packet Details</h1>

      <div className="space-y-3">
        <p>
          <strong>Packet ID:</strong> {packet.packetId}
        </p>
        <p>
          <strong>Course Code:</strong> {packet.courseCode}
        </p>
        <p>
          <strong>Course Name:</strong> {packet.courseName}
        </p>
        <p>
          <strong>Department:</strong> {packet.department}
        </p>
        <p>
          <strong>Deadline:</strong> {packet.deadline}
        </p>
        <p>
          <strong>Status:</strong> {packet.status}
        </p>
        <p>
          <strong>Current Holder:</strong> {packet.currentHolder}
        </p>
      </div>
    </div>
  );
};

export default PacketDetails;
