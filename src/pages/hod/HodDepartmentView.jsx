import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { hodApi } from "../../services/api";

const STAGE_META = [
  { key: "Paper Setting", icon: Edit },
  { key: "Paper Marking", icon: FileText },
  { key: "Paper Moderation", icon: CheckSquare },
  { key: "Second Marking", icon: Award },
];

export default function HodDepartmentView({ deptId = "D1" }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPackets, setShowAllPackets] = useState(false);

  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);

  const navigateTo = (target) => navigate(`/hod/${target}`);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      hodApi.getDepartmentStatistics(deptId),
      hodApi.getDepartmentPackets(deptId),
    ])
      .then(([statsData, packetsData]) => {
        if (!isMounted) return;
        setStats(statsData);

        // Ensure we always store an array. If packetsData is wrapped like { data: [...] }, adjust to packetsData.data
        const safePackets = Array.isArray(packetsData)
          ? packetsData
          : packetsData?.packets || packetsData?.data || [];
        setPackets(safePackets);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load department dashboard.");
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [deptId]);

  // Build the top 4 summary cards from live stats
  const summaryCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: "Total Packets",
        value: stats.totalPackets,
        icon: FileText,
        color: "text-blue-600 bg-blue-50",
      },
      {
        title: "In Progress",
        value: stats.inProgressPackets,
        icon: Clock,
        color: "text-amber-600 bg-amber-50",
      },
      {
        title: "Overdue / Delayed",
        value: stats.overduePackets,
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50",
      },
      {
        title: "Completed",
        value: stats.completedPackets,
        icon: CheckCircle2,
        color: "text-green-600 bg-green-50",
      },
    ];
  }, [stats]);

  // Group live packets into the 4 workflow stages safely
  const stageBreakdown = useMemo(() => {
    const list = Array.isArray(packets) ? packets : [];
    return STAGE_META.map(({ key, icon }) => {
      const stagePackets = list.filter((p) => p.status === key);
      const overdue = stagePackets.filter((p) => p.isOverdue).length;
      const inProgress = stagePackets.length - overdue;
      return { stageName: key, icon, inProgress, overdue, completed: 0 };
    });
  }, [packets]);

  const safePacketsList = Array.isArray(packets) ? packets : [];
  const displayedPackets = showAllPackets
    ? safePacketsList
    : safePacketsList.slice(0, 3);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Loading Department Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );
  }

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
        {summaryCards.map((stat, index) => {
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

      {/* Main Workflow Stage Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="text-blue-600" size={20} />
              Academic Workflow Stage Matrix
            </h2>
            <p className="text-xs text-gray-500">
              Live tracking of In Progress and Overdue/Delayed packets across
              all 4 key assessment stages.
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
            const totalStagePackets = stage.inProgress + stage.overdue;
            const onTrackRate =
              totalStagePackets > 0
                ? Math.round((stage.inProgress / totalStagePackets) * 100)
                : 100;

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
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
                    <span>On-track Rate</span>
                    <span>{onTrackRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${onTrackRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Packets */}
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
                            {pkt.status}
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
                            {pkt.status === "Completed"
                              ? "Completed"
                              : "In Progress"}
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
            Showing {displayedPackets.length} of {safePacketsList.length}{" "}
            packets
          </div>
        </div>

        {/* Attention Required */}
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
