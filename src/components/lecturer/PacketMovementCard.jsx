const PacketMovementCard = ({ movement }) => {
  return (
    <div
      className="
        bg-white
        shadow-md
        rounded-lg
        p-5
        border-l-4
        border-blue-500
        "
    >
      <h2
        className="
            text-lg
            font-bold
            "
      >
        {movement.action}
      </h2>

      <div className="mt-3 space-y-2">
        <p>
          <span className="font-semibold">From:</span> {movement.fromUserName}
        </p>

        <p>
          <span className="font-semibold">To:</span> {movement.toUserName}
        </p>

        <p>
          <span className="font-semibold">Date:</span> {movement.movedDate}
        </p>

        <p>
          <span className="font-semibold">Status:</span> {movement.status}
        </p>
      </div>
    </div>
  );
};

export default PacketMovementCard;
