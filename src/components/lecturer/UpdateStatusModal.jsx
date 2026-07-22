import { useState } from "react";

const UpdateStatusModal = ({ currentStatus, onUpdate, onClose }) => {
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = () => {
    onUpdate(status);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-5">
      <h2 className="text-xl font-bold">Update Packet Status</h2>

      <select
        className="border p-2 rounded w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="SUBMITTED">SUBMITTED</option>

        <option value="IN_PROGRESS">IN_PROGRESS</option>

        <option value="APPROVED">APPROVED</option>

        <option value="RETURNED">RETURNED</option>
      </select>

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>

        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
