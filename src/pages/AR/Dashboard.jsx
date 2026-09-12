import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAcademicCycle } from "../../context/AcademicCycleContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid
} from "recharts";

// 9 Standard Lifecycle Stages + Delayed Flag
const DEFAULT_STATUS_DEFINITIONS = [
  { key: "PENDING", name: "Pending Assignment", stage: "Stage 1", desc: "Registry created", color: "#94a3b8", bg: "bg-slate-50 text-slate-700 border-slate-200" },
  { key: "DRAFT", name: "Drafting", stage: "Stage 2", desc: "Lecturer preparing", color: "#f59e0b", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "UNDER_MODERATION", name: "Under Moderation", stage: "Stage 3", desc: "Moderator review", color: "#3b82f6", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "APPROVED", name: "Approved", stage: "Stage 4", desc: "Ready for printing", color: "#10b981", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "PRINTING", name: "Printing Queue", stage: "Stage 5", desc: "In printing", color: "#8b5cf6", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "PAPERS_STORED", name: "Papers Stored", stage: "Stage 6", desc: "Safe custody", color: "#6366f1", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "ANSWER_SHEETS_TAKEN", name: "Answer Sheets Taken", stage: "Stage 7", desc: "Exam completed", color: "#ec4899", bg: "bg-pink-50 text-pink-700 border-pink-200" },
  { key: "MARKING", name: "In Marking", stage: "Stage 8", desc: "Lecturer grading", color: "#f97316", bg: "bg-orange-50 text-orange-700 border-orange-200" },
  { key: "COMPLETED", name: "Completed", stage: "Stage 9", desc: "Marking finalized", color: "#14b8a6", bg: "bg-teal-50 text-teal-700 border-teal-200" },
  { key: "DELAYED", name: "Delayed", stage: "Alert", desc: "Past deadline", color: "#ef4444", bg: "bg-red-50 text-red-700 border-red-200" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedCycleId } = useAcademicCycle();
  const [summary, setSummary] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [submissionTrend, setSubmissionTrend] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active'
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const cycleParam = selectedCycleId ? `?cycleId=${selectedCycleId}` : "";
      const res = await axiosInstance.get(`/dashboard/summary${cycleParam}`);
      setSummary(res.data.summary);
      setDepartmentStats(res.data.departmentStats || []);
      setSubmissionTrend(res.data.submissionTrend || []);
      setRecentActivity(res.data.recentActivity || []);
    } catch (err) {
      console.error(">>> DASHBOARD ERROR:", err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalPackets = Number(summary?.totalPackets || 0);

  // Merge backend breakdown with default definitions to guarantee all statuses are always present
  const allStatusList = useMemo(() => {
    const serverBreakdown = summary?.breakdown || [];
    const serverMap = new Map();
    serverBreakdown.forEach((item) => {
      if (item && item.key) {
        const k = item.key.toUpperCase().replace("-", "_").replace(" ", "_");
        serverMap.set(item.key.toUpperCase(), item);
        serverMap.set(k, item);
      }
    });

    return DEFAULT_STATUS_DEFINITIONS.map((def) => {
      const defKey = def.key.toUpperCase().replace("-", "_").replace(" ", "_");
      let serverItem = serverMap.get(def.key) || serverMap.get(defKey);

      if (!serverItem) {
        if (defKey === "COMPLETED") {
          serverItem = serverMap.get("MARKING_COMPLETE") || serverMap.get("MARKING COMPLETE") || serverMap.get("COMPLETE") || serverMap.get("FINALIZED");
        } else if (defKey === "UNDER_MODERATION") {
          serverItem = serverMap.get("MODERATION") || serverMap.get("SUBMITTED");
        } else if (defKey === "PRINTING") {
          serverItem = serverMap.get("PRINTING_QUEUE");
        } else if (defKey === "PAPERS_STORED") {
          serverItem = serverMap.get("PAPERS STORED");
        } else if (defKey === "ANSWER_SHEETS_TAKEN") {
          serverItem = serverMap.get("ANSWER SHEETS TAKEN");
        }
      }

      const count = serverItem != null
        ? Number(serverItem.count || 0)
        : Number(
            def.key === "PENDING"
              ? summary?.pending ?? 0
              : def.key === "DRAFT"
              ? summary?.draft ?? 0
              : def.key === "UNDER_MODERATION"
              ? summary?.underModeration ?? 0
              : def.key === "APPROVED"
              ? summary?.approved ?? 0
              : def.key === "PRINTING"
              ? summary?.printingQueue ?? 0
              : def.key === "PAPERS_STORED"
              ? summary?.papersStored ?? 0
              : def.key === "ANSWER_SHEETS_TAKEN"
              ? summary?.answerSheetsTaken ?? 0
              : def.key === "MARKING"
              ? summary?.marking ?? 0
              : def.key === "COMPLETED"
              ? (summary?.completed ?? summary?.markingComplete ?? 0)
              : def.key === "DELAYED"
              ? summary?.delayed ?? 0
              : 0
          );

      const percentage = totalPackets > 0
        ? Math.round(((count / totalPackets) * 100) * 10) / 10
        : 0;

      return {
        ...def,
        count,
        value: count, // used by Recharts
        percentage,
      };
    });
  }, [summary, totalPackets]);

  // Active slices for donut chart (excluding zero-count slices to avoid Recharts SVG glitches)
  const donutData = useMemo(() => {
    const active = allStatusList.filter((item) => item.key !== "DELAYED" && item.count > 0);
    if (active.length === 0) {
      return [{ name: "No Packets", count: 1, value: 1, color: "#e2e8f0", key: "EMPTY", percentage: 0 }];
    }
    return active.map((item) => ({ ...item, value: item.count }));
  }, [allStatusList]);

  const activeCount = allStatusList.filter((item) => item.count > 0).length;
  const completedCount = allStatusList.find((i) => i.key === "COMPLETED")?.count || 0;
  const delayedCount = allStatusList.find((i) => i.key === "DELAYED")?.count || 0;
  const inModerationCount = allStatusList.find((i) => i.key === "UNDER_MODERATION")?.count || 0;
  const completedPct = totalPackets > 0 ? Math.round((completedCount / totalPackets) * 100) : 0;

  const displayedStatusList = statusFilter === "active"
    ? allStatusList.filter((item) => item.count > 0)
    : allStatusList;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-medium">Loading AR Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">⚠️</div>
        <p className="text-red-600 font-medium text-sm">{error}</p>
        <button
          onClick={() => {
            setError("");
            setLoading(true);
            fetchDashboard();
          }}
          className="text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Assistant Registrar Portal
            </span>
            {delayedCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                ⚠️ {delayedCount} Delayed
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Exam Operations Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time stage tracking across all university departments and semesters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/workflow")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl backdrop-blur-sm border border-white/10 transition shadow-sm"
          >
            Workflow Stages →
          </button>
          <button
            onClick={() => navigate("/packets")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            Manage Packets
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
              📄
            </div>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              All Units
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{totalPackets.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Total Exam Packets</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-inner">
              🔍
            </div>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-600">
              In Review
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{inModerationCount.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Under Moderation</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
              🏁
            </div>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
              {completedPct}% Rate
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{completedCount.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Completed & Finalized</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className={`w-11 h-11 rounded-2xl ${delayedCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"} flex items-center justify-center text-xl shadow-inner`}>
              ⏰
            </div>
            <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${delayedCount > 0 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}>
              {delayedCount > 0 ? "Action Needed" : "On Track"}
            </span>
          </div>
          <div className="mt-4">
            <p className={`text-3xl font-extrabold ${delayedCount > 0 ? "text-red-600" : "text-slate-800"} tracking-tight`}>
              {delayedCount.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">Delayed Deadlines</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Performance (2 cols) + Comprehensive Status Breakdown (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Department Performance */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Department Performance</h2>
                <p className="text-xs text-slate-400 mt-0.5">Packet progression by academic department</p>
              </div>
              <button
                onClick={() => navigate("/reports")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
              >
                View Full Report →
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="departmentName" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                    padding: "10px 14px",
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }} />
                <Bar dataKey="submitted" name="Submitted" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="delayed" name="Delayed" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Tracking active departments in current academic cycle</span>
            <span className="font-medium text-slate-600">{departmentStats.length} Departments active</span>
          </div>
        </div>

        {/* Enhanced Status Breakdown Widget (Showing ALL Statuses) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Header & Filter Pill */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">Status Breakdown</h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                    {totalPackets} Total
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">All 9 lifecycle stages & alerts</p>
              </div>

              {/* Status Tab Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    statusFilter === "all" ? "bg-white text-indigo-600 shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  All (10)
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    statusFilter === "active" ? "bg-white text-indigo-600 shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  Active ({activeCount})
                </button>
              </div>
            </div>

            {/* Donut Chart with Center Summary */}
            <div className="relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={82}
                    paddingAngle={donutData.length > 1 ? 3 : 0}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={hoveredStatus && hoveredStatus !== entry.key ? 0.4 : 1}
                        className="transition-opacity duration-200"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => [
                      `${value} packet${value === 1 ? "" : "s"} (${totalPackets > 0 ? ((value / totalPackets) * 100).toFixed(1) : 0}%)`,
                      item.payload.name
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800 leading-none">{totalPackets}</span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5">Packets</span>
                {totalPackets > 0 && (
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.2 rounded-full mt-1">
                    {completedPct}% Done
                  </span>
                )}
              </div>
            </div>

            {/* ALL Statuses Breakdown List */}
            <div className="space-y-1.5 mt-3 max-h-[260px] overflow-y-auto pr-1">
              {displayedStatusList.map((item) => {
                const isActive = item.count > 0;
                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredStatus(item.key)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    onClick={() => navigate(`/packets?status=${item.key}`)}
                    className={`group flex items-center justify-between text-xs py-2 px-3 rounded-xl transition cursor-pointer ${
                      isActive
                        ? "bg-slate-50 hover:bg-slate-100/80 text-slate-800"
                        : "bg-transparent hover:bg-slate-50/60 text-slate-400"
                    }`}
                  >
                    {/* Left: Indicator & Name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold truncate ${isActive ? "text-slate-800" : "text-slate-500"}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-500 font-medium">
                            {item.stage}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-24 sm:w-32 bg-slate-200/80 h-1 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Count & Percentage */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                          isActive
                            ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                            : "text-slate-400"
                        }`}
                      >
                        {item.count}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Click status to view related packets</span>
            <Link to="/workflow" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Stage Map →
            </Link>
          </div>
        </div>

      </div>

      {/* Submission Trend + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Submission Trend */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h2 className="text-base font-bold text-slate-800">Submission Trend</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Monthly paper hand-in volumes</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={submissionTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "14px",
                  border: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                  padding: "10px 14px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Papers Submitted"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#4f46e5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-800">Recent Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live audit trail & packet updates</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                Live Feed
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        item.actorColor || "bg-indigo-600"
                      } flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                    >
                      {item.actorInitials || "AR"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700 leading-snug">{item.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.timeAgo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center">No recent activity recorded.</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Automated audit logging</span>
            <span className="font-semibold text-slate-600">Updated just now</span>
          </div>
        </div>

      </div>
    </div>
  );
}