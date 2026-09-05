import React, { useEffect, useState } from "react";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";
import LecturerHeader from "../../components/lecturer/LecturerHeader";
import MetricCard from "../../components/lecturer/MetricCard";
import TaskFilterTabs from "../../components/lecturer/TaskFilterTabs";
import PacketCard from "../../components/lecturer/PacketCard";
import WorkloadSummary from "../../components/lecturer/WorkloadSummary";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
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
  const [taskFilter, setTaskFilter] = useState("ALL");
  const [dashboardStats, setDashboardStats] = useState({
    totalActiveTasks: 0,
    assignedPreparationCount: 0,
    inModerationCount: 0,
    approvedPrintCount: 0,
    completedTasks: 0,
    overdueItems: 0,
    completionRate: 0,
  });

  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [username]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const packetsResponse = await axiosInstance.get("/packets");
      const rawPackets = Array.isArray(packetsResponse.data) ? packetsResponse.data : [];

      const packetsWithMeta = rawPackets.map((p) => {
        let defaultTaskType = "SET_PAPER";
        if (p.status === "APPROVED" || p.status === "PRINTING_QUEUE" || p.status === "PRINTING") {
          defaultTaskType = "MARK_SCRIPTS";
        } else if (p.status === "SUBMITTED" || p.status === "UNDER_MODERATION") {
          defaultTaskType = "MODERATION";
        }
        return {
          ...p,
          id: p.id || (p.packetId && p.packetId.includes("-") ? parseInt(p.packetId.split("-")[2], 10) : p.packetId),
          taskType: p.taskType || defaultTaskType,
          currentHolderName: p.lecturerName,
          scriptsCount: p.scriptsCount || 0,
        };
      });

      setAllPackets(packetsWithMeta);
      applyFilters(searchQuery, taskFilter, packetsWithMeta);
      calculateStats(packetsWithMeta);
    } catch (error) {
      console.error("Failed to load lecturer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalActive = data.length;
    const assignedPreparationCount = data.filter((p) => ["PENDING", "DRAFT", "REJECTED"].includes(p.status)).length;
    const inModerationCount = data.filter((p) => ["SUBMITTED", "UNDER_MODERATION"].includes(p.status)).length;
    const approvedPrintCount = data.filter((p) => ["APPROVED", "PRINTING", "PRINTING_QUEUE"].includes(p.status)).length;
    const completed = data.filter((p) => p.status === "COMPLETED").length;
    const overdue = data.filter((p) => p.overdue).length;
    const rate = totalActive > 0 ? Math.round((completed / totalActive) * 100) : 0;

    setDashboardStats({
      totalActiveTasks: totalActive,
      assignedPreparationCount,
      inModerationCount,
      approvedPrintCount,
      completedTasks: completed,
      overdueItems: overdue,
      completionRate: rate,
      pendingDraftCount: assignedPreparationCount,
    });
  };

  const handleFilterChange = (type) => {
    setTaskFilter(type);
    applyFilters(searchQuery, type, allPackets);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    applyFilters(value, taskFilter, allPackets);
  };

  const applyFilters = (query, type, sourceData) => {
    let filtered = [...sourceData];
    if (type !== "ALL") {
      if (type === "PENDING") {
        filtered = filtered.filter((p) => p.status === "PENDING");
      } else if (type === "DRAFT") {
        filtered = filtered.filter((p) => p.status === "DRAFT");
      } else if (type === "SUBMITTED") {
        filtered = filtered.filter((p) => ["SUBMITTED", "UNDER_MODERATION"].includes(p.status));
      } else if (type === "APPROVED") {
        filtered = filtered.filter((p) => ["APPROVED", "PRINTING", "PRINTING_QUEUE"].includes(p.status));
      } else if (type === "REJECTED") {
        filtered = filtered.filter((p) => p.status === "REJECTED");
      } else if (type === "COMPLETED") {
        filtered = filtered.filter((p) => p.status === "COMPLETED");
      }
    }
    if (query.trim()) {
      const searchValue = query.trim().toLowerCase();
      filtered = filtered.filter((packet) => {
        const courseCode = packet.courseCode?.toLowerCase() || "";
        const courseName = packet.courseName?.toLowerCase() || "";
        const packetId = String(packet.packetId || "").toLowerCase();
        return (
          courseCode.includes(searchValue) ||
          courseName.includes(searchValue) ||
          packetId.includes(searchValue)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Drafts / Pending Prep"
          value={dashboardStats.assignedPreparationCount}
          icon={FileEdit}
          color="text-amber-600"
        />
        <MetricCard
          title="In Moderation"
          value={dashboardStats.inModerationCount}
          icon={Clock}
          color="text-purple-600"
        />
        <MetricCard
          title="Approved / Ready to Print"
          value={dashboardStats.approvedPrintCount}
          icon={CheckCircle2}
          color="text-emerald-600"
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
              Assigned Packets ({currentSemester})
            </h2>
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search course..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#7c4dff]/20"
              />
            </div>
          </div>

          <TaskFilterTabs taskFilter={taskFilter} onFilterChange={handleFilterChange} />

          <div className="space-y-3 pt-2">
            {packets.length === 0 ? (
              <p className="text-slate-400 text-center py-6">
                No matching exam packets found.
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
    </div>
  );
}
