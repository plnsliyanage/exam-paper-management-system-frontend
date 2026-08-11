import React, { useState } from "react";
import { Search, Eye, Clock, FileText } from "lucide-react";

export default function HodDepartmentPacketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLecturer, setSelectedLecturer] = useState("All");
  const [activeModalPacket, setActiveModalPacket] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [commentText, setCommentText] = useState("");

  const [packets, setPackets] = useState([
    {
      id: "PKT-2026-012",
      course: "Advanced Software Engineering",
      code: "CS401",
      academicCycle: "2026/2027 Sem 1",
      lecturer: "Dr. Alice Smith",
      moderator: "Prof. Bob Jones",
      status: "Pending Moderation",
      currentHolder: "Prof. Bob Jones",
      lastUpdatedUser: "Dr. Alice Smith",
      lastUpdatedTime: "2026-08-05 14:20",
      totalPapers: 45,
      isOverdue: false,
      history: [
        { stage: "Created", user: "Dr. Alice Smith", time: "2026-08-01 10:00" },
        {
          stage: "Marking Completed",
          user: "Dr. Alice Smith",
          time: "2026-08-04 16:30",
        },
        {
          stage: "Sent for Moderation",
          user: "Dr. Alice Smith",
          time: "2026-08-05 14:20",
        },
      ],
      comments: [
        {
          sender: "Dr. Alice Smith",
          text: "Marking scheme uploaded and papers checked.",
          time: "2026-08-04 16:32",
        },
      ],
    },
    {
      id: "PKT-2026-011",
      course: "Database Management Systems",
      code: "CS302",
      academicCycle: "2026/2027 Sem 1",
      lecturer: "Dr. Charlie Brown",
      moderator: "Dr. Alice Smith",
      status: "Marking in Progress",
      currentHolder: "Dr. Charlie Brown",
      lastUpdatedUser: "Exam Dept",
      lastUpdatedTime: "2026-07-28 09:15",
      totalPapers: 120,
      isOverdue: true,
      history: [
        {
          stage: "Created",
          user: "Dr. Charlie Brown",
          time: "2026-07-25 11:00",
        },
        {
          stage: "Assigned Lecturer",
          user: "Exam Dept",
          time: "2026-07-28 09:15",
        },
      ],
      comments: [
        {
          sender: "HOD",
          text: "Please expedite marking, deadline is approaching.",
          time: "2026-08-02 10:00",
        },
      ],
    },
    {
      id: "PKT-2026-009",
      course: "Data Structures & Algorithms",
      code: "CS201",
      academicCycle: "2025/2026 Sem 2",
      lecturer: "Prof. Diana Prince",
      moderator: "Dr. Evans",
      status: "Completed",
      currentHolder: "Archive",
      lastUpdatedUser: "HOD",
      lastUpdatedTime: "2026-06-15 17:00",
      totalPapers: 85,
      isOverdue: false,
      history: [
        {
          stage: "Created",
          user: "Prof. Diana Prince",
          time: "2026-06-01 09:00",
        },
        { stage: "Moderated", user: "Dr. Evans", time: "2026-06-10 14:00" },
        {
          stage: "Approved & Completed",
          user: "HOD",
          time: "2026-06-15 17:00",
        },
      ],
      comments: [],
    },
  ]);

  const filteredPackets = packets.filter((pkt) => {
    const matchesSearch =
      pkt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkt.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkt.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkt.moderator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkt.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCycle =
      selectedCycle === "All" || pkt.academicCycle === selectedCycle;
    const matchesStatus =
      selectedStatus === "All" || pkt.status === selectedStatus;
    const matchesLecturer =
      selectedLecturer === "All" || pkt.lecturer === selectedLecturer;
    return matchesSearch && matchesCycle && matchesStatus && matchesLecturer;
  });

  const handleAddComment = () => {
    if (!commentText.trim() || !activeModalPacket) return;
    const updated = packets.map((p) => {
      if (p.id === activeModalPacket.id) {
        const newComments = [
          ...p.comments,
          {
            sender: "HOD",
            text: commentText,
            time: new Date().toISOString().slice(0, 16).replace("T", " "),
          },
        ];
        const updatedPacket = { ...p, comments: newComments };
        setActiveModalPacket(updatedPacket);
        return updatedPacket;
      }
      return p;
    });
    setPackets(updated);
    setCommentText("");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Packets Management
          </h1>
          <p className="text-sm text-gray-500">
            View, track, search, filter, and review all department assessment
            packets.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by course, lecturer, moderator, status, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              <option value="All">All Cycles</option>
              <option value="2026/2027 Sem 1">2026/2027 Sem 1</option>
              <option value="2025/2026 Sem 2">2025/2026 Sem 2</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Marking in Progress">Marking in Progress</option>
              <option value="Pending Moderation">Pending Moderation</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            >
              <option value="All">All Lecturers</option>
              <option value="Dr. Alice Smith">Dr. Alice Smith</option>
              <option value="Dr. Charlie Brown">Dr. Charlie Brown</option>
              <option value="Prof. Diana Prince">Prof. Diana Prince</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course & Papers</th>
                <th className="py-3 px-4">Lecturer / Moderator</th>
                <th className="py-3 px-4">Status & Holder</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredPackets.length > 0 ? (
                filteredPackets.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">
                      {pkt.id}
                      {pkt.isOverdue && (
                        <span className="block text-[10px] text-red-600 font-bold">
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {pkt.course}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>{pkt.academicCycle}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <FileText size={12} className="text-gray-400" />
                          {pkt.totalPapers} Papers
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-800">{pkt.lecturer}</div>
                      <div className="text-xs text-gray-500">
                        Mod: {pkt.moderator}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                        {pkt.status}
                      </span>
                      <div className="text-xs text-gray-500">
                        Holder:{" "}
                        <span className="font-medium text-gray-700">
                          {pkt.currentHolder}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      <div>{pkt.lastUpdatedTime}</div>
                      <div className="text-gray-400">
                        by {pkt.lastUpdatedUser}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveModalPacket(pkt);
                          setActiveTab("details");
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No packets found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModalPacket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {activeModalPacket.id} - {activeModalPacket.course}
                </h3>
                <p className="text-xs text-gray-500">
                  {activeModalPacket.academicCycle} | Code:{" "}
                  {activeModalPacket.code}
                </p>
              </div>
              <button
                onClick={() => setActiveModalPacket(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex border-b border-gray-200 bg-gray-50 px-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${activeTab === "details" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-gray-900"}`}
              >
                Full Details
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${activeTab === "history" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-gray-900"}`}
              >
                Movement History
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 ${activeTab === "comments" ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-gray-600 hover:text-gray-900"}`}
              >
                Communication ({activeModalPacket.comments.length})
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {activeTab === "details" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Total Papers to Mark
                    </span>
                    <span className="font-semibold text-blue-600 text-base">
                      {activeModalPacket.totalPapers} Papers
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Current Status
                    </span>
                    <span className="font-medium text-gray-800">
                      {activeModalPacket.status}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Lecturer
                    </span>
                    <span className="font-medium text-gray-800">
                      {activeModalPacket.lecturer}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Moderator
                    </span>
                    <span className="font-medium text-gray-800">
                      {activeModalPacket.moderator}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Current Holder
                    </span>
                    <span className="font-medium text-gray-800">
                      {activeModalPacket.currentHolder}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">
                      Last Updated By
                    </span>
                    <span className="font-medium text-gray-800">
                      {activeModalPacket.lastUpdatedUser} (
                      {activeModalPacket.lastUpdatedTime})
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-3">
                  {activeModalPacket.history.map((hist, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full mt-0.5">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {hist.stage}
                        </p>
                        <p className="text-xs text-gray-500">
                          Handled by: {hist.user} at {hist.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {activeModalPacket.comments.length > 0 ? (
                      activeModalPacket.comments.map((comm, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded-lg text-sm border border-gray-100"
                        >
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="font-semibold text-gray-800">
                              {comm.sender}
                            </span>
                            <span>{comm.time}</span>
                          </div>
                          <p className="text-gray-700">{comm.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No comments or feedback yet.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <input
                      type="text"
                      placeholder="Send comment or feedback..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setActiveModalPacket(null)}
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
