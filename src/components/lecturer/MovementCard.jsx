const MovementCard = ({ movement }) => {
  return (
    <div
      className="
            bg-white
            shadow-md
            rounded-lg
            p-5
            mb-4
        "
    >
      <h2 className="text-lg font-bold text-blue-700">{movement.status}</h2>

      <div className="mt-3 space-y-2">
        <p>
          <span className="font-semibold">From:</span> {movement.fromUserName}
        </p>

        <p>
          <span className="font-semibold">To:</span> {movement.toUserName}
        </p>

        <p>
          <span className="font-semibold">Date:</span> {movement.movementDate}
        </p>

        <p>
          <span className="font-semibold">Remarks:</span> {movement.remarks}
        </p>
      </div>
    </div>
  );
};

export default MovementCard;
