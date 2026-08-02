import { useState } from "react";

import MarkingForm from "../../components/lecturer/MarkingForm";

import { addMarkingScripts } from "../../api/lecturerApi";

const AddMarking = () => {
  const [scripts, setScripts] = useState("");

  const [message, setMessage] = useState("");

  // Use existing database packet id
  const packetId = "P3";

  // Current lecturer
  const lecturerId = "U1";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        packetId: packetId,

        lecturerId: lecturerId,

        totalScripts: Number(scripts),
      };

      const response = await addMarkingScripts(data);

      setMessage(response);
    } catch (error) {
      console.error(error);

      setMessage("Failed to add marking scripts");
    }
  };

  return (
    <div className="max-w-xl">
      <h1
        className="
      text-3xl
      font-bold
      mb-6
      "
      >
        Add Marking Scripts
      </h1>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      <MarkingForm
        scripts={scripts}
        setScripts={setScripts}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddMarking;
