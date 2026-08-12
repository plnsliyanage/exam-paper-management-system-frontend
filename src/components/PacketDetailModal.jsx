import React, { useState } from "react";
import {
  X,
  BookOpen,
  Clock,
  User,
  ShieldAlert,
  MessageSquare,
  Send,
} from "lucide-react";

// Comprehensive Mock Database for Exam Packets
const MOCK_PACKET_DETAILS = {
  "PKT-2026-01": {
    packetId: "PKT-2026-01",
    courseCode: "CS1022",
    courseName: "Data Structures and Algorithms",
    department: "Department of Computer Science",
    semester: "2026-S1",
    status: "MARKING",
    currentHolder: "Dr. Samantha Perera",
    deadline: "2026-06-15",
    scriptsCount: 60,
    history: [
      { stage: "Created", date: "2026-05-10", holder: "Exam Branch" },
      { stage: "Printed", date: "2026-05-15", holder: "Printing Center" },
      {
        stage: "Assigned for Marking",
        date: "2026-05-20",
        holder: "Dr. Samantha Perera",
      },
    ],
    comments: [
      {
        author: "Exam Coordinator",
        text: "Please ensure double-checking of question 4.",
        time: "May 20, 2026",
      },
      {
        author: "Dr. Samantha Perera",
        text: "Received scripts in good condition.",
        time: "May 21, 2026",
      },
    ],
  },
  "PKT-2026-02": {
    packetId: "PKT-2026-02",
    courseCode: "CS2032",
    courseName: "Database Systems",
    department: "Department of Computer Science",
    semester: "2026-S1",
    status: "REVIEW",
    currentHolder: "Dr. Samantha Perera",
    deadline: "2026-06-20",
    scriptsCount: 60,
    history: [
      { stage: "Created", date: "2026-05-12", holder: "Exam Branch" },
      {
        stage: "Marking Completed",
        date: "2026-06-01",
        holder: "Dr. Samantha Perera",
      },
      { stage: "Under Review", date: "2026-06-02", holder: "Department Head" },
    ],
    comments: [
      {
        author: "Dept Head",
        text: "Reviewing grade boundaries.",
        time: "June 3, 2026",
      },
    ],
  },
  "PKT-2026-03": {
    packetId: "PKT-2026-03",
    courseCode: "CS3041",
    courseName: "Software Engineering",
    department: "Department of Computer Science",
    semester: "2026-S1",
    status: "PREPARATION",
    currentHolder: "Exam Branch",
    deadline: "2026-07-01",
    scriptsCount: 55,
    history: [
      {
        stage: "Paper Drafted",
        date: "2026-05-01",
        holder: "Lecturer In-Charge",
      },
    ],
    comments: [],
  },
};

export default function PacketDetailModal({
  packetId,
  onClose,
  onStatusUpdated,
}) {
  const [packet, setPacket] = useState(
    MOCK_PACKET_DETAILS[packetId] || {
      packetId: packetId,
      courseCode: "CS0000",
      courseName: "Unknown Course",
      department: "General Department",
      semester: "2026-S1",
      status: "PENDING",
      currentHolder: "System",
      deadline: "2026-06-30",
      scriptsCount: 0,
      history: [{ stage: "Initialized", date: "2026-05-01", holder: "System" }],
      comments: [],
    },
  );

  const [newComment, setNewComment] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const updatedComments = [
      ...packet.comments,
      { author: "Dr. Samantha Perera", text: newComment, time: "Just now" },
    ];
    setPacket({ ...packet, comments: updatedComments });
    setNewComment("");
  };

  const handleComplete = () => {
    setIsCompleted(true);
    if (onStatusUpdated) {
      onStatusUpdated(packet.packetId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-xs">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {packet.courseCode}: {packet.courseName}
              </h2>
              <p className="text-[11px] text-slate-400">
                Packet ID: {packet.packetId} | Semester: {packet.semester}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Department</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {packet.department}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Current Status</span>
              <span className="font-bold text-brand-600 mt-0.5 block">
                {isCompleted ? "COMPLETED" : packet.status}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Current Holder</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {packet.currentHolder}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Deadline</span>
              <span className="font-bold text-rose-600 mt-0.5 block">
                {packet.deadline}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Answer Scripts</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {packet.scriptsCount} Scripts
              </span>
            </div>
          </div>

          {/* Movement History / Workflow Stage */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <Clock className="w-3.5 h-3.5 text-brand-600" /> Packet Movement &
              Workflow History
            </h3>
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              {packet.history.map((h, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-2 last:border-none last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                    <span className="font-bold text-slate-700">{h.stage}</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    Holder: {h.holder} ({h.date})
                  </span>
                </div>
              ))}
              {isCompleted && (
                <div className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    <span className="font-bold text-slate-700">Completed</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    Holder: System (Just now)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comments & Feedback Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-400">
              <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Comments
              & Feedback
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {packet.comments.length > 0 ? (
                packet.comments.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{c.author}</span>
                      <span className="text-[10px] text-slate-400">
                        {c.time}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">
                  No comments recorded yet.
                </p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment or feedback..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`px-4 py-2 font-semibold rounded-xl text-white transition-colors ${
              isCompleted
                ? "bg-slate-900 cursor-not-allowed opacity-90"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isCompleted ? "Completed" : "Complete"}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
