import { useState } from "react";

const ScriptCountForm = ({ currentCount, onSave }) => {
  const [count, setCount] = useState(currentCount || "");

  return (
    <div className="bg-white shadow rounded-lg p-5 space-y-4">
      <h2 className="text-xl font-bold">Answer Scripts For Marking</h2>

      <input
        type="number"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        placeholder="Enter number of scripts"
        className="border rounded p-2 w-full"
      />

      <button
        onClick={() => onSave(count)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Script Count
      </button>
    </div>
  );
};

export default ScriptCountForm;
