import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semester, setSemester] = useState("ALL");
  const [exporting, setExporting] = useState(null); // 'pdf' | 'excel' | null
  const [exportError, setExportError] = useState("");

  const handleExport = async (type) => {
    if (exporting) return;
    setExporting(type);
    setExportError("");
    try {
      const res = await axiosInstance.get(`/reports/export/${type}?semester=${semester}`, {
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
        `exam-report-${semester.toLowerCase()}.${extension}`
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

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/reports?semester=${semester}`);
        setReport(res.data);
      } catch (err) {
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [semester]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading report...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );

  const { kpi, monthlyTrend, delayReasons, departmentComparison } = report;

  const kpiCards = [
    {
      value: `${kpi.completionRate}%`,
      label: "Overall Completion Rate",
      trend: "+2.1% vs last semester",
      up: true,
    },
    {
      value: `${kpi.avgProcessingDays} days`,
      label: "Avg. Processing Time",
      trend: "-0.5d vs last semester",
      up: false,
    },
    {
      value: `${kpi.onTimeSubmissionRate}%`,
      label: "On-Time Submission",
      trend: "+3.2% vs last semester",
      up: true,
    },
    {
      value: kpi.packetsInDelay,
      label: "Packets in Delay",
      trend: "+2 vs last semester",
      up: false,
    },
  ];

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

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { key: "SEM2", label: "Sem 2, 2026" },
            { key: "SEM1", label: "Sem 1, 2026" },
            { key: "ALL", label: "All Time" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSemester(s.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                semester === s.key
                  ? "bg-[#7c4dff] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {exporting === "pdf" ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <span>⬇</span>
                <span>Export PDF</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {exporting === "excel" ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Exporting Excel...</span>
              </>
            ) : (
              <>
                <span>⬇</span>
                <span>Export Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {card.value}
            </p>
            <p className="text-sm text-gray-400 mb-2">{card.label}</p>
            <p
              className={`text-xs font-medium ${card.up ? "text-green-500" : "text-red-400"}`}
            >
              {card.up ? "↑" : "↓"} {card.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Monthly Trend */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-6">
            📈 Monthly Submission Trend
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              />
              <Line
                type="monotone"
                dataKey="submitted"
                name="Submitted"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="approved"
                name="Approved"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="delayed"
                name="Delayed"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Delay Root Causes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Delay Root Causes
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={delayReasons}
                dataKey="count"
                cx="50%"
                cy="50%"
                outerRadius={70}
                paddingAngle={2}
              >
                {delayReasons.map((entry, index) => (
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
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {delayReasons.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        REASON_COLORS[item.reason] ||
                        PIE_COLORS[i % PIE_COLORS.length],
                    }}
                  />
                  <span className="text-xs text-gray-500">{item.reason}</span>
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Department Comparison
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {[
                "Department",
                "Total Packets",
                "On Time",
                "Delayed",
                "On-Time Rate",
                "Performance",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-gray-400 px-6 py-3 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departmentComparison.map((dept, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm text-[#7c4dff] font-medium">
                  {dept.department}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {dept.totalPackets}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {dept.onTime}
                </td>
                <td className="px-6 py-4 text-sm text-red-500 font-medium">
                  {dept.delayed}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-500">
                  {dept.onTimeRate}%
                </td>
                <td className="px-6 py-4 w-48">
                  <PerformanceBar rate={dept.onTimeRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
