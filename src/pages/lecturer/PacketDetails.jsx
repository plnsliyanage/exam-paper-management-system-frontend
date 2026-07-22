import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PacketDetailsCard from "../../components/lecturer/PacketDetailsCard";
import UpdateStatusModal from "../../components/lecturer/UpdateStatusModal";
import ScriptCountForm from "../../components/lecturer/ScriptCountForm";

import {
  getPacketDetails,
  updatePacketStatus,
  addScriptCount,
  getMarking,
} from "../../services/lecturerService";

const PacketDetails = () => {
  const { id } = useParams();

  const [packet, setPacket] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [scriptCount, setScriptCount] = useState(0);

  useEffect(() => {
    loadPacketDetails();
  }, []);

  const loadPacketDetails = async () => {
    try {
      const lecturerId = 1;

      const data = await getPacketDetails(id, lecturerId);

      setPacket(data);

      // Load answer script count

      const marking = await getMarking(id);

      if (marking) {
        setScriptCount(marking.scriptCount);
      }
    } catch (error) {
      console.log("Error loading packet", error);
    }
  };

  // Update packet status

  const handleStatusUpdate = async (status) => {
    try {
      await updatePacketStatus(id, status);

      setShowStatusModal(false);

      loadPacketDetails();
    } catch (error) {
      console.log(error);
    }
  };

  // Save answer script count

  const handleScriptSave = async (count) => {
    try {
      const lecturerId = 1;

      const response = await addScriptCount(id, lecturerId, count);

      setScriptCount(response.scriptCount);

      alert("Answer script count saved");
    } catch (error) {
      console.log(error);
    }
  };

  if (!packet) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Exam Packet Details</h1>

          <p className="text-gray-500">View and manage packet information</p>
        </div>

        <button
          onClick={() => setShowStatusModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Status
        </button>
      </div>

      {/* Packet Details */}

      <PacketDetailsCard packet={packet} />

      {/* Answer Script Count */}

      <ScriptCountForm currentCount={scriptCount} onSave={handleScriptSave} />

      {/* Update Status Modal */}

      {showStatusModal && (
        <UpdateStatusModal
          currentStatus={packet.status}
          onUpdate={handleStatusUpdate}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
};

export default PacketDetails;
