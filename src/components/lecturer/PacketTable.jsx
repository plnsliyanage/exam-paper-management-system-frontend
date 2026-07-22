const PacketTable = ({ packets }) => {
  if (packets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No assigned packets found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Packet ID</th>
            <th className="px-4 py-3 text-left">Course Code</th>
            <th className="px-4 py-3 text-left">Course Name</th>
            <th className="px-4 py-3 text-left">Department</th>
            <th className="px-4 py-3 text-left">Deadline</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {packets.map((packet) => (
            <tr key={packet.packetId} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{packet.packetId}</td>

              <td className="px-4 py-3">{packet.courseCode}</td>

              <td className="px-4 py-3">{packet.courseName}</td>

              <td className="px-4 py-3">{packet.departmentName}</td>

              <td className="px-4 py-3">{packet.deadline}</td>

              <td className="px-4 py-3">{packet.status}</td>

              <td className="px-4 py-3">
                <a
                  href={`/lecturer/packets/${packet.packetId}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PacketTable;
