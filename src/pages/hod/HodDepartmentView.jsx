import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldAlert,
  Layers,
  Edit,
  CheckSquare,
  Award,
} from "lucide-react";

export default function HodDepartmentView({ navigateTo, deptId = "D1" }) {
  const [loading, setLoading] = useState(true);
  const [showAllPackets, setShowAllPackets] = useState(false);

  // Top Summary Cards
  const [stats, setStats] = useState([
    {
      title: "Total Packets",
      value: "68",
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "In Progress",
      value: "20",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Overdue / Delayed",
      value: "6",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Completed",
      value: "42",
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
  ]);

  // Stage Breakdown Data mapping directly to the 4 workflow steps
  const [stageBreakdown, setStageBreakdown] = useState([
    {
      stageName: "Paper Setting",
      icon: Edit,
      inProgress: 4,
      overdue: 1,
      completed: 15,
    },
    {
      stageName: "Paper Marking",
      icon: FileText,
      inProgress: 8,
      overdue: 3,
      completed: 14,
    },
    {
      stageName: "Paper Moderation",
      icon: CheckSquare,
      inProgress: 3,
      overdue: 2,
      completed: 8,
    },
    {
      stageName: "Second Marking",
      icon: Award,
      inProgress: 5,
      overdue: 0,
      completed: 5,
    },
  ]);

  // Full dummy dataset for department packets with matching stage types
  const [allPackets] = useState([
    {
      packetId: "PKT-2026-101",
      courseName: "Data Structures & Algorithms",
      courseCode: "CS2101",
      cycleId: "Sem 1 - Midterm",
      stage: "Paper Setting",
      status: "In Progress",
      currentHolderName: "Dr. Alan Turing",
      isOverdue: false,
    },
    {
      packetId: "PKT-2026-102",
      courseName: "Database Management Systems",
      courseCode: "CS2102",
      cycleId: "Sem 1 - Midterm",
      stage: "Paper Marking",
      status: "In Progress",
      currentHolderName: "Prof. Grace Hopper",
      isOverdue: true,
    },
    {
      packetId: "PKT-2026-103",
      courseName: "Operating Systems",
      courseCode: "CS3101",
      cycleId: "Sem 1 - Finals",
      stage: "Paper Moderation",
      status: "In Progress",
      currentHolderName: "Dr. Linus Torvalds",
      isOverdue: true,
    },
    {
      packetId: "PKT-2026-104",
      courseName: "Software Engineering",
      courseCode: "CS3102",
      cycleId: "Sem 1 - Finals",
      stage: "Second Marking",
      status: "In Progress",
      currentHolderName: "Dr. Margaret Hamilton",
      isOverdue: false,
    },
    {
      packetId: "PKT-2026-105",
      courseName: "Artificial Intelligence",
      courseCode: "CS4101",
      cycleId: "Sem 1 - Finals",
      stage: "Paper Marking",
      status: "Completed",
      currentHolderName: "Prof. John McCarthy",
      isOverdue: false,
    },
    {
      packetId: "PKT-2026-106",
      courseName: "Computer Networks",
      courseCode: "CS3201",
      cycleId: "Sem 1 - Midterm",
      stage: "Paper Setting",
      status: "Completed",
      currentHolderName: "Dr. Vint Cerf",
      isOverdue: false,
    },
  ]);

  useEffect(() => {
    // Simulate minor async loading effect for robust component mounting
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [deptId]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Loading Department Dashboard...
        </p>
      </div>
    );
  }

  // Display top 3 items or all items based on toggle state
  const displayedPackets = showAllPackets ? allPackets : allPackets.slice(0, 3);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Head of Department Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Monitor department packets, lifecycle progression across all 4
            stages, and staff performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo("reports")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            View Reports
          </button>
          <button
            onClick={() => navigateTo("packets")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2"
          >
            Manage Packets <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workflow Stage Matrix (Paper Setting, Marking, Moderation, Second Marking) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="text-blue-600" size={20} />
              Academic Workflow Stage Matrix
            </h2>
            <p className="text-xs text-gray-500">
              Detailed tracking of In Progress, Overdue/Delayed, and Completed
              phases across all 4 key assessment stages.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In
              Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>{" "}
              Overdue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>{" "}
              Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stageBreakdown.map((stage, index) => {
            const StageIcon = stage.icon || FileText;
            const totalStagePackets =
              stage.inProgress + stage.overdue + stage.completed;
            const completionRate =
              totalStagePackets > 0
                ? Math.round((stage.completed / totalStagePackets) * 100)
                : 0;

            return (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <StageIcon size={16} />
                      </div>
                      {stage.stageName}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">
                      Total: {totalStagePackets}
                    </span>
                  </div>

                  {/* Phase Sub-metrics */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-100">
                      <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>{" "}
                        In Progress
                      </span>
                      <span className="font-bold text-amber-700">
                        {stage.inProgress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-100">
                      <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                        Overdue / Delayed
                      </span>
                      <span
                        className={`font-bold ${stage.overdue > 0 ? "text-red-600 bg-red-50 px-1.5 py-0.5 rounded" : "text-gray-700"}`}
                      >
                        {stage.overdue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-100">
                      <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                        Completed
                      </span>
                      <span className="font-bold text-green-700">
                        {stage.completed}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                    <span>Stage Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Packets Section with Working "View All" Toggle */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {showAllPackets
                  ? "All Department Packets"
                  : "Recent Department Packets"}
              </h2>
              <button
                onClick={() => setShowAllPackets(!showAllPackets)}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                {showAllPackets ? "Show Less" : "View All"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-3">Packet ID & Course</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Current Holder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {displayedPackets.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-4 text-center text-gray-500 text-xs"
                      >
                        No packets found for this department.
                      </td>
                    </tr>
                  ) : (
                    displayedPackets.map((pkt) => (
                      <tr key={pkt.packetId} className="hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="font-medium text-gray-900">
                            {pkt.packetId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {pkt.courseName} ({pkt.courseCode})
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium">
                            {pkt.stage}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pkt.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pkt.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-xs">
                          {pkt.currentHolderName}
                          {pkt.isOverdue && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                              Overdue
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-right">
            Showing {displayedPackets.length} of {allPackets.length} packets
          </div>
        </div>

        {/* Attention Required Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Attention Required
            </h2>
            <div className="space-y-3">
              <div
                onClick={() => navigateTo("overdue")}
                className="p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-600" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Overdue Packets
                    </p>
                    <p className="text-xs text-red-700">
                      Action needed to clear delays
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-red-600" />
              </div>

              <div
                onClick={() => navigateTo("workload")}
                className="p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Workload Disbalance
                    </p>
                    <p className="text-xs text-blue-700">
                      Check lecturer assignments
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigateTo("previous")}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Access Previous Academic Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
