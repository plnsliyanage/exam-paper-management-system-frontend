const PacketDetailsCard = ({ packet }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold">Packet Details</h2>

      <div>
        <p className="text-gray-500">Course Code</p>

        <p className="font-semibold">{packet.courseCode}</p>
      </div>

      <div>
        <p className="text-gray-500">Course Name</p>

        <p className="font-semibold">{packet.courseName}</p>
      </div>

      <div>
        <p className="text-gray-500">Department</p>

        <p className="font-semibold">{packet.departmentName}</p>
      </div>

      <div>
        <p className="text-gray-500">Deadline</p>

        <p className="font-semibold">{packet.deadline}</p>
      </div>

      <div>
        <p className="text-gray-500">Status</p>

        <p className="font-semibold">{packet.status}</p>
      </div>
    </div>
  );
};

export default PacketDetailsCard;
