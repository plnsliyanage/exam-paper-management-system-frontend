import React, { useState } from "react";
import { BarChart3, Download, TrendingUp } from "lucide-react";

export default function HodReportsPage() {
  const [reportType, setReportType] = useState("progress");
  const [academicCycle, setAcademicCycle] = useState("2026/2027 Sem 1");

  const handleExport = (format) => {
    alert(
      `Successfully exported ${reportType} report as ${format.toUpperCase()}!`,
    );
  };

  // Mock data for the line chart: Lecturer progress over weeks
  const chartData = {
    weeks: ["Week 2", "Week 4", "Week 6", "Week 8", "Week 10"],
    lecturers: [
      { name: "Dr. Smith", color: "#2563eb", data: [15, 35, 60, 85, 95] },
      { name: "Prof. Davis", color: "#16a34a", data: [20, 45, 55, 70, 88] },
      { name: "Dr. Taylor", color: "#d97706", data: [10, 25, 40, 55, 75] },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Generate, analyze, and export comprehensive department performance &
            progress reports.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download size={16} /> Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
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

      {/* Summary Statistics & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Summary Statistics ({academicCycle})
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">Total Assigned Packets</span>
              <span className="font-bold text-gray-900">48</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">Completed Packets</span>
              <span className="font-bold text-green-600">17 (35.4%)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">In Progress / Moderation</span>
              <span className="font-bold text-amber-600">24 (50.0%)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
              <span className="text-gray-600">Overdue Packets</span>
              <span className="font-bold text-red-600">7 (14.6%)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
          <BarChart3 className="text-blue-500 mb-3" size={48} />
          <h3 className="text-md font-bold text-gray-800">
            Visual Analytics Ready
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            Charts and visual analytics for marking progress and turnaround
            times are compiled in the exported PDF/Excel report.
          </p>
        </div>
      </div>

      {/* New: Lecturer Working Pace Line Graph Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} /> Lecturer
              Progress Velocity Over Time
            </h2>
            <p className="text-xs text-gray-500">
              Comparing completion percentage trajectories among faculty members
              across semester weeks.
            </p>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {chartData.lecturers.map((lec) => (
              <div key={lec.name} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: lec.color }}
                ></span>
                <span className="font-medium text-gray-700">{lec.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pure SVG Line Chart */}
        <div className="relative w-full overflow-x-auto pt-4 pb-2">
          <svg className="w-full h-64 min-w-[500px]" viewBox="0 0 600 200">
            {/* Grid lines */}
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

            {/* Y-axis Labels */}
            <text x="30" y="15" fill="#9ca3af" fontSize="10" textAnchor="end">
              100%
            </text>
            <text x="30" y="65" fill="#9ca3af" fontSize="10" textAnchor="end">
              75%
            </text>
            <text x="30" y="115" fill="#9ca3af" fontSize="10" textAnchor="end">
              50%
            </text>
            <text x="30" y="165" fill="#9ca3af" fontSize="10" textAnchor="end">
              25%
            </text>

            {/* X-axis Labels */}
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

            {/* Render Lines & Data Points */}
            {chartData.lecturers.map((lec) => {
              const points = lec.data
                .map((val, idx) => {
                  const x = 60 + idx * 125;
                  const y = 150 - (val / 100) * 130; // map 0-100% to canvas height
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <g key={lec.name}>
                  {/* Polyline */}
                  <polyline
                    fill="none"
                    stroke={lec.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                  {/* Data Points */}
                  {lec.data.map((val, idx) => {
                    const x = 60 + idx * 125;
                    const y = 150 - (val / 100) * 130;
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
      </div>
    </div>
  );
}
