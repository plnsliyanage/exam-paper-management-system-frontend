import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPacketDetails, updatePacketStatus } from "../../api/lecturerApi";

const PacketDetails = () => {
  const { packetId } = useParams();

  const [packet, setPacket] = useState(null);

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacket();
  }, []);

  const loadPacket = async () => {
    try {
      const data = await getPacketDetails(packetId);

      setPacket(data);

      setStatus(data.status);
    } catch (error) {
      console.error("Packet loading error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updatePacketStatus(packet.packetId, status);

      alert("Packet status updated successfully");

      loadPacket();
    } catch (error) {
      console.error(error);

      alert("Status update failed");
    }
  };

  if (loading) {
    return <h2 className="text-xl font-bold">Loading Packet Details...</h2>;
  }

  if (!packet) {
    return <h2 className="text-red-500 text-xl">Packet Not Found</h2>;
  }

  return (
    <div
      className="
            max-w-5xl 
            mx-auto 
            bg-white 
            shadow-lg 
            rounded-lg 
            p-8
        "
    >
      <h1
        className="
                text-3xl
                font-bold
                mb-8
            "
      >
        Packet Details
      </h1>

      <div
        className="
                grid
                grid-cols-2
                gap-6
            "
      >
        <Detail label="Packet ID" value={packet.packetId} />

        <Detail label="Course Code" value={packet.courseCode} />

        <Detail label="Course Name" value={packet.courseName} />

        <Detail label="Department" value={packet.departmentName} />

        <Detail label="Academic Year" value={packet.academicYear} />

        <Detail label="Semester" value={packet.semester} />

        <Detail label="Deadline" value={packet.deadline} />

        <Detail label="Current Holder" value={packet.currentHolderName} />

        <Detail label="Current Status" value={packet.status} />
      </div>

      {/* STATUS UPDATE */}

      <div
        className="
                mt-10
                border-t
                pt-6
            "
      >
        <h2
          className="
                    text-xl
                    font-bold
                    mb-4
                "
        >
          Update Packet Status
        </h2>

        <select
          className="
                        border
                        rounded
                        p-3
                        w-64
                    "
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="RECEIVED">RECEIVED</option>

          <option value="MARKING">MARKING</option>

          <option value="COMPLETED">COMPLETED</option>

          <option value="SUBMITTED">SUBMITTED</option>
        </select>

        <button
          onClick={handleStatusUpdate}
          className="
                        ml-4
                        bg-blue-600
                        text-white
                        px-6
                        py-3
                        rounded
                        hover:bg-blue-700
                    "
        >
          Update Status
        </button>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => {
  return (
    <div>
      <p
        className="
                font-semibold
            "
      >
        {label}
      </p>

      <p
        className="
                text-gray-700
            "
      >
        {value || "-"}
      </p>
    </div>
  );
};

export default PacketDetails;
