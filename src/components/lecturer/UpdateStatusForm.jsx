import { useState } from "react";
import { updatePacketStatus } from "../../api/lecturerApi";

const UpdateStatusForm = ({ packetId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus || "");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await updatePacketStatus(packetId, {
        status: status,
      });

      setMessage(response);
    } catch (error) {
      console.error(error);

      setMessage("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
            mt-8
            bg-gray-100
            p-5
            rounded-lg
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

      <form onSubmit={handleSubmit}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="
                    border
                    p-2
                    rounded
                    w-full
                    "
        >
          <option value="RECEIVED">RECEIVED</option>

          <option value="ASSIGNED">ASSIGNED</option>

          <option value="MARKING">MARKING</option>

          <option value="COMPLETED">COMPLETED</option>

          <option value="SUBMITTED">SUBMITTED</option>
        </select>

        <button
          disabled={loading}
          className="
                    mt-4
                    bg-blue-600
                    text-white
                    px-5
                    py-2
                    rounded
                    hover:bg-blue-700
                    "
        >
          {loading ? "Updating..." : "Update Status"}
        </button>
      </form>

      {message && (
        <p
          className="
                    mt-4
                    text-green-600
                "
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UpdateStatusForm;
