import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPacketMovementHistory } from "../../api/lecturerApi";

import MovementCard from "../../components/lecturer/MovementCard";

const PacketMovementHistory = () => {
  const { packetId } = useParams();

  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const data = await getPacketMovementHistory(packetId);

      setMovements(data);
    } catch (error) {
      console.error("Movement loading error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2 className="text-xl">Loading movement history...</h2>;
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
        Packet Movement History
      </h1>

      <p className="mb-5">
        Packet ID:
        <span className="font-bold"> {packetId}</span>
      </p>

      {movements.length === 0 ? (
        <p>No movement history available</p>
      ) : (
        movements.map((movement) => (
          <MovementCard key={movement.movementId} movement={movement} />
        ))
      )}
    </div>
  );
};

export default PacketMovementHistory;
