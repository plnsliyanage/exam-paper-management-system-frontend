import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useAcademicCycle } from "../context/AcademicCycleContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { MdCompareArrows, MdTimeline, MdFileDownload, MdAnalytics } from "react-icons/md";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#6b7280", "#3b82f6"];

const REASON_COLORS = {
  "Late Submission by Lecturer": "#ef4444",
  "Returned for Revision": "#f59e0b",
  "Moderation Backlog": "#8b5cf6",
  "System Issues": "#6b7280",
  Other: "#3b82f6",
};

function PerformanceBar({ rate }) {
  const color = rate >= 90 ? "#22c55e" : rate >= 80 ? "#f59e0b" : "#ef4444";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${rate}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function Reports() {
  const { getRole } = useAuth();
  const role = getRole();
  const isSystemAdmin = role === "ROLE_SYSTEM_ADMIN";
  const { cycles, selectedCycleId, selectedCycle, activeCycle, selectCycle } = useAcademicCycle();

  const [report, setReport] = useState(null);
  const [multiCycleData, setMultiCycleData] = useState(null);
  const [viewMode, setViewMode] = useState("SINGLE_CYCLE"); // 'SINGLE_CYCLE' | 'MULTI_CYCLE'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | null
  const [exportError, setExportError] = useState("");

  const activeCycleQuery = selectedCycleId || "ALL";

  const fetchSingleReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/reports?cycleId=${activeCycleQuery}`);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Failed to load semester examination report.");
    } finally {
      setLoading(false);
    }
  }, [activeCycleQuery]);

  const fetchMultiCycleTrends = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/reports/multi-cycle-trends");
      setMultiCycleData(res.data);
    } catch (err) {
      console.error("Failed to load multi-cycle trends:", err);
      setError("Failed to load multi-semester comparison trends.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "SINGLE_CYCLE") {
      fetchSingleReport();
    } else {
      fetchMultiCycleTrends();
    }
  }, [viewMode, fetchSingleReport, fetchMultiCycleTrends]);

  const handleExport = async (type) => {
    if (exporting) return;
    setExporting(type);
    setExportError("");
    try {
      const res = await axiosInstance.get(`/reports/export/${type}?cycleId=${activeCycleQuery}`, {
        responseType: "blob",
      });

      const extension = type === "pdf" ? "pdf" : "xlsx";
      const mimeType =
        type === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `exam-report-${activeCycleQuery.toLowerCase()}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Export ${type} failed:`, err);
      setExportError(`Failed to export ${type.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c4dff] mr-3"></div>
        Loading analytical data...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{exportError}</span>
          <button
            onClick={() => setExportError("")}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Bar Navigation & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode("SINGLE_CYCLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "SINGLE_CYCLE"
                  ? "bg-white text-[#7c4dff] shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdTimeline size={16} />
              <span>Semester Report</span>
            </button>
            <button
              onClick={() => setViewMode("MULTI_CYCLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === "MULTI_CYCLE"
                  ? "bg-white text-[#7c4dff] shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdCompareArrows size={16} />
              <span>Multi-Semester Trends</span>
            </button>
          </div>

          {/* Academic Cycle Filter (Single Cycle Mode) */}
          {viewMode === "SINGLE_CYCLE" && (
            isSystemAdmin ? (
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
                {cycles.slice(0, 3).map((c) => (
                  <button
                    key={c.cycleId}
                    onClick={() => selectCycle(c.cycleId)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                      selectedCycleId === c.cycleId
                        ? "bg-[#7c4dff] text-white border-[#7c4dff]"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {c.cycleName || c.cycleId}
                  </button>
                ))}
                <button
                  onClick={() => selectCycle("ALL")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                    selectedCycleId === "ALL"
                      ? "bg-[#7c4dff] text-white border-[#7c4dff]"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Semesters
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200/90 rounded-xl text-xs font-medium text-gray-700">
                <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">Semester:</span>
                <span className="font-bold">{selectedCycle?.cycleName || selectedCycle?.cycleId || activeCycle?.cycleName || "Active Semester"}</span>
              </div>
            )
          )}
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-xs"
          >
            <MdFileDownload size={16} />
            <span>{exporting === "pdf" ? "Exporting..." : "PDF Report"}</span>
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-xs"
          >
            <MdFileDownload size={16} />
            <span>{exporting === "excel" ? "Exporting..." : "Excel Export"}</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 1: SINGLE SEMESTER REPORT VIEW */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === "SINGLE_CYCLE" && report && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {report.kpi?.completionRate || 0}%
              </p>
              <p className="text-xs font-medium text-gray-400 mb-2">Overall Completion Rate</p>
              <p className="text-xs font-semibold text-green-600">Active Workflow</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {report.kpi?.avgProcessingDays || 0}d
              </p>
              <p className="text-xs font-medium text-gray-400 mb-2">Avg. Processing Time</p>
              <p className="text-xs font-semibold text-purple-600">Draft to Approved</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {report.kpi?.onTimeSubmissionRate || 0}%
              </p>
              <p className="text-xs font-medium text-gray-400 mb-2">On-Time Submission Rate</p>
              <p className="text-xs font-semibold text-emerald-600">Met Deadlines</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {report.kpi?.packetsInDelay || 0}
              </p>
              <p className="text-xs font-medium text-gray-400 mb-2">Packets in Delay</p>
              <p className="text-xs font-semibold text-red-500">Requires Attention</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Trend */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
              <h2 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">
                📈 Submission & Approval Pattern
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={report.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontSize: "13px",
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                  <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="approved" name="Approved" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="delayed" name="Delayed" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Delay Root Causes */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
              <h2 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Root Causes of Delays
              </h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={report.delayReasons || []}
                    dataKey="count"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {(report.delayReasons || []).map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          REASON_COLORS[entry.reason] ||
                          PIE_COLORS[index % PIE_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${props.payload.percentage}%`,
                      props.payload.reason,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-1.5 mt-2">
                {(report.delayReasons || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            REASON_COLORS[item.reason] ||
                            PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-gray-500 truncate max-w-[150px]">{item.reason}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Comparison Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Department Performance & Punctuality Breakdown
              </h2>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {["Department", "Total Packets", "On Time", "Delayed", "On-Time Rate", "Performance"].map((h) => (
                    <th key={h} className="text-xs font-semibold text-gray-400 px-6 py-3 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(report.departmentComparison || []).map((dept, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition text-xs">
                    <td className="px-6 py-4 text-[#7c4dff] font-bold">{dept.department}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{dept.totalPackets}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{dept.onTime}</td>
                    <td className="px-6 py-4 text-red-500 font-semibold">{dept.delayed}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{dept.onTimeRate}%</td>
                    <td className="px-6 py-4 w-48">
                      <PerformanceBar rate={dept.onTimeRate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODE 2: MULTI-SEMESTER COMPARISON TRENDS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === "MULTI_CYCLE" && multiCycleData && (
        <div className="space-y-4">
          {/* Semester-over-Semester On-Time Trend Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <MdAnalytics className="text-[#7c4dff]" size={18} />
                  <span>Semester-over-Semester On-Time Submission Rates</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Comparative analysis of on-time percentage and completion across academic cycles
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={multiCycleData.cycleSummaries || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="cycleName" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Bar dataKey="onTimeRate" name="On-Time Rate %" fill="#7c4dff" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completionRate" name="Completion Rate %" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cross-Semester Historical Breakdown Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Multi-Semester Historical Audit & Cycle Metrics
              </h2>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {["Academic Cycle", "Academic Year", "Total Packets", "Completed", "Delayed", "On-Time Rate", "Status"].map((h) => (
                    <th key={h} className="text-xs font-semibold text-gray-400 px-6 py-3 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(multiCycleData.cycleSummaries || []).map((cycle, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition text-xs">
                    <td className="px-6 py-4 font-bold text-gray-800">{cycle.cycleName}</td>
                    <td className="px-6 py-4 text-gray-500">{cycle.academicYear} (Sem {cycle.semester})</td>
                    <td className="px-6 py-4 font-semibold text-[#7c4dff]">{cycle.totalPackets}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{cycle.completedPackets}</td>
                    <td className="px-6 py-4 text-red-500 font-semibold">{cycle.delayedPackets}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{cycle.onTimeRate}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-[#7c4dff]">
                        Archived
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
