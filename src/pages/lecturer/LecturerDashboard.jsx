import React, { useState } from "react";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Search,
  Check,
  Eye,
  Edit3,
  BarChart3,
  User,
  Calendar,
  FileText,
  CheckSquare,
  ShieldCheck,
} from "lucide-react";

const MOCK_USER = {
  id: "LEC-101",
  name: "Dr. Samantha Perera",
  department: "Department of Computer Science",
  currentSemester: "2026-S1",
};

// Expanded mock data to handle different packet task types:
// 'SET_PAPER' (Setting exam papers), 'MARK_SCRIPTS' (Marking exam scripts), 'MODERATION' (Checking/moderating someone else's work)
const MOCK_ACTIVE_PACKETS = [
  {
    packetId: "PKT-2026-01",
    courseCode: "CS1022",
    courseName: "Data Structures and Algorithms",
    taskType: "MARK_SCRIPTS", // to mark
    status: "MARKING",
    currentHolder: "Dr. Samantha Perera",
    deadline: "2026-06-15",
    semester: "2026-S1",
    scriptsCount: 60,
  },
  {
    packetId: "PKT-2026-02",
    courseCode: "CS2032",
    courseName: "Database Systems",
    taskType: "MODERATION", // to check / moderate
    status: "REVIEW",
    currentHolder: "Dr. Samantha Perera",
    deadline: "2026-06-20",
    semester: "2026-S1",
    scriptsCount: 60,
  },
  {
    packetId: "PKT-2026-03",
    courseCode: "CS3012",
    courseName: "Software Engineering",
    taskType: "SET_PAPER", // to set paper
    status: "PAPER_SETTING",
    currentHolder: "Dr. Samantha Perera",
    deadline: "2026-06-10",
    semester: "2026-S1",
    scriptsCount: 1, // Usually 1 paper packet / draft structure
  },
];

export default function LecturerDashboard() {
  const [currentUser] = useState(MOCK_USER);
  const [currentSemester] = useState(currentUser.currentSemester);
  const [packets, setPackets] = useState(MOCK_ACTIVE_PACKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("ALL"); // ALL, SET_PAPER, MARK_SCRIPTS, MODERATION

  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);

  const currentSemesterPackets = MOCK_ACTIVE_PACKETS.filter(
    (p) => p.semester === currentSemester,
  );

  const totalScripts = currentSemesterPackets
    .filter((p) => p.taskType === "MARK_SCRIPTS")
    .reduce((acc, curr) => acc + curr.scriptsCount, 0);

  // Filter logic incorporating both search text and task type filter tabs
  const handleFilterChange = (type) => {
    setTaskFilter(type);
    applyFilters(searchQuery, type);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, taskFilter);
  };

  const applyFilters = (query, type) => {
    let filtered = currentSemesterPackets;

    // Filter by Task Type
    if (type !== "ALL") {
      filtered = filtered.filter((p) => p.taskType === type);
    }

    // Filter by Search Query
    if (query.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.courseCode.toLowerCase().includes(query.toLowerCase()) ||
          p.courseName.toLowerCase().includes(query.toLowerCase()),
      );
    }

    setPackets(filtered);
  };

  const handleCompleteTask = (packetId) => {
    alert(`Task completed for packet: ${packetId}`);
    setPackets((prev) => prev.filter((p) => p.packetId !== packetId));
  };

  // Helper badge renderers for different workflow packet types
  const renderTaskBadge = (taskType) => {
    switch (taskType) {
      case "SET_PAPER":
        return (
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" /> Paper Setting
          </span>
        );
      case "MARK_SCRIPTS":
        return (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-fit">
            <CheckSquare className="w-3 h-3" /> Script Marking
          </span>
        );
      case "MODERATION":
        return (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3 h-3" /> Moderation / Checking
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Lecturer Workspace
            </h1>
            <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Semester: {currentSemester}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your exam paper settings, script markings, and moderations
            for {currentSemester}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              {currentUser.name}
            </h4>
            <p className="text-[11px] text-slate-400">
              {currentUser.department} ({currentUser.id})
            </p>
          </div>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Tasks"
          value={currentSemesterPackets.length}
          icon={BookOpen}
          color="text-brand-600"
        />
        <MetricCard
          title="Scripts to Mark"
          value={totalScripts}
          icon={Clock}
          color="text-amber-600"
        />
        <MetricCard
          title="Completed Tasks"
          value={1}
          icon={CheckCircle2}
          color="text-emerald-600"
        />
        <MetricCard
          title="Overdue Items"
          value={0}
          icon={AlertTriangle}
          color="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
            <h2 className="font-bold text-slate-800">
              Assigned Packets ({currentSemester})
            </h2>
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search course..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          {/* Task Type Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleFilterChange("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                taskFilter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => handleFilterChange("SET_PAPER")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                taskFilter === "SET_PAPER"
                  ? "bg-purple-700 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              Paper Setting
            </button>
            <button
              onClick={() => handleFilterChange("MARK_SCRIPTS")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                taskFilter === "MARK_SCRIPTS"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              Script Marking
            </button>
            <button
              onClick={() => handleFilterChange("MODERATION")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                taskFilter === "MODERATION"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              Moderation / Checking
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {packets.length === 0 ? (
              <p className="text-slate-400 text-center py-6">
                No matching exam packets found for this filter.
              </p>
            ) : (
              packets.map((packet) => (
                <div
                  key={packet.packetId}
                  className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {packet.courseCode}
                      </span>
                      {renderTaskBadge(packet.taskType)}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {packet.courseName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Holder: {packet.currentHolder} | Deadline:{" "}
                      {packet.deadline}
                      {packet.taskType === "MARK_SCRIPTS" &&
                        ` | Scripts: ${packet.scriptsCount}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedPacketId(packet.packetId)}
                      title="View Details"
                      className="p-2 hover:bg-brand-50 rounded-lg text-slate-500 hover:text-brand-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {packet.taskType === "MARK_SCRIPTS" && (
                      <button
                        onClick={() => setMarkingPacket(packet)}
                        title="Enter Marks"
                        className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCompleteTask(packet.packetId)}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Complete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-600" /> Workload Summary
            </h2>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Overall Completion Rate</span>
                <span className="text-brand-600">75%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Paper Setting Tasks:</span>
                <span className="font-bold text-slate-700">1 Active</span>
              </div>
              <div className="flex justify-between">
                <span>Script Marking Tasks:</span>
                <span className="font-bold text-slate-700">1 Active</span>
              </div>
              <div className="flex justify-between">
                <span>Moderation / Checking Tasks:</span>
                <span className="font-bold text-slate-700">1 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
        />
      )}
      {markingPacket && (
        <MarkingEntryModal
          packet={markingPacket}
          onClose={() => setMarkingPacket(null)}
        />
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="text-xs text-slate-400 font-semibold">{title}</span>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
