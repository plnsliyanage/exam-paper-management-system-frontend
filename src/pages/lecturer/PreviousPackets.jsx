import { useEffect, useState } from "react";

import { getPreviousPackets } from "../../api/lecturerApi";

import PreviousPacketCard from "../../components/lecturer/PreviousPacketCard";

const PreviousPackets = () => {
  const [packets, setPackets] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackets();
  }, []);

  const loadPackets = async () => {
    try {
      const data = await getPreviousPackets();

      setPackets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading Previous Packets...</h2>;
  }

  return (
    <div>
      <h1
        className="
            text-3xl
            font-bold
            mb-8
            "
      >
        Previous Academic Packets
      </h1>

      <div
        className="
            grid
            gap-6
            "
      >
        {packets.map((packet) => (
          <PreviousPacketCard key={packet.packetId} packet={packet} />
        ))}
      </div>
    </div>
  );
};

export default PreviousPackets;
