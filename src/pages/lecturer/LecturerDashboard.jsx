import React, { useEffect, useState } from "react";
import { lecturerApi } from "../../services/api";
import PacketDetailModal from "../../components/PacketDetailModal";
import MarkingEntryModal from "../../components/MarkingEntryModal";
// Uncomment and import your actual Auth context/hook:
// import { useAuth } from "../../context/AuthContext";
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
  Archive,
  User,
} from "lucide-react";

export default function LecturerDashboard() {
  // 1. Get the logged-in user dynamically from your Auth Context or localStorage.
  // Example using a context hook:
  // const { user } = useAuth();
  // const lecturerId = user?.id || user?.lecturerId;

  // Example using localStorage (if you store user session/token data there after login):
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // Fallback to "U1" only if no user is found in storage/auth, but ideally use currentUser.id or currentUser.username
  const lecturerId = currentUser?.id || currentUser?.username || "Nimba";

  const [dashboard, setDashboard] = useState(null);
  const [packets, setPackets] = useState([]);
  const [workloadStats, setWorkloadStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'previous'
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);

  const loadAllData = () => {
    if (!lecturerId) return;
    setLoading(true);
    Promise.all([
      lecturerApi.getDashboard(lecturerId).catch(() => ({ data: null })),
      lecturerApi.getPackets(lecturerId).catch(() => ({ data: [] })),
      lecturerApi.getWorkloadStats(lecturerId).catch(() => ({ data: null })),
    ])
      .then(([dashboardRes, packetsRes, workloadRes]) => {
        if (dashboardRes?.data) setDashboard(dashboardRes.data);
        if (packetsRes?.data) setPackets(packetsRes.data);
        if (workloadRes?.data) setWorkloadStats(workloadRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAllData();
  }, [lecturerId]);

  // Tab switcher
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setLoading(true);
    try {
      if (tab === "previous") {
        const res = await lecturerApi.getPreviousPackets(lecturerId);
        setPackets(res.data || []);
      } else {
        const res = await lecturerApi.getPackets(lecturerId);
        setPackets(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live search handler
  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      handleTabChange(activeTab);
      return;
    }
    try {
      // If your backend search needs to filter by the logged-in user, ensure your API handles it,
      // or filter the current packets array:
      const res = await lecturerApi.searchPackets(val);
      setPackets(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Complete task action
  const handleCompleteTask = async (packetId) => {
    try {
      await lecturerApi.completeTask(packetId);
      loadAllData();
    } catch (err) {
      console.error("Failed to mark task complete", err);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="p-8 text-slate-500">
        Loading Workspace for {lecturerId}...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header with Logged-in User Profile Card */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lecturer Workspace
          </h1>
          <p className="text-sm text-slate-500">
            Track assigned exam packets, logging, and workflow progress
          </p>
        </div>

        {/* Logged-in User Details Badge */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              {dashboard?.lecturerName || currentUser?.name || lecturerId}
            </h4>
            <p className="text-[11px] text-slate-400">
              {dashboard?.department ||
                currentUser?.department ||
                "Department of Computer Science"}{" "}
              ({lecturerId})
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar Row */}
      <div className="flex justify-end">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search course or code..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Packets"
          value={dashboard?.assignedPacketsCount || packets.length || 0}
          icon={BookOpen}
          color="text-brand-600"
        />
        <MetricCard
          title="Scripts to Mark"
          value={
            dashboard?.scriptsCount || workloadStats?.totalPendingScripts || 0
          }
          icon={Clock}
          color="text-amber-600"
        />
        <MetricCard
          title="Completed Tasks"
          value={dashboard?.completedTasksCount || 0}
          icon={CheckCircle2}
          color="text-emerald-600"
        />
        <MetricCard
          title="Overdue Items"
          value={dashboard?.overdueCount || 0}
          icon={AlertTriangle}
          color="text-rose-600"
        />
      </div>

      {/* Main Grid: Packet Table + Workload & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Packet List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "active"
                    ? "bg-brand-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Active Packets
              </button>
              <button
                onClick={() => handleTabChange("previous")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  activeTab === "previous"
                    ? "bg-brand-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Archive className="w-3.5 h-3.5" /> Previous Packets
              </button>
            </div>

            <span className="text-xs text-slate-400">
              {packets.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {packets.length > 0 ? (
              packets.map((packet) => (
                <div
                  key={packet.packetId}
                  className="p-4 border border-slate-200 rounded-xl hover:border-brand-500 transition-all bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {packet.courseCode}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {packet.status || "PREPARATION"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {packet.courseName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Holder:{" "}
                      <span className="text-slate-600 font-medium">
                        {packet.currentHolder || "Me"}
                      </span>{" "}
                      | Deadline: {packet.deadline || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPacketId(packet.packetId)}
                      className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      title="View Details & Comments"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setMarkingPacket(packet)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Log Marking Progress"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleCompleteTask(packet.packetId)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Complete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No packets found in this view.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workload Stats & Notifications */}
        <div className="space-y-6">
          {/* Workload Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-600" /> Workload Summary
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Marking Completion</span>
                  <span className="text-brand-600">
                    {workloadStats?.completionRate || 65}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full"
                    style={{ width: `${workloadStats?.completionRate || 65}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Pending Papers:</span>
                <span className="font-bold text-slate-800">
                  {workloadStats?.pendingPapers || 3}
                </span>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-400">
              Recent Notifications
            </h2>
            <div className="space-y-2.5">
              {dashboard?.notifications?.length > 0 ? (
                dashboard.notifications.map((notif, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                  >
                    <p className="font-semibold text-slate-800">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {notif.timestamp}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No recent notifications.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPacketId && (
        <PacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
          onStatusUpdated={loadAllData}
        />
      )}

      {markingPacket && (
        <MarkingEntryModal
          packet={markingPacket}
          onClose={() => setMarkingPacket(null)}
          onSuccess={loadAllData}
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
