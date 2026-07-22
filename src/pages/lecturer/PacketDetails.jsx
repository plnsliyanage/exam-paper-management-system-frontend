import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import PacketDetailsCard from "../../components/lecturer/PacketDetailsCard";

import { getPacketDetails } from "../../services/lecturerService";

const PacketDetails = () => {
  const { id } = useParams();

  const [packet, setPacket] = useState(null);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const lecturerId = 1;

      const data = await getPacketDetails(id, lecturerId);

      setPacket(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!packet) {
    return <div>Loading packet details...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Exam Packet Details</h1>

      <PacketDetailsCard packet={packet} />
    </div>
  );
};

export default PacketDetails;
