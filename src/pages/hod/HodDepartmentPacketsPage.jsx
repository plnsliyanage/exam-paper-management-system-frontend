import React, { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Clock,
  FileText,
  X,
  RefreshCw,
  User,
  MessageSquare,
} from "lucide-react";

// ============================================================
// SAMPLE DEPARTMENT
// ============================================================

const DEPARTMENT_ID = "D1";

// ============================================================
// SAMPLE EXAM PACKET DATA
// ============================================================
//
// Four stages:
//
// 1. PAPER_SETTING
// 2. PAPER_MODERATING
// 3. PAPER_MARKING
// 4. SECOND_MARKING
//
// Only PAPER_MARKING and SECOND_MARKING have papersToMark.
// ============================================================

const SAMPLE_PACKETS = [
  {
    packetId: "P1",
    courseCode: "CS1022",
    courseName: "Data Structures and Algorithms",
    academicCycle: "2026-S1",

    stage: "PAPER_SETTING",
    status: "PAPER_SETTING",

    lecturerName: "Dr. Samantha Perera",
    lecturerId: "U1",

    moderatorName: "Dr. Nimal Fernando",

    currentHolder: "Dr. Samantha Perera",

    totalPapers: 50,
    papersToMark: null,

    deadline: "2026-08-25",

    lastUpdatedTime: "2026-08-20 08:30",
    lastUpdatedUser: "Dr. Samantha Perera",

    isOverdue: false,

    history: [
      {
        stage: "Paper Setting",
        user: "Dr. Samantha Perera",
        time: "2026-08-20 08:30",
      },
      {
        stage: "Packet Created",
        user: "HOD",
        time: "2026-08-18 09:00",
      },
    ],

    comments: [
      {
        sender: "HOD",
        text: "Paper setting is currently in progress.",
        time: "2026-08-20 08:35",
      },
    ],
  },

  {
    packetId: "P2",
    courseCode: "CS1033",
    courseName: "Database Management Systems",
    academicCycle: "2026-S1",

    stage: "PAPER_MODERATING",
    status: "PAPER_MODERATING",

    lecturerName: "Prof. Kasun Silva",
    lecturerId: "U2",

    moderatorName: "Dr. Nimal Fernando",

    currentHolder: "Dr. Nimal Fernando",

    totalPapers: 45,
    papersToMark: null,

    deadline: "2026-08-22",

    lastUpdatedTime: "2026-08-19 14:20",
    lastUpdatedUser: "Dr. Nimal Fernando",

    isOverdue: false,

    history: [
      {
        stage: "Paper Moderating",
        user: "Dr. Nimal Fernando",
        time: "2026-08-19 14:20",
      },
      {
        stage: "Paper Setting",
        user: "Prof. Kasun Silva",
        time: "2026-08-17 10:00",
      },
    ],

    comments: [
      {
        sender: "Moderator",
        text: "Paper is being reviewed for moderation.",
        time: "2026-08-19 14:25",
      },
    ],
  },

  {
    packetId: "P3",
    courseCode: "CS1042",
    courseName: "Object Oriented Programming",
    academicCycle: "2026-S1",

    stage: "PAPER_MARKING",
    status: "PAPER_MARKING",

    lecturerName: "Dr. Amali Perera",
    lecturerId: "U3",

    moderatorName: "Prof. Kasun Silva",

    currentHolder: "Dr. Amali Perera",

    totalPapers: 60,
    papersToMark: 60,

    deadline: "2026-08-24",

    lastUpdatedTime: "2026-08-20 07:45",
    lastUpdatedUser: "Dr. Amali Perera",

    isOverdue: false,

    history: [
      {
        stage: "Paper Marking",
        user: "Dr. Amali Perera",
        time: "2026-08-20 07:45",
      },
      {
        stage: "Paper Moderating",
        user: "Prof. Kasun Silva",
        time: "2026-08-18 15:00",
      },
    ],

    comments: [
      {
        sender: "HOD",
        text: "Marking has started. Please complete before the deadline.",
        time: "2026-08-20 07:50",
      },
    ],
  },

  {
    packetId: "P4",
    courseCode: "CS1052",
    courseName: "Computer Networks",
    academicCycle: "2026-S1",

    stage: "PAPER_MARKING",
    status: "PAPER_MARKING",

    lecturerName: "Dr. Ruwan Jayasuriya",
    lecturerId: "U4",

    moderatorName: "Dr. Amali Perera",

    currentHolder: "Dr. Ruwan Jayasuriya",

    totalPapers: 55,
    papersToMark: 32,

    deadline: "2026-08-21",

    lastUpdatedTime: "2026-08-20 08:00",
    lastUpdatedUser: "Dr. Ruwan Jayasuriya",

    isOverdue: false,

    history: [
      {
        stage: "Paper Marking",
        user: "Dr. Ruwan Jayasuriya",
        time: "2026-08-20 08:00",
      },
      {
        stage: "Paper Moderating",
        user: "Dr. Amali Perera",
        time: "2026-08-17 11:20",
      },
    ],

    comments: [
      {
        sender: "HOD",
        text: "32 papers are remaining for marking.",
        time: "2026-08-20 08:05",
      },
    ],
  },

  {
    packetId: "P5",
    courseCode: "CS1062",
    courseName: "Software Engineering",
    academicCycle: "2026-S1",

    stage: "SECOND_MARKING",
    status: "SECOND_MARKING",

    lecturerName: "Dr. Samantha Perera",
    lecturerId: "U1",

    moderatorName: "Dr. Nimal Fernando",

    currentHolder: "Dr. Nimal Fernando",

    totalPapers: 40,
    papersToMark: 18,

    deadline: "2026-08-23",

    lastUpdatedTime: "2026-08-20 08:10",
    lastUpdatedUser: "Dr. Nimal Fernando",

    isOverdue: false,

    history: [
      {
        stage: "Second Marking",
        user: "Dr. Nimal Fernando",
        time: "2026-08-20 08:10",
      },
      {
        stage: "Paper Marking",
        user: "Dr. Samantha Perera",
        time: "2026-08-18 13:40",
      },
    ],

    comments: [
      {
        sender: "Moderator",
        text: "Second marking is currently in progress.",
        time: "2026-08-20 08:15",
      },
    ],
  },

  {
    packetId: "P6",
    courseCode: "CS1072",
    courseName: "Operating Systems",
    academicCycle: "2026-S1",

    stage: "SECOND_MARKING",
    status: "SECOND_MARKING",

    lecturerName: "Prof. Kasun Silva",
    lecturerId: "U2",

    moderatorName: "Dr. Amali Perera",

    currentHolder: "Dr. Amali Perera",

    totalPapers: 48,
    papersToMark: 10,

    deadline: "2026-08-19",

    lastUpdatedTime: "2026-08-20 07:30",
    lastUpdatedUser: "Dr. Amali Perera",

    isOverdue: true,

    history: [
      {
        stage: "Second Marking",
        user: "Dr. Amali Perera",
        time: "2026-08-20 07:30",
      },
      {
        stage: "Paper Marking",
        user: "Prof. Kasun Silva",
        time: "2026-08-16 10:30",
      },
    ],

    comments: [
      {
        sender: "HOD",
        text: "Deadline has passed. Please complete the remaining papers.",
        time: "2026-08-20 07:35",
      },
    ],
  },

  {
    packetId: "P7",
    courseCode: "CS1082",
    courseName: "Web Technologies",
    academicCycle: "2026-S2",

    stage: "PAPER_SETTING",
    status: "PAPER_SETTING",

    lecturerName: "Dr. Ruwan Jayasuriya",
    lecturerId: "U4",

    moderatorName: "Dr. Samantha Perera",

    currentHolder: "Dr. Ruwan Jayasuriya",

    totalPapers: 52,
    papersToMark: null,

    deadline: "2026-09-05",

    lastUpdatedTime: "2026-08-20 08:15",
    lastUpdatedUser: "Dr. Ruwan Jayasuriya",

    isOverdue: false,

    history: [
      {
        stage: "Paper Setting",
        user: "Dr. Ruwan Jayasuriya",
        time: "2026-08-20 08:15",
      },
    ],

    comments: [],
  },

  {
    packetId: "P8",
    courseCode: "CS1092",
    courseName: "Artificial Intelligence",
    academicCycle: "2026-S2",

    stage: "PAPER_MODERATING",
    status: "PAPER_MODERATING",

    lecturerName: "Dr. Amali Perera",
    lecturerId: "U3",

    moderatorName: "Dr. Samantha Perera",

    currentHolder: "Dr. Samantha Perera",

    totalPapers: 42,
    papersToMark: null,

    deadline: "2026-09-02",

    lastUpdatedTime: "2026-08-20 07:55",
    lastUpdatedUser: "Dr. Samantha Perera",

    isOverdue: false,

    history: [
      {
        stage: "Paper Moderating",
        user: "Dr. Samantha Perera",
        time: "2026-08-20 07:55",
      },
    ],

    comments: [],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getStageLabel = (stage) => {
  switch (stage) {
    case "PAPER_SETTING":
      return "Paper Setting";

    case "PAPER_MODERATING":
      return "Paper Moderating";

    case "PAPER_MARKING":
      return "Paper Marking";

    case "SECOND_MARKING":
      return "Second Marking";

    default:
      return stage;
  }
};

const getStageClass = (stage) => {
  switch (stage) {
    case "PAPER_SETTING":
      return "bg-purple-100 text-purple-700";

    case "PAPER_MODERATING":
      return "bg-yellow-100 text-yellow-700";

    case "PAPER_MARKING":
      return "bg-blue-100 text-blue-700";

    case "SECOND_MARKING":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusClass = (stage) => {
  switch (stage) {
    case "PAPER_SETTING":
      return "bg-purple-100 text-purple-700";

    case "PAPER_MODERATING":
      return "bg-yellow-100 text-yellow-700";

    case "PAPER_MARKING":
      return "bg-blue-100 text-blue-700";

    case "SECOND_MARKING":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

// ============================================================
// COMPONENT
// ============================================================

export default function HodDepartmentPacketsPage() {
  const [packets, setPackets] = useState(SAMPLE_PACKETS);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCycle, setSelectedCycle] = useState("All");

  const [selectedStage, setSelectedStage] = useState("All");

  const [selectedLecturer, setSelectedLecturer] = useState("All");

  const [activeModalPacket, setActiveModalPacket] = useState(null);

  const [activeTab, setActiveTab] = useState("details");

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const cycles = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(SAMPLE_PACKETS.map((packet) => packet.academicCycle)),
      ),
    ];
  }, []);

  const lecturers = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(SAMPLE_PACKETS.map((packet) => packet.lecturerName)),
      ),
    ];
  }, []);

  const stages = [
    "All",
    "PAPER_SETTING",
    "PAPER_MODERATING",
    "PAPER_MARKING",
    "SECOND_MARKING",
  ];

  // ==========================================================
  // STAGE COUNTS
  // ==========================================================

  const stageCounts = useMemo(() => {
    return {
      PAPER_SETTING: packets.filter(
        (packet) => packet.stage === "PAPER_SETTING",
      ).length,

      PAPER_MODERATING: packets.filter(
        (packet) => packet.stage === "PAPER_MODERATING",
      ).length,

      PAPER_MARKING: packets.filter(
        (packet) => packet.stage === "PAPER_MARKING",
      ).length,

      SECOND_MARKING: packets.filter(
        (packet) => packet.stage === "SECOND_MARKING",
      ).length,
    };
  }, [packets]);

  // ==========================================================
  // LOCAL FILTERING
  // ==========================================================

  const filteredPackets = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return SAMPLE_PACKETS.filter((packet) => {
      const matchesSearch =
        !search ||
        packet.packetId.toLowerCase().includes(search) ||
        packet.courseCode.toLowerCase().includes(search) ||
        packet.courseName.toLowerCase().includes(search) ||
        packet.lecturerName.toLowerCase().includes(search) ||
        packet.moderatorName.toLowerCase().includes(search) ||
        getStageLabel(packet.stage).toLowerCase().includes(search);

      const matchesCycle =
        selectedCycle === "All" || packet.academicCycle === selectedCycle;

      const matchesStage =
        selectedStage === "All" || packet.stage === selectedStage;

      const matchesLecturer =
        selectedLecturer === "All" || packet.lecturerName === selectedLecturer;

      return matchesSearch && matchesCycle && matchesStage && matchesLecturer;
    });
  }, [searchTerm, selectedCycle, selectedStage, selectedLecturer]);

  // ==========================================================
  // REFRESH SAMPLE DATA
  // ==========================================================

  const refreshData = () => {
    setPackets([...SAMPLE_PACKETS]);

    setSearchTerm("");
    setSelectedCycle("All");
    setSelectedStage("All");
    setSelectedLecturer("All");
  };

  // ==========================================================
  // VIEW DETAILS
  // ==========================================================

  const handleViewDetails = (packet) => {
    setActiveModalPacket(packet);
    setActiveTab("details");
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    setActiveModalPacket(null);
    setActiveTab("details");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Packets
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Track examination packets across all processing stages.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ======================================================
          COMPACT STAGE CARDS
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* PAPER SETTING */}

        <button
          onClick={() => setSelectedStage("PAPER_SETTING")}
          className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-purple-300 ${
            selectedStage === "PAPER_SETTING"
              ? "border-purple-400 ring-1 ring-purple-200"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500">Paper Setting</p>

              <p className="text-xl font-bold text-gray-900">
                {stageCounts.PAPER_SETTING}
              </p>
            </div>

            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText size={17} className="text-purple-600" />
            </div>
          </div>
        </button>

        {/* PAPER MODERATING */}

        <button
          onClick={() => setSelectedStage("PAPER_MODERATING")}
          className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-yellow-300 ${
            selectedStage === "PAPER_MODERATING"
              ? "border-yellow-400 ring-1 ring-yellow-200"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500">Paper Moderating</p>

              <p className="text-xl font-bold text-gray-900">
                {stageCounts.PAPER_MODERATING}
              </p>
            </div>

            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock size={17} className="text-yellow-600" />
            </div>
          </div>
        </button>

        {/* PAPER MARKING */}

        <button
          onClick={() => setSelectedStage("PAPER_MARKING")}
          className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-blue-300 ${
            selectedStage === "PAPER_MARKING"
              ? "border-blue-400 ring-1 ring-blue-200"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500">Paper Marking</p>

              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">
                  {stageCounts.PAPER_MARKING}
                </p>

                <span className="text-[11px] text-blue-600">
                  papers to mark
                </span>
              </div>
            </div>

            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText size={17} className="text-blue-600" />
            </div>
          </div>
        </button>

        {/* SECOND MARKING */}

        <button
          onClick={() => setSelectedStage("SECOND_MARKING")}
          className={`bg-white border rounded-lg px-4 py-3 text-left hover:border-orange-300 ${
            selectedStage === "SECOND_MARKING"
              ? "border-orange-400 ring-1 ring-orange-200"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500">Second Marking</p>

              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">
                  {stageCounts.SECOND_MARKING}
                </p>

                <span className="text-[11px] text-orange-600">
                  papers to mark
                </span>
              </div>
            </div>

            <div className="p-2 bg-orange-50 rounded-lg">
              <FileText size={17} className="text-orange-600" />
            </div>
          </div>
        </button>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={17}
            />

            <input
              type="text"
              placeholder="Search packet, course, lecturer or stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-2">
            {/* STAGE */}

            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage === "All" ? "All Stages" : getStageLabel(stage)}
                </option>
              ))}
            </select>

            {/* CYCLE */}

            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {cycles.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle === "All" ? "All Cycles" : cycle}
                </option>
              ))}
            </select>

            {/* LECTURER */}

            <select
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              {lecturers.map((lecturer) => (
                <option key={lecturer} value={lecturer}>
                  {lecturer === "All" ? "All Lecturers" : lecturer}
                </option>
              ))}
            </select>

            {/* RESET */}

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCycle("All");
                setSelectedStage("All");
                setSelectedLecturer("All");
              }}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          RESULTS
      ====================================================== */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredPackets.length}
          </span>{" "}
          packets
        </p>

        {selectedStage !== "All" && (
          <button
            onClick={() => setSelectedStage("All")}
            className="text-xs text-blue-600 hover:underline"
          >
            Show all stages
          </button>
        )}
      </div>

      {/* ======================================================
          PACKET TABLE
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Packet ID</th>

                <th className="py-3 px-4">Course</th>

                <th className="py-3 px-4">Stage</th>

                <th className="py-3 px-4">Lecturer / Moderator</th>

                <th className="py-3 px-4">Papers</th>

                <th className="py-3 px-4">Holder</th>

                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPackets.length > 0 ? (
                filteredPackets.map((packet) => (
                  <tr key={packet.packetId} className="hover:bg-gray-50">
                    {/* PACKET */}

                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-600">
                        {packet.packetId}
                      </div>

                      {packet.isOverdue && (
                        <span className="text-[10px] text-red-600 font-bold">
                          OVERDUE
                        </span>
                      )}
                    </td>

                    {/* COURSE */}

                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {packet.courseName}
                      </div>

                      <div className="text-xs text-gray-500 mt-0.5">
                        {packet.courseCode} • {packet.academicCycle}
                      </div>
                    </td>

                    {/* STAGE */}

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStageClass(
                          packet.stage,
                        )}`}
                      >
                        {getStageLabel(packet.stage)}
                      </span>
                    </td>

                    {/* PEOPLE */}

                    <td className="py-3 px-4">
                      <div className="text-gray-800">{packet.lecturerName}</div>

                      <div className="text-xs text-gray-500">
                        Mod: {packet.moderatorName}
                      </div>
                    </td>

                    {/* PAPERS */}

                    <td className="py-3 px-4">
                      <div className="text-gray-800">
                        {packet.totalPapers} Papers
                      </div>

                      {(packet.stage === "PAPER_MARKING" ||
                        packet.stage === "SECOND_MARKING") && (
                        <div className="text-xs font-medium text-blue-600 mt-0.5">
                          {packet.papersToMark} to mark
                        </div>
                      )}
                    </td>

                    {/* HOLDER */}

                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500">Holder</div>

                      <div className="font-medium text-gray-700">
                        {packet.currentHolder}
                      </div>
                    </td>

                    {/* ACTION */}

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(packet)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <FileText size={36} className="mx-auto text-gray-300" />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No packets found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          PACKET DETAILS MODAL
      ====================================================== */}

      {activeModalPacket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* HEADER */}

            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {activeModalPacket.packetId}
                  {" - "}
                  {activeModalPacket.courseName}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {activeModalPacket.courseCode}
                  {" | "}
                  {activeModalPacket.academicCycle}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={21} />
              </button>
            </div>

            {/* TABS */}

            <div className="flex border-b border-gray-200 bg-gray-50 px-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                Details
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "history"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                History
              </button>

              <button
                onClick={() => setActiveTab("comments")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "comments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                }`}
              >
                Communication
              </button>
            </div>

            {/* CONTENT */}

            <div className="p-5 overflow-y-auto">
              {/* DETAILS */}

              {activeTab === "details" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Packet ID</p>

                      <p className="font-semibold text-blue-600 mt-1">
                        {activeModalPacket.packetId}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Stage</p>

                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusClass(
                          activeModalPacket.stage,
                        )}`}
                      >
                        {getStageLabel(activeModalPacket.stage)}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Course</p>

                      <p className="font-medium text-gray-800 mt-1">
                        {activeModalPacket.courseName}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Academic Cycle</p>

                      <p className="font-medium text-gray-800 mt-1">
                        {activeModalPacket.academicCycle}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total Papers</p>

                      <p className="font-semibold text-gray-800 mt-1">
                        {activeModalPacket.totalPapers}
                      </p>
                    </div>

                    {/* ONLY SHOW FOR MARKING */}

                    {(activeModalPacket.stage === "PAPER_MARKING" ||
                      activeModalPacket.stage === "SECOND_MARKING") && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600">Papers to Mark</p>

                        <p className="font-bold text-blue-700 text-lg mt-1">
                          {activeModalPacket.papersToMark}
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />

                        <p className="text-xs text-gray-500">Lecturer</p>
                      </div>

                      <p className="font-medium text-gray-800 mt-1">
                        {activeModalPacket.lecturerName}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />

                        <p className="text-xs text-gray-500">Moderator</p>
                      </div>

                      <p className="font-medium text-gray-800 mt-1">
                        {activeModalPacket.moderatorName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* HISTORY */}

              {activeTab === "history" && (
                <div className="space-y-2">
                  {activeModalPacket.history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Clock size={14} />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.stage}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {item.user}
                          {" • "}
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COMMENTS */}

              {activeTab === "comments" && (
                <div className="space-y-3">
                  {activeModalPacket.comments.length > 0 ? (
                    activeModalPacket.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-800 text-sm">
                            {comment.sender}
                          </span>

                          <span className="text-xs text-gray-400">
                            {comment.time}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <MessageSquare
                        size={32}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-2 text-sm text-gray-500">
                        No communication available.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
