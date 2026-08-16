import React, { useEffect, useState } from "react";

// Modal components for viewing packet details and entering marking information
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";

// Components used to build the lecturer dashboard
import LecturerHeader from "../../components/lecturer/LecturerHeader";
import MetricCard from "../../components/lecturer/MetricCard";
import TaskFilterTabs from "../../components/lecturer/TaskFilterTabs";
import PacketCard from "../../components/lecturer/PacketCard";
import WorkloadSummary from "../../components/lecturer/WorkloadSummary";

// API methods used to communicate with the Spring Boot backend
import { lecturerApi } from "../../services/api";

// Icons used in the dashboard
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Search,
} from "lucide-react";

export default function LecturerDashboard() {
  // Stores the currently logged-in lecturer information
  const [currentUser] = useState({
    id: "U1",
    name: "Dr. Samantha Perera",
    department: "Department of Computer Science",
    currentSemester: "2026-S1",
  });

  // Gets the current semester from the logged-in lecturer
  const currentSemester = currentUser.currentSemester;

  // Stores the packets currently displayed after filtering
  const [packets, setPackets] = useState([]);

  // Stores the complete packet list used as the source for filtering
  const [allPackets, setAllPackets] = useState([]);

  // Stores the text entered into the search box
  const [searchQuery, setSearchQuery] = useState("");

  // Stores the currently selected task type filter
  const [taskFilter, setTaskFilter] = useState("ALL");

  // Stores the statistics displayed in the dashboard metric cards
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

  // Stores the packet selected for viewing details
  const [selectedPacketId, setSelectedPacketId] = useState(null);

  // Stores the packet selected for entering script count
  const [markingPacket, setMarkingPacket] = useState(null);

  // Controls the dashboard loading state
  const [loading, setLoading] = useState(true);

  // Loads the lecturer's packets and dashboard statistics when the page opens
  useEffect(() => {
    loadDashboardData();
  }, [currentUser.id]);

  // Retrieves packet, marking, and dashboard data from the backend
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get packets assigned to the current lecturer
      const packetsResponse = await lecturerApi.getPackets(currentUser.id);

      let packetData = Array.isArray(packetsResponse.data)
        ? packetsResponse.data
        : [];

      // Add marking information to packets that require script marking
      const packetsWithMarking = await Promise.all(
        packetData.map(async (packet) => {
          if (packet.taskType !== "MARK_SCRIPTS") {
            return {
              ...packet,
              scriptsCount: 0,
            };
          }

          try {
            // Retrieve the script count for the selected packet
            const markingResponse = await lecturerApi.getMarkingByPacketId(
              packet.packetId,
            );

            return {
              ...packet,
              scriptsCount: markingResponse.data?.totalScripts ?? 0,
            };
          } catch (error) {
            console.error(
              `Failed to load marking details for ${packet.packetId}:`,
              error,
            );

            return {
              ...packet,
              scriptsCount: 0,
            };
          }
        }),
      );

      // Store the complete packet data for display and filtering
      setAllPackets(packetsWithMarking);
      setPackets(packetsWithMarking);

      try {
        // Retrieve dashboard statistics from the backend
        const statsResponse = await lecturerApi.getDashboard(currentUser.id);

        if (statsResponse.data) {
          // Calculate the number of packets for each task type
          const paperSettingCount = packetsWithMarking.filter(
            (p) => p.taskType === "SET_PAPER",
          ).length;

          const scriptMarkingCount = packetsWithMarking.filter(
            (p) => p.taskType === "MARK_SCRIPTS",
          ).length;

          const moderationCount = packetsWithMarking.filter(
            (p) => p.taskType === "MODERATION",
          ).length;

          // Store backend statistics together with task type counts
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
          // Calculate statistics locally when backend data is unavailable
          calculateFallbackStats(packetsWithMarking);
        }
      } catch (error) {
        console.error("Failed to load dashboard statistics:", error);

        // Use locally calculated statistics if the dashboard API fails
        calculateFallbackStats(packetsWithMarking);
      }
    } catch (error) {
      console.error("Failed to load lecturer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculates basic dashboard statistics when the dashboard API is unavailable
  const calculateFallbackStats = (data) => {
    // Get packets that require script marking
    const scriptMarkingPackets = data.filter(
      (packet) => packet.taskType === "MARK_SCRIPTS",
    );

    // Calculate the total number of scripts that need to be marked
    const scripts = scriptMarkingPackets.reduce(
      (total, packet) => total + Number(packet.scriptsCount || 0),
      0,
    );

    // Count packets according to their task type
    const paperSettingCount = data.filter(
      (packet) => packet.taskType === "SET_PAPER",
    ).length;

    const scriptMarkingCount = scriptMarkingPackets.length;

    const moderationCount = data.filter(
      (packet) => packet.taskType === "MODERATION",
    ).length;

    // Update the dashboard using the calculated statistics
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

  // Updates the packet list when the task type filter changes
  const handleFilterChange = (type) => {
    setTaskFilter(type);

    applyFilters(searchQuery, type, allPackets);
  };

  // Updates the packet list when the lecturer searches for a packet
  const handleSearch = (event) => {
    const value = event.target.value;

    setSearchQuery(value);

    applyFilters(value, taskFilter, allPackets);
  };

  // Applies task type and search filters to the packet list
  const applyFilters = (query, type, sourceData) => {
    let filtered = [...sourceData];

    // Filter packets according to the selected task type
    if (type !== "ALL") {
      filtered = filtered.filter((packet) => packet.taskType === type);
    }

    // Filter packets according to the search text
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

    // Update the packets displayed on the dashboard
    setPackets(filtered);
  };

  // Marks a selected packet task as completed
  const handleCompleteTask = async (packetId) => {
    try {
      // Send the completion request to the backend
      await lecturerApi.completeTask(packetId);

      // Updates the status of the selected packet in a list
      const updatePacketStatus = (list) =>
        list.map((p) =>
          p.packetId === packetId
            ? {
                ...p,
                status: "COMPLETED",
              }
            : p,
        );

      // Update both the complete and filtered packet lists
      setAllPackets((prev) => updatePacketStatus(prev));
      setPackets((prev) => updatePacketStatus(prev));

      alert(`Task completed for packet: ${packetId}`);

      // Reload dashboard data to refresh statistics
      await loadDashboardData();
    } catch (error) {
      console.error("Error completing task:", error);

      alert(error?.response?.data || "Failed to complete task.");
    }
  };

  // Display a loading message while dashboard data is being retrieved
  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  // Main lecturer dashboard UI
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Lecturer information and current semester */}
      <LecturerHeader
        currentUser={currentUser}
        currentSemester={currentSemester}
      />

      {/* Summary cards for the lecturer's current workload */}
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

      {/* Main dashboard area containing packets and workload summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned packet list with search and task filters */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
            <h2 className="font-bold text-slate-800">
              Assigned Packets ({currentSemester})
            </h2>

            {/* Packet search field */}
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

          {/* Filters for different lecturer task types */}
          <TaskFilterTabs
            taskFilter={taskFilter}
            onFilterChange={handleFilterChange}
          />

          {/* Displays packets matching the selected filters */}
          <div className="space-y-3 pt-2">
            {packets.length === 0 ? (
              <p className="text-slate-400 text-center py-6">
                No matching exam packets found.
              </p>
            ) : (
              // Render each packet using the reusable PacketCard component
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

        {/* Lecturer workload breakdown */}
        <div className="space-y-6">
          <WorkloadSummary dashboardStats={dashboardStats} />
        </div>
      </div>

      {/* Displays detailed information for the selected packet */}
      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
        />
      )}

      {/* Displays the script marking entry form for the selected packet */}
      {markingPacket && (
        <MarkingEntryModal
          packet={markingPacket}
          lecturerId={currentUser.id}
          onClose={() => setMarkingPacket(null)}
          onSuccess={async () => {
            // Refresh dashboard data after the script count is saved
            setMarkingPacket(null);
            await loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
