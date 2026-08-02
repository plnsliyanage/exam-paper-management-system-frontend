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
    return <h2 className="text-xl font-semibold">Loading Packet Details...</h2>;
  }

  if (!packet) {
    return (
      <h2 className="text-xl font-semibold text-red-500">Packet Not Found</h2>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-8">Packet Details</h1>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="font-semibold">Packet ID</p>
          <p>{packet.packetId}</p>
        </div>

        <div>
          <p className="font-semibold">Course Code</p>
          <p>{packet.courseCode}</p>
        </div>

        <div>
          <p className="font-semibold">Course Name</p>
          <p>{packet.courseName}</p>
        </div>

        <div>
          <p className="font-semibold">Department</p>
          <p>{packet.departmentName}</p>
        </div>

        <div>
          <p className="font-semibold">Academic Year</p>
          <p>{packet.academicYear}</p>
        </div>

        <div>
          <p className="font-semibold">Semester</p>
          <p>{packet.semester}</p>
        </div>

        <div>
          <p className="font-semibold">Deadline</p>
          <p>{packet.deadline}</p>
        </div>

        <div>
          <p className="font-semibold">Status</p>
          <p>{packet.status}</p>
        </div>

        <div>
          <p className="font-semibold">Current Holder</p>
          <p>{packet.currentHolderName}</p>
        </div>
      </div>
    </div>
  );
};

export default PacketDetails;
