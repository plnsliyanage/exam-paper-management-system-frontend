import React, { useEffect, useState } from "react";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";
import SchedulePrintModal from "../../components/printing/SchedulePrintModal";
import LecturerHeader from "../../components/lecturer/LecturerHeader";
import MetricCard from "../../components/lecturer/MetricCard";
import TaskFilterTabs from "../../components/lecturer/TaskFilterTabs";
import PacketCard from "../../components/lecturer/PacketCard";
import WorkloadSummary from "../../components/lecturer/WorkloadSummary";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useAcademicCycle } from "../../context/AcademicCycleContext";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Search,
  FileEdit,
  Send,
  Printer,
} from "lucide-react";

export default function LecturerDashboard() {
  const { getUsername } = useAuth();
  const { selectedCycleId } = useAcademicCycle();
  const username = getUsername() || "Lecturer";

  const [currentUser] = useState({
    id: username,
    name: username,
    department: "Academic Faculty",
    currentSemester: "2026-S1",
  });

  const currentSemester = currentUser.currentSemester;
  const [packets, setPackets] = useState([]);
  const [allPackets, setAllPackets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleScope, setRoleScope] = useState("SCOPE_ALL");
  const [taskFilter, setTaskFilter] = useState("ALL");
  const [dashboardStats, setDashboardStats] = useState({
    totalActiveTasks: 0,
    assignedPreparationCount: 0,
    inModerationCount: 0,
    approvedPrintCount: 0,
    markingCount: 0,
    completedTasks: 0,
    overdueItems: 0,
    completionRate: 0,
    pendingDraftCount: 0,
    // Moderation specific stats
    moderationTotal: 0,
    pendingModerationCount: 0,
    approvedModerationCount: 0,
  });

  const [pendingModerationReviews, setPendingModerationReviews] = useState([]);
  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);
  const [scheduleModalPacket, setScheduleModalPacket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [username, selectedCycleId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const packetsResponse = await axiosInstance.get("/packets");
      const rawPackets = Array.isArray(packetsResponse.data) ? packetsResponse.data : [];

      const normalizedUsername = (username || "").toLowerCase();

      const packetsWithMeta = rawPackets.map((p) => {
        const isMod = (p.moderatorUsername && p.moderatorUsername.toLowerCase() === normalizedUsername) ||
                      (p.moderatorName && p.moderatorName.toLowerCase() === normalizedUsername);
        const isAuthor = (p.lecturerUsername && p.lecturerUsername.toLowerCase() === normalizedUsername) ||
                         (p.lecturerName && p.lecturerName.toLowerCase() === normalizedUsername) ||
                         !isMod;

        let defaultTaskType = isMod ? "MODERATION" : "SET_PAPER";
        if (isAuthor && (p.status === "APPROVED" || p.status === "PRINTING_QUEUE" || p.status === "PRINTING")) {
          defaultTaskType = "MARK_SCRIPTS";
        }
        return {
          ...p,
          id: p.id || (p.packetId && p.packetId.includes("-") ? parseInt(p.packetId.split("-")[2], 10) : p.packetId),
          taskType: p.taskType || defaultTaskType,
          isAuthor,
          isMod,
          currentHolderName: p.lecturerName,
          scriptsCount: p.scriptsCount || 0,
        };
      });

      // Filter packets requiring moderation review
      const pendingReviews = packetsWithMeta.filter(
        (p) => p.isMod && ["SUBMITTED", "UNDER_MODERATION"].includes(p.status)
      );
      setPendingModerationReviews(pendingReviews);

      setAllPackets(packetsWithMeta);
      applyFilters(searchQuery, roleScope, taskFilter, packetsWithMeta);
      calculateStats(packetsWithMeta);
    } catch (error) {
      console.error("Failed to load lecturer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalActive = data.length;
    const assignedPreparationCount = data.filter((p) => p.isAuthor && ["PENDING", "DRAFT", "REJECTED"].includes(p.status)).length;
    const inModerationCount = data.filter((p) => p.isAuthor && ["SUBMITTED", "UNDER_MODERATION"].includes(p.status)).length;
    const approvedPrintCount = data.filter((p) => p.isAuthor && ["APPROVED", "PRINTING", "PRINTING_QUEUE", "PAPERS STORED", "PAPERS_STORED"].includes(p.status)).length;
    const markingCount = data.filter((p) => p.isAuthor && ["ANSWER SHEETS TAKEN", "ANSWER_SHEETS_TAKEN", "MARKING", "UNDER_MARKING"].includes(p.status)).length;
    const completed = data.filter((p) => ["COMPLETED", "MARKING COMPLETE", "MARKING_COMPLETE"].includes(p.status)).length;
    const overdue = data.filter((p) => p.overdue).length;
    const rate = totalActive > 0 ? Math.round((completed / totalActive) * 100) : 0;

    // Moderation stats
    const modPackets = data.filter((p) => p.isMod);
    const pendingMod = modPackets.filter((p) => ["SUBMITTED", "UNDER_MODERATION"].includes(p.status)).length;
    const approvedMod = modPackets.filter((p) => !["SUBMITTED", "UNDER_MODERATION", "DRAFT", "PENDING", "REJECTED"].includes(p.status)).length;

    setDashboardStats({
      totalActiveTasks: totalActive,
      assignedPreparationCount,
      inModerationCount,
      approvedPrintCount,
      markingCount,
      completedTasks: completed,
      overdueItems: overdue,
      completionRate: rate,
      pendingDraftCount: assignedPreparationCount,
      moderationTotal: modPackets.length,
      pendingModerationCount: pendingMod,
      approvedModerationCount: approvedMod,
    });
  };

  const handleScopeChange = (scope) => {
    setRoleScope(scope);
    applyFilters(searchQuery, scope, taskFilter, allPackets);
  };

  const handleFilterChange = (type) => {
    setTaskFilter(type);
    applyFilters(searchQuery, roleScope, type, allPackets);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    applyFilters(value, roleScope, taskFilter, allPackets);
  };

  const applyFilters = (query, scope, type, sourceData) => {
    let filtered = [...sourceData];

    // Scope filter (All / Authored / Moderation)
    if (scope === "SCOPE_AUTHORED") {
      filtered = filtered.filter((p) => p.isAuthor);
    } else if (scope === "SCOPE_MODERATION") {
      filtered = filtered.filter((p) => p.isMod);
    }

    if (type !== "ALL") {
      if (type === "PENDING") {
        filtered = filtered.filter((p) => p.status === "PENDING");
      } else if (type === "DRAFT") {
        filtered = filtered.filter((p) => p.status === "DRAFT");
      } else if (type === "SUBMITTED") {
        filtered = filtered.filter((p) => ["SUBMITTED", "UNDER_MODERATION", "SUBMITTED_FOR_MODERATION"].includes(p.status));
      } else if (type === "APPROVED") {
        filtered = filtered.filter((p) => p.status === "APPROVED");
      } else if (type === "REJECTED") {
        filtered = filtered.filter((p) => p.status === "REJECTED");
      } else if (type === "PRINTING") {
        filtered = filtered.filter((p) => ["PRINTING", "PRINTING_QUEUE"].includes(p.status));
      } else if (type === "PAPERS STORED") {
        filtered = filtered.filter((p) => ["PAPERS STORED", "PAPERS_STORED"].includes(p.status));
      } else if (type === "ANSWER SHEETS TAKEN") {
        filtered = filtered.filter((p) => ["ANSWER SHEETS TAKEN", "ANSWER_SHEETS_TAKEN"].includes(p.status));
      } else if (type === "MARKING") {
        filtered = filtered.filter((p) => ["MARKING", "UNDER_MARKING"].includes(p.status));
      } else if (type === "COMPLETED") {
        filtered = filtered.filter((p) => ["COMPLETED", "MARKING COMPLETE", "MARKING_COMPLETE"].includes(p.status));
      }
    }
    if (query.trim()) {
      const searchValue = query.trim().toLowerCase();
      filtered = filtered.filter((packet) => {
        const courseCode = packet.courseCode?.toLowerCase() || "";
        const courseName = packet.courseName?.toLowerCase() || "";
        const packetId = String(packet.packetId || "").toLowerCase();
        const lecturerName = packet.lecturerName?.toLowerCase() || "";
        const moderatorName = packet.moderatorName?.toLowerCase() || "";
        return (
          courseCode.includes(searchValue) ||
          courseName.includes(searchValue) ||
          packetId.includes(searchValue) ||
          lecturerName.includes(searchValue) ||
          moderatorName.includes(searchValue)
        );
      });
    }
    setPackets(filtered);
  };

  const handleSubmitPacket = async (packetId) => {
    try {
      const numericId = typeof packetId === "string" && packetId.includes("-")
        ? parseInt(packetId.split("-")[2], 10)
        : packetId;
      await axiosInstance.put(`/packets/${numericId}/status`, { action: "SUBMIT" });
      await loadDashboardData();
    } catch (error) {
      console.error("Error submitting packet:", error);
      alert(error?.response?.data?.message || "Failed to submit packet.");
    }
  };

  const handleCompleteTask = async (packetId, action = "COMPLETE") => {
    try {
      const numericId = typeof packetId === "string" && packetId.includes("-")
        ? parseInt(packetId.split("-")[2], 10)
        : packetId;
      await axiosInstance.put(`/packets/${numericId}/status`, { action });
      await loadDashboardData();
    } catch (error) {
      console.error("Error completing task:", error);
      alert(error?.response?.data?.message || "Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading lecturer dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <LecturerHeader currentUser={currentUser} currentSemester={currentSemester} />

      {/* Moderation Review Action Banner (Active if peer papers are pending review) */}
      {pendingModerationReviews.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-indigo-500/10 border-2 border-purple-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <div>
                <h3 className="text-sm font-bold text-purple-900">
                  Moderation Review Required ({pendingModerationReviews.length})
                </h3>
                <p className="text-xs text-purple-700">
                  You are assigned as the Peer Moderator for the following exam paper(s). Please review and submit your decision.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingModerationReviews.map((pkt) => (
              <div
                key={pkt.packetId || pkt.id}
                className="bg-white p-3.5 rounded-xl border border-purple-200 flex items-center justify-between shadow-xs hover:border-purple-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{pkt.courseCode}</span>
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium border border-purple-100">
                      {pkt.packetId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{pkt.courseName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Author: <strong className="text-slate-600">{pkt.lecturerName}</strong></p>
                </div>
                <button
                  onClick={() => setSelectedPacketId(pkt.packetId || pkt.id)}
                  className="px-3 py-1.5 bg-[#7c4dff] hover:bg-[#6a3df0] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Review Paper →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Drafts / Pending Prep"
          value={dashboardStats.assignedPreparationCount}
          icon={FileEdit}
          color="text-amber-600"
        />
        <MetricCard
          title="In Moderation (Author)"
          value={dashboardStats.inModerationCount}
          icon={Clock}
          color="text-purple-600"
        />
        <MetricCard
          title="Assigned to Moderate"
          value={dashboardStats.moderationTotal}
          icon={CheckCircle2}
          color="text-blue-600"
        />
        <MetricCard
          title="Completed Packets"
          value={dashboardStats.completedTasks}
          icon={CheckCircle2}
          color="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
            <h2 className="font-bold text-slate-800 text-sm">
              My Academic Packets ({currentSemester})
            </h2>
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search course or staff..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#7c4dff]/20"
              />
            </div>
          </div>

          <TaskFilterTabs
            roleScope={roleScope}
            onScopeChange={handleScopeChange}
            taskFilter={taskFilter}
            onFilterChange={handleFilterChange}
          />

          <div className="space-y-3 pt-2">
            {packets.length === 0 ? (
              <p className="text-slate-400 text-center py-6">
                No matching exam packets found in this view.
              </p>
            ) : (
              packets.map((packet) => (
                <PacketCard
                  key={packet.packetId || packet.id}
                  packet={packet}
                  onSelectDetail={setSelectedPacketId}
                  onOpenMarking={setMarkingPacket}
                  onCompleteTask={handleCompleteTask}
                  onSubmitPacket={handleSubmitPacket}
                  onOpenSchedulePrint={setScheduleModalPacket}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <WorkloadSummary dashboardStats={dashboardStats} />
        </div>
      </div>

      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
          onStatusUpdated={loadDashboardData}
        />
      )}

      {markingPacket && (
        <MarkingEntryModal
          packet={markingPacket}
          lecturerId={username}
          onClose={() => setMarkingPacket(null)}
          onSuccess={async () => {
            setMarkingPacket(null);
            await loadDashboardData();
          }}
        />
      )}

      {scheduleModalPacket && (
        <SchedulePrintModal
          isOpen={!!scheduleModalPacket}
          packet={scheduleModalPacket}
          onClose={() => setScheduleModalPacket(null)}
          onSuccess={async () => {
            setScheduleModalPacket(null);
            await loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
