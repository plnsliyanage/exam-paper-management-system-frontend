const PreviousPacketCard = ({ packet }) => {
  return (
    <div
      className="
        bg-white
        shadow-md
        rounded-lg
        p-5
        "
    >
      <h2
        className="
            text-xl
            font-bold
            text-blue-700
            "
      >
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
          <span className="font-semibold">Status:</span> {packet.status}
        </p>

        <p>
          <span className="font-semibold">Completed Date:</span>{" "}
          {packet.completedDate}
        </p>
      </div>
    </div>
  );
};

export default PreviousPacketCard;
