import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import PacketDetailsCard from "../../components/lecturer/PacketDetailsCard";

import UpdateStatusModal from "../../components/lecturer/UpdateStatusModal";

import {
  getPacketDetails,
  updatePacketStatus,
} from "../../services/lecturerService";

const PacketDetails = () => {
  const { id } = useParams();

  const [packet, setPacket] = useState(null);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    const lecturerId = 1;

    const data = await getPacketDetails(id, lecturerId);

    setPacket(data);
  };

  const handleStatusUpdate = async (status) => {
    try {
      await updatePacketStatus(id, status);

      setShowModal(false);

      loadDetails();
    } catch (error) {
      console.log(error);
    }
  };

  if (!packet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exam Packet Details</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Status
        </button>
      </div>

      <PacketDetailsCard packet={packet} />

      {showModal && (
        <UpdateStatusModal
          currentStatus={packet.status}
          onUpdate={handleStatusUpdate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default PacketDetails;
