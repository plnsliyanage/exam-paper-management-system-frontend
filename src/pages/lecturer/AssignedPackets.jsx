import { useEffect, useState } from "react";

import PacketTable from "../../components/lecturer/PacketTable";

import PacketFilter from "../../components/lecturer/PacketFilter";

import {
  getAssignedPackets,
  searchByCourseCode,
  searchByCourseName,
  filterByStatus,
  filterByDeadline,
} from "../../services/lecturerService";

const AssignedPackets = () => {
  const lecturerId = 1;

  const [packets, setPackets] = useState([]);

  const [searchType, setSearchType] = useState("courseCode");

  const [searchValue, setSearchValue] = useState("");

  const [status, setStatus] = useState("");

  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    loadPackets();
  }, []);

  const loadPackets = async () => {
    const data = await getAssignedPackets(lecturerId);

    setPackets(data);
  };

  const handleSearch = async () => {
    let data = [];

    if (searchValue) {
      if (searchType === "courseCode") {
        data = await searchByCourseCode(lecturerId, searchValue);
      } else {
        data = await searchByCourseName(lecturerId, searchValue);
      }
    } else if (status) {
      data = await filterByStatus(lecturerId, status);
    } else if (deadline) {
      data = await filterByDeadline(lecturerId, deadline);
    } else {
      data = await getAssignedPackets(lecturerId);
    }

    setPackets(data);
  };

  const handleReset = () => {
    setSearchValue("");

    setStatus("");

    setDeadline("");

    loadPackets();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assigned Exam Packets</h1>

        <p className="text-gray-500 mt-2">
          Search and filter assigned packets.
        </p>
      </div>

      <PacketFilter
        searchType={searchType}
        setSearchType={setSearchType}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        status={status}
        setStatus={setStatus}
        deadline={deadline}
        setDeadline={setDeadline}
        handleSearch={handleSearch}
        handleReset={handleReset}
      />

      <PacketTable packets={packets} />
    </div>
  );
};

export default AssignedPackets;
