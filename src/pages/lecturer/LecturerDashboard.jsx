import React, { useEffect, useState } from "react";

import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";

import { lecturerApi } from "../../services/api";

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

export default function LecturerDashboard() {
  // ============================================================
  // CURRENT USER
  // ============================================================

  const [currentUser] = useState({
    id: "U1",
    name: "Dr. Samantha Perera",
    department: "Department of Computer Science",
    currentSemester: "2026-S1",
  });

  const currentSemester = currentUser.currentSemester;

  // ============================================================
  // PACKETS
  // ============================================================

  const [packets, setPackets] = useState([]);
  const [allPackets, setAllPackets] = useState([]);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState("ALL");

  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const [dashboardStats, setDashboardStats] = useState({
    totalActiveTasks: 0,
    scriptsToMark: 0,
    completedTasks: 0,
    overdueItems: 0,
    completionRate: 0,
    paperSettingCount: 0,
    scriptMarkingCount: 0,
    moderationCount: 0,
  });

  // ============================================================
  // MODALS
  // ============================================================

  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    loadDashboardData();
  }, [currentUser.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      console.log("Loading lecturer dashboard for:", currentUser.id);

      // ----------------------------------------------------------
      // 1. GET ASSIGNED PACKETS
      // ----------------------------------------------------------

      const packetsResponse = await lecturerApi.getPackets(currentUser.id);

      let packetData = Array.isArray(packetsResponse.data)
        ? packetsResponse.data
        : [];

      console.log("Assigned packets:", packetData);

      // ----------------------------------------------------------
      // 2. GET MARKING INFORMATION FOR MARK_SCRIPTS PACKETS
      // ----------------------------------------------------------

      const packetsWithMarking = await Promise.all(
        packetData.map(async (packet) => {
          if (packet.taskType !== "MARK_SCRIPTS") {
            return {
              ...packet,
              scriptsCount: 0,
            };
          }

          try {
            const markingResponse = await lecturerApi.getMarkingByPacketId(
              packet.packetId,
            );

            return {
              ...packet,
              scriptsCount: markingResponse.data?.totalScripts ?? 0,
            };
          } catch (error) {
            console.warn(
              `Could not load marking information for packet ${packet.packetId}`,
              error,
            );

            return {
              ...packet,
              scriptsCount: 0,
            };
          }
        }),
      );

      // ----------------------------------------------------------
      // 3. SAVE PACKETS
      // ----------------------------------------------------------

      setAllPackets(packetsWithMarking);
      setPackets(packetsWithMarking);

      // ----------------------------------------------------------
      // 4. GET DASHBOARD STATISTICS
      // ----------------------------------------------------------

      try {
        const statsResponse = await lecturerApi.getDashboard(currentUser.id);

        console.log("Dashboard statistics:", statsResponse.data);

        if (statsResponse.data) {
          const scriptMarkingPackets = packetsWithMarking.filter(
            (p) => p.taskType === "MARK_SCRIPTS",
          );
          const paperSettingCount = packetsWithMarking.filter(
            (p) => p.taskType === "SET_PAPER",
          ).length;
          const scriptMarkingCount = scriptMarkingPackets.length;
          const moderationCount = packetsWithMarking.filter(
            (p) => p.taskType === "MODERATION",
          ).length;

          setDashboardStats({
            totalActiveTasks: statsResponse.data.totalActiveTasks ?? 0,
            scriptsToMark: statsResponse.data.totalScripts ?? 0,
            completedTasks: statsResponse.data.completedTasks ?? 0,
            overdueItems: statsResponse.data.overdueItems ?? 0,
            completionRate: 0,
            paperSettingCount,
            scriptMarkingCount,
            moderationCount,
          });
        } else {
          calculateFallbackStats(packetsWithMarking);
        }
      } catch (error) {
        console.warn(
          "Dashboard summary endpoint failed. Using fallback calculation.",
          error,
        );

        calculateFallbackStats(packetsWithMarking);
      }
    } catch (error) {
      console.error("Failed to load lecturer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FALLBACK STATISTICS
  // ============================================================

  const calculateFallbackStats = (data) => {
    const scriptMarkingPackets = data.filter(
      (packet) => packet.taskType === "MARK_SCRIPTS",
    );

    const scripts = scriptMarkingPackets.reduce(
      (total, packet) => total + Number(packet.scriptsCount || 0),
      0,
    );

    const paperSettingCount = data.filter(
      (packet) => packet.taskType === "SET_PAPER",
    ).length;

    const scriptMarkingCount = scriptMarkingPackets.length;

    const moderationCount = data.filter(
      (packet) => packet.taskType === "MODERATION",
    ).length;

    setDashboardStats({
      totalActiveTasks: data.length,
      scriptsToMark: scripts,
      completedTasks: 0,
      overdueItems: 0,
      completionRate: 0,
      paperSettingCount,
      scriptMarkingCount,
      moderationCount,
    });
  };

  // ============================================================
  // FILTER
  // ============================================================

  const handleFilterChange = (type) => {
    setTaskFilter(type);
    applyFilters(searchQuery, type, allPackets);
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    applyFilters(value, taskFilter, allPackets);
  };

  // ============================================================
  // APPLY SEARCH + FILTER
  // ============================================================

  const applyFilters = (query, type, sourceData) => {
    let filtered = [...sourceData];

    if (type !== "ALL") {
      filtered = filtered.filter((packet) => packet.taskType === type);
    }

    if (query.trim()) {
      const searchValue = query.trim().toLowerCase();

      filtered = filtered.filter((packet) => {
        const courseCode = packet.courseCode?.toLowerCase() || "";
        const courseName = packet.courseName?.toLowerCase() || "";
        const packetId = packet.packetId?.toLowerCase() || "";

        return (
          courseCode.includes(searchValue) ||
          courseName.includes(searchValue) ||
          packetId.includes(searchValue)
        );
      });
    }

    setPackets(filtered);
  };

  // ============================================================
  // COMPLETE TASK
  // ============================================================

  const handleCompleteTask = async (packetId) => {
    try {
      await lecturerApi.completeTask(packetId);

      const updatePacketStatus = (list) =>
        list.map((p) =>
          p.packetId === packetId ? { ...p, status: "COMPLETED" } : p,
        );

      setAllPackets((prev) => updatePacketStatus(prev));
      setPackets((prev) => updatePacketStatus(prev));

      alert(`Task completed for packet: ${packetId}`);
      await loadDashboardData();
    } catch (error) {
      console.error("Error completing task:", error);
      alert(error?.response?.data || "Failed to complete task.");
    }
  };

  // ============================================================
  // TASK BADGE
  // ============================================================

  const renderTaskBadge = (taskType) => {
    switch (taskType) {
      case "SET_PAPER":
        return (
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1 w-fit">
            <FileText className="w-3 h-3" />
            Paper Setting
          </span>
        );

      case "MARK_SCRIPTS":
        return (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 w-fit">
            <CheckSquare className="w-3 h-3" />
            Script Marking
          </span>
        );

      case "MODERATION":
        return (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3 h-3" />
            Moderation / Checking
          </span>
        );

      default:
        return null;
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Lecturer Workspace
            </h1>

            <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Semester: {currentSemester}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Tasks"
          value={dashboardStats.totalActiveTasks}
          icon={BookOpen}
          color="text-brand-600"
        />

        <MetricCard
          title="Scripts to Mark"
          value={dashboardStats.scriptsToMark}
          icon={Clock}
          color="text-amber-600"
        />

        <MetricCard
          title="Completed Tasks"
          value={dashboardStats.completedTasks}
          icon={CheckCircle2}
          color="text-emerald-600"
        />

        <MetricCard
          title="Overdue Items"
          value={dashboardStats.overdueItems}
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
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {["ALL", "SET_PAPER", "MARK_SCRIPTS", "MODERATION"].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  taskFilter === type
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "ALL" ? "All Tasks" : type.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {packets.length === 0 ? (
              <p className="text-slate-400 text-center py-6">
                No matching exam packets found.
              </p>
            ) : (
              packets.map((packet) => {
                const isCompleted = packet.status === "COMPLETED";

                return (
                  <div
                    key={packet.packetId}
                    className={`p-4 border rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                      isCompleted
                        ? "border-emerald-200 bg-emerald-50/30 opacity-75"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {packet.courseCode}
                        </span>

                        {renderTaskBadge(packet.taskType)}

                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm">
                        {packet.courseName}
                      </h3>

                      <p className="text-xs text-slate-400">
                        Holder: {packet.currentHolder || "Not assigned"} |
                        Deadline: {packet.deadline || "N/A"}
                        {packet.taskType === "MARK_SCRIPTS" && (
                          <>
                            {" | "}
                            Scripts:{" "}
                            <span className="font-bold text-amber-600">
                              {packet.scriptsCount ?? 0}
                            </span>
                          </>
                        )}
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

                      {packet.taskType === "MARK_SCRIPTS" && !isCompleted && (
                        <button
                          onClick={() => setMarkingPacket(packet)}
                          title="Enter Marks"
                          className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          !isCompleted && handleCompleteTask(packet.packetId)
                        }
                        disabled={isCompleted}
                        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                          isCompleted
                            ? "bg-slate-900 text-white cursor-not-allowed"
                            : "bg-rose-600 text-white hover:bg-rose-700"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {isCompleted ? "Completed" : "Complete"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              Workload Summary
            </h2>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Overall Completion Rate</span>

                <span className="text-brand-600">
                  {dashboardStats.completionRate}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(dashboardStats.completionRate || 0), 0),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Paper Setting Tasks:</span>

                <span className="font-bold text-slate-700">
                  {dashboardStats.paperSettingCount} Active
                </span>
              </div>

              <div className="flex justify-between">
                <span>Script Marking Tasks:</span>

                <span className="font-bold text-slate-700">
                  {dashboardStats.scriptMarkingCount} Active
                </span>
              </div>

              <div className="flex justify-between">
                <span>Moderation / Checking Tasks:</span>

                <span className="font-bold text-slate-700">
                  {dashboardStats.moderationCount} Active
                </span>
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
          lecturerId={currentUser.id}
          onClose={() => setMarkingPacket(null)}
          onSuccess={async () => {
            setMarkingPacket(null);
            await loadDashboardData();
          }}
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

        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value ?? 0}</p>
      </div>
    </div>
  );
}
