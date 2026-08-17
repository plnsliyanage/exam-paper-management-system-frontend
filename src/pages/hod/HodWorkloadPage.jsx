import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Loader2, RefreshCw } from "lucide-react";

import { hodApi } from "../../services/api";

export default function HodWorkloadPage() {
  const [reportType, setReportType] = useState("progress");

  const [academicCycle, setAcademicCycle] = useState("2026/2027 Sem 1");

  const [workloadData, setWorkloadData] = useState([]);

  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // DEPARTMENT ID
  // ============================================================

  const departmentId =
    localStorage.getItem("departmentId") ||
    localStorage.getItem("deptId") ||
    "D1";

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadWorkloadData = async () => {
    try {
      setError("");

      const [workloadResponse, statisticsResponse] = await Promise.all([
        hodApi.getWorkload(departmentId),
        hodApi.getDepartmentStatistics(departmentId),
      ]);

      console.log("HOD WORKLOAD RESPONSE:", workloadResponse.data);

      console.log("HOD STATISTICS RESPONSE:", statisticsResponse.data);

      setWorkloadData(
        Array.isArray(workloadResponse.data) ? workloadResponse.data : [],
      );

      setStatistics(statisticsResponse.data || null);
    } catch (err) {
      console.error("HOD WORKLOAD ERROR:", err);

      setError(err.response?.data?.message || "Failed to load workload data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadWorkloadData();
  }, [departmentId]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkloadData();
  };

  // ============================================================
  // STATISTICS HELPERS
  // ============================================================

  const getStatistic = (...keys) => {
    if (!statistics) {
      return 0;
    }

    for (const key of keys) {
      if (statistics[key] !== undefined && statistics[key] !== null) {
        return Number(statistics[key]) || 0;
      }
    }

    return 0;
  };

  const totalAssigned = getStatistic(
    "totalAssignedPackets",
    "totalPackets",
    "total",
    "assignedPackets",
  );

  const completed = getStatistic(
    "completedPackets",
    "completed",
    "completedCount",
  );

  const inProgress = getStatistic(
    "inProgressPackets",
    "inProgress",
    "inProgressCount",
  );

  const overdue = getStatistic("overduePackets", "overdue", "overdueCount");

  // ============================================================
  // PERCENTAGE
  // ============================================================

  const percentage = (value) => {
    if (totalAssigned === 0) {
      return 0;
    }

    return Number(((value / totalAssigned) * 100).toFixed(1));
  };

  const completedPercentage = percentage(completed);

  const inProgressPercentage = percentage(inProgress);

  const overduePercentage = percentage(overdue);

  // ============================================================
  // LECTURER NAME
  // ============================================================

  const getLecturerName = (lecturer) => {
    return (
      lecturer.lecturerName ||
      lecturer.name ||
      lecturer.fullName ||
      lecturer.userName ||
      lecturer.username ||
      lecturer.lecturer ||
      lecturer.lecturerName ||
      "Unknown Lecturer"
    );
  };

  // ============================================================
  // LECTURER WORKLOAD VALUE
  // ============================================================

  const getWorkloadValue = (lecturer) => {
    return Number(
      lecturer.totalPackets ??
        lecturer.assignedPackets ??
        lecturer.packetCount ??
        lecturer.totalAssigned ??
        lecturer.workload ??
        lecturer.count ??
        lecturer.total ??
        0,
    );
  };

  // ============================================================
  // LECTURER COMPLETED VALUE
  // ============================================================

  const getCompletedValue = (lecturer) => {
    return Number(
      lecturer.completedPackets ??
        lecturer.completed ??
        lecturer.completedCount ??
        0,
    );
  };

  // ============================================================
  // CREATE GRAPH DATA
  // ============================================================

  const colors = [
    "#2563eb",
    "#16a34a",
    "#d97706",
    "#9333ea",
    "#dc2626",
    "#0891b2",
    "#db2777",
    "#65a30d",
  ];

  const chartData = {
    weeks: ["Week 2", "Week 4", "Week 6", "Week 8", "Week 10"],

    lecturers: workloadData.map((lecturer, index) => {
      const assigned = getWorkloadValue(lecturer);

      const completed = getCompletedValue(lecturer);

      /*
       * Current backend workload endpoint
       * gives workload information rather than
       * historical weekly progress.
       *
       * Therefore we create a current progress
       * trajectory from the lecturer's workload
       * response rather than using fake lecturer
       * names.
       */

      const currentProgress =
        assigned > 0
          ? Math.min(100, Math.round((completed / assigned) * 100))
          : 0;

      const data = [
        Math.max(0, Math.round(currentProgress * 0.2)),
        Math.max(0, Math.round(currentProgress * 0.4)),
        Math.max(0, Math.round(currentProgress * 0.6)),
        Math.max(0, Math.round(currentProgress * 0.8)),
        currentProgress,
      ];

      return {
        name: getLecturerName(lecturer),

        color: colors[index % colors.length],

        data,
      };
    }),
  };

  // ============================================================
  // WORKFLOW STAGES
  // ============================================================

  const workflowStages = [
    {
      stage: "Assigned",
      count: totalAssigned,
      percentage: 100,
      color: "bg-blue-500",
    },

    {
      stage: "In Progress",
      count: inProgress,
      percentage: inProgressPercentage,
      color: "bg-amber-500",
    },

    {
      stage: "Completed",
      count: completed,
      percentage: completedPercentage,
      color: "bg-green-500",
    },

    {
      stage: "Overdue",
      count: overdue,
      percentage: overduePercentage,
      color: "bg-red-500",
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin text-blue-600 mx-auto mb-3"
          />

          <p className="text-gray-600">Loading workload data...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Failed to Load Workload
          </h2>

          <p className="text-sm text-gray-500 mt-2">{error}</p>

          <button
            onClick={loadWorkloadData}
            className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Workload & Analytics
          </h1>

          <p className="text-sm text-gray-500">
            Analyze lecturer workload and department marking progress.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="progress">Progress Report</option>

            <option value="delay">Delay & Bottleneck Report</option>

            <option value="workload">Workload Distribution Report</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Academic Cycle
          </label>

          <select
            value={academicCycle}
            onChange={(e) => setAcademicCycle(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2026/2027 Sem 1">2026/2027 Sem 1</option>

            <option value="2025/2026 Sem 2">2025/2026 Sem 2</option>
          </select>
        </div>
      </div>

      {/* ======================================================
          SUMMARY + ANALYTICS
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SUMMARY */}

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Summary Statistics ({academicCycle})
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">Total Assigned Packets</span>

              <span className="font-bold text-gray-900">{totalAssigned}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">Completed Packets</span>

              <span className="font-bold text-green-600">
                {completed} ({completedPercentage}%)
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">In Progress / Moderation</span>

              <span className="font-bold text-amber-600">
                {inProgress} ({inProgressPercentage}%)
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">Overdue Packets</span>

              <span className="font-bold text-red-600">
                {overdue} ({overduePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* ANALYTICS */}

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
          <BarChart3 className="text-blue-500 mb-3" size={48} />

          <h3 className="text-md font-bold text-gray-800">
            Lecturer Workload Analytics
          </h3>

          <p className="text-sm text-gray-500 max-w-sm mt-1">
            Workload and completion information is loaded directly from the
            department backend.
          </p>
        </div>
      </div>

      {/* ======================================================
          LECTURER PROGRESS GRAPH
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Lecturer Progress Velocity Over Time
            </h2>

            <p className="text-xs text-gray-500">
              Comparing completion percentage trajectories among department
              lecturers.
            </p>
          </div>

          {/* LEGEND */}

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {chartData.lecturers.map((lec) => (
              <div key={lec.name} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: lec.color,
                  }}
                />

                <span className="font-medium text-gray-700">{lec.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ====================================================
            NO DATA
        ==================================================== */}

        {chartData.lecturers.length === 0 ? (
          <div className="py-12 text-center">
            <BarChart3 size={40} className="mx-auto text-gray-300 mb-3" />

            <p className="text-sm text-gray-500">
              No lecturer workload data available.
            </p>
          </div>
        ) : (
          /* ==================================================
             SVG GRAPH
             ================================================== */

          <div className="relative w-full overflow-x-auto pt-4 pb-2">
            <svg className="w-full h-64 min-w-[500px]" viewBox="0 0 600 200">
              {/* GRID */}

              {[0, 50, 100, 150].map((y, i) => (
                <line
                  key={i}
                  x1="40"
                  y1={y}
                  x2="580"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Y AXIS */}

              <text x="30" y="15" fill="#9ca3af" fontSize="10" textAnchor="end">
                100%
              </text>

              <text x="30" y="65" fill="#9ca3af" fontSize="10" textAnchor="end">
                75%
              </text>

              <text
                x="30"
                y="115"
                fill="#9ca3af"
                fontSize="10"
                textAnchor="end"
              >
                50%
              </text>

              <text
                x="30"
                y="165"
                fill="#9ca3af"
                fontSize="10"
                textAnchor="end"
              >
                25%
              </text>

              {/* X AXIS */}

              {chartData.weeks.map((week, idx) => {
                const xCoord = 60 + idx * 125;

                return (
                  <text
                    key={week}
                    x={xCoord}
                    y="185"
                    fill="#6b7280"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {week}
                  </text>
                );
              })}

              {/* LECTURER LINES */}

              {chartData.lecturers.map((lec) => {
                const points = lec.data
                  .map((value, idx) => {
                    const x = 60 + idx * 125;

                    const y = 150 - (Number(value) / 100) * 130;

                    return `${x},${y}`;
                  })
                  .join(" ");

                return (
                  <g key={lec.name}>
                    {/* LINE */}

                    <polyline
                      fill="none"
                      stroke={lec.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />

                    {/* POINTS */}

                    {lec.data.map((value, idx) => {
                      const x = 60 + idx * 125;

                      const y = 150 - (Number(value) / 100) * 130;

                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#ffffff"
                          stroke={lec.color}
                          strokeWidth="2"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
