const MarkingForm = ({ packetId, scripts, setScripts, handleSubmit }) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="
      bg-white
      shadow
      rounded-lg
      p-6
      space-y-5
      "
    >
      <div>
        <label className="block font-semibold mb-2">
          Number of Answer Scripts
        </label>

        <input
          type="number"
          value={scripts}
          onChange={(e) => setScripts(e.target.value)}
          className="
          border
          rounded
          p-2
          w-full
          "
          min="1"
          required
        />
      </div>

      <button
        type="submit"
        className="
        bg-blue-600
        text-white
        px-5
        py-2
        rounded
        "
      >
        Submit
      </button>
    </form>
  );
};

export default MarkingForm;
