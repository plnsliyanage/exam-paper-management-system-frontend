import { Link } from "react-router-dom";

const PacketCard = ({ packet }) => {
  return (
    <Link to={`/lecturer/packets/${packet.packetId}`}>
      <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        <h2 className="text-xl font-semibold">{packet.courseCode}</h2>

        <p className="text-gray-600">{packet.courseName}</p>

        <div className="mt-4 space-y-2">
          <p>
            <span className="font-semibold">Department:</span>{" "}
            {packet.department}
          </p>

          <p>
            <span className="font-semibold">Deadline:</span> {packet.deadline}
          </p>

          <p>
            <span className="font-semibold">Status:</span> {packet.status}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PacketCard;
