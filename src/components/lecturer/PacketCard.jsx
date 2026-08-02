import { Link } from "react-router-dom";

const PacketCard = ({ packet }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
      {/* Packet Details Click */}
      <Link to={`/lecturer/packets/${packet.packetId}`} className="block">
        <h2 className="text-xl font-semibold text-blue-700">
          {packet.courseCode}
        </h2>

        <p className="text-gray-700">{packet.courseName}</p>

        <div className="mt-4 space-y-2">
          <p>
            <span className="font-semibold">Department:</span>{" "}
            {packet.departmentName}
          </p>

          <p>
            <span className="font-semibold">Academic Year:</span>{" "}
            {packet.academicYear}
          </p>

          <p>
            <span className="font-semibold">Semester:</span> {packet.semester}
          </p>

          <p>
            <span className="font-semibold">Deadline:</span> {packet.deadline}
          </p>

          <p>
            <span className="font-semibold">Status:</span> {packet.status}
          </p>

          <p>
            <span className="font-semibold">Current Holder:</span>{" "}
            {packet.currentHolderName}
          </p>
        </div>
      </Link>

      {/* Movement History Button */}
      <Link
        to={`/lecturer/packets/${packet.packetId}/movements`}
        className="
          mt-5
          inline-block
          bg-blue-600
          text-white
          px-4
          py-2
          rounded
          hover:bg-blue-700
        "
      >
        View Movement History
      </Link>
    </div>
  );
};

export default PacketCard;
