const PacketFilter = ({
  searchType,
  setSearchType,
  searchValue,
  setSearchValue,
  status,
  setStatus,
  deadline,
  setDeadline,
  handleSearch,
  handleReset,
}) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold">Search & Filter Packets</h2>

      <div className="grid grid-cols-4 gap-4">
        <select
          className="border p-2 rounded"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="courseCode">Course Code</option>

          <option value="courseName">Course Name</option>
        </select>

        <input
          className="border p-2 rounded"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>

          <option value="SUBMITTED">SUBMITTED</option>

          <option value="IN_PROGRESS">IN_PROGRESS</option>

          <option value="APPROVED">APPROVED</option>

          <option value="RETURNED">RETURNED</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="space-x-3">
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>

        <button
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PacketFilter;
