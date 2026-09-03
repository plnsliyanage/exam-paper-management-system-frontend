import React, { useEffect, useState } from "react";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";
import LecturerHeader from "../../components/lecturer/LecturerHeader";
import MetricCard from "../../components/lecturer/MetricCard";
import TaskFilterTabs from "../../components/lecturer/TaskFilterTabs";
import PacketCard from "../../components/lecturer/PacketCard";
import WorkloadSummary from "../../components/lecturer/WorkloadSummary";
import { lecturerApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Search,
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
    scriptsToMark: 0,
    completedTasks: 0,
    overdueItems: 0,
    completionRate: 0,
    paperSettingCount: 0,
    scriptMarkingCount: 0,
    moderationCount: 0,
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
      const packetsResponse = await lecturerApi.getPackets(username);
      const packetsData = Array.isArray(packetsResponse.data) ? packetsResponse.data : [];

      const packetsWithMarking = await Promise.all(
        packetsData.map(async (packet) => {
          if (packet.taskType === "MARK_SCRIPTS") {
            try {
              const markingResponse = await lecturerApi.getMarkingByPacketId(packet.packetId);
              return {
                ...packet,
                scriptsCount: markingResponse.data?.totalScripts || 0,
              };
            } catch {
              return { ...packet, scriptsCount: 0 };
            }
          }
          return packet;
        })
      );

      setAllPackets(packetsWithMarking);
      setPackets(packetsWithMarking);

      try {
        const statsResponse = await lecturerApi.getWorkloadStats(username);
        const stats = statsResponse.data;

        if (stats) {
          const totalAssigned = Number(stats.totalAssignedPackets || packetsWithMarking.length);
          const completed = Number(stats.completedPackets || 0);
          const rate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

          setDashboardStats({
            totalActiveTasks: totalAssigned,
            scriptsToMark: Number(stats.totalScripts || 0),
            completedTasks: completed,
            overdueItems: Number(stats.overduePackets || 0),
            completionRate: rate,
            paperSettingCount: packetsWithMarking.filter((p) => p.taskType === "SET_PAPER").length,
            scriptMarkingCount: packetsWithMarking.filter((p) => p.taskType === "MARK_SCRIPTS").length,
            moderationCount: packetsWithMarking.filter((p) => p.taskType === "MODERATION").length,
          });
        } else {
          calculateFallbackStats(packetsWithMarking);
        }
      } catch (e) {
        calculateFallbackStats(packetsWithMarking);
      }
    } catch (error) {
      console.error("Failed to load lecturer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFallbackStats = (data) => {
    const scriptMarkingPackets = data.filter((p) => p.taskType === "MARK_SCRIPTS");
    const scripts = scriptMarkingPackets.reduce((sum, p) => sum + Number(p.scriptsCount || 0), 0);
    const paperSettingCount = data.filter((p) => p.taskType === "SET_PAPER").length;
    const scriptMarkingCount = scriptMarkingPackets.length;
    const moderationCount = data.filter((p) => p.taskType === "MODERATION").length;

    setDashboardStats({
      totalActiveTasks: data.length,
      scriptsToMark: scripts,
      completedTasks: data.filter((p) => p.status === "COMPLETED").length,
      overdueItems: 0,
      completionRate: data.length > 0 ? Math.round((data.filter((p) => p.status === "COMPLETED").length / data.length) * 100) : 0,
      paperSettingCount,
      scriptMarkingCount,
      moderationCount,
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
      filtered = filtered.filter((packet) => packet.taskType === type);
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

  const handleCompleteTask = async (packetId) => {
    try {
      await lecturerApi.completeTask(packetId);
      const updatePacketStatus = (list) =>
        list.map((p) => (p.packetId === packetId ? { ...p, status: "COMPLETED" } : p));
      setAllPackets((prev) => updatePacketStatus(prev));
      setPackets((prev) => updatePacketStatus(prev));
      alert(`Task completed for packet: ${packetId}`);
      await loadDashboardData();
    } catch (error) {
      console.error("Error completing task:", error);
      alert(error?.response?.data || "Failed to complete task.");
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
          title="Total Active Tasks"
          value={dashboardStats.totalActiveTasks}
          icon={BookOpen}
          color="text-[#7c4dff]"
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
                  key={packet.packetId}
                  packet={packet}
                  onSelectDetail={setSelectedPacketId}
                  onOpenMarking={setMarkingPacket}
                  onCompleteTask={handleCompleteTask}
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
