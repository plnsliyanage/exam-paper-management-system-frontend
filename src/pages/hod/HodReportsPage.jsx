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

  // Mock data for department workflow progress per stage
  const workflowStages = [
    { stage: "Assigned", count: 48, percentage: 100, color: "bg-blue-500" },
    {
      stage: "In Progress",
      count: 32,
      percentage: 66.6,
      color: "bg-amber-500",
    },
    { stage: "Moderation", count: 24, percentage: 50, color: "bg-purple-500" },
    { stage: "Completed", count: 17, percentage: 35.4, color: "bg-green-500" },
    { stage: "Overdue", count: 7, percentage: 14.6, color: "bg-red-500" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 shadow-sm"
          >
            <Download size={16} /> Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
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
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
          >
            <option value="2026/2027 Sem 1">2026/2027 Sem 1</option>
            <option value="2025/2026 Sem 2">2025/2026 Sem 2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Statistics */}
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

        {/* Workflow Pipeline Graph / Visualizer */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                Department Workflow Pipeline
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                {academicCycle}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Real-time distribution of examination packets across workflow
              stages.
            </p>
          </div>

          <div className="space-y-3">
            {workflowStages.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-700">
                  <span>{item.stage}</span>
                  <span>
                    {item.count} packets ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
