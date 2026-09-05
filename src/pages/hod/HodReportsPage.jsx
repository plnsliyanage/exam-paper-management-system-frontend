import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { hodApi } from "../../services/api";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  DRAFT: { label: "Draft", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  SUBMITTED: { label: "Under Moderation", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  REJECTED: { label: "Changes Requested", bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  PRINTING: { label: "Printing Queue", bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};

export default function HodReportsPage({ deptId = "ALL" }) {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hodApi.getDepartmentReport(deptId);
      setReport(res.data || res);
    } catch (err) {
      console.error(err);
      setError("Failed to load department report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [deptId]);

  const courseBreakdown = useMemo(() => {
    return Array.isArray(report?.courseBreakdown) ? report.courseBreakdown : [];
  }, [report]);

  const coursesList = useMemo(() => {
    return Array.from(new Set(courseBreakdown.map((c) => c.courseCode))).map((code) => {
      const found = courseBreakdown.find((c) => c.courseCode === code);
      return { code, name: found?.courseName || code };
    });
  }, [courseBreakdown]);

  const filteredCourses = useMemo(() => {
    if (selectedCourse === "all") return courseBreakdown;
    return courseBreakdown.filter((c) => c.courseCode === selectedCourse);
  }, [courseBreakdown, selectedCourse]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await hodApi.exportReport(deptId, format);
      const blob = new Blob([response.data], {
        type: format === "excel" ? "text/csv" : "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `department_exam_report_${report?.departmentCode || "DEPT"}.${format === "excel" ? "csv" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
        <span>Generating Department Exam Report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl max-w-xl mx-auto my-8">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#7c4dff] bg-[#7c4dff]/10 px-2.5 py-0.5 rounded-full border border-[#7c4dff]/20 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {report?.departmentName || "Department"}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Academic Cycle 2025/2026
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Department Examination Progress Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail and status metrics for all course units and exam packets in your faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {exporting === "excel" ? "Exporting..." : "Export CSV Report"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="px-4 py-2.5 bg-[#7c4dff] hover:bg-[#6c3de8] text-white font-bold rounded-xl flex items-center gap-2 transition cursor-pointer text-xs shadow-md shadow-[#7c4dff]/20"
          >
            <FileText className="w-4 h-4" />
            {exporting === "pdf" ? "Exporting..." : "Export PDF Summary"}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Course Units</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{report?.totalPackets || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed Packets</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{report?.completedPackets || 0}</p>
          <span className="text-[10px] text-slate-400">{report?.completionPercentage || 0}% completion rate</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">In Active Workflow</span>
          <p className="text-3xl font-black text-amber-600 mt-1">{report?.inProgressPackets || 0}</p>
          <span className="text-[10px] text-slate-400">Draft, Moderation, or Print</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Overdue Packets</span>
          <p className="text-3xl font-black text-rose-600 mt-1">{report?.overduePackets || 0}</p>
          <span className="text-[10px] text-rose-500 font-semibold">Requires immediate follow-up</span>
        </div>
      </div>

      {/* Filter by Course Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 font-semibold cursor-pointer"
          >
            <option value="all">All Department Courses ({courseBreakdown.length})</option>
            {coursesList.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          Showing {filteredCourses.length} units
        </span>
      </div>

      {/* Course Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Course Unit</th>
                <th className="py-3 px-4">Lecturer</th>
                <th className="py-3 px-4">Moderator</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    No course units found for this report filter.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c, i) => {
                  const statusKey = (c.status || "PENDING").toUpperCase();
                  const statusMeta = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block text-xs">{c.courseCode}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{c.courseName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium text-xs">
                        {c.lecturerName || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {c.moderatorName || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {c.deadline || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.overdue ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Delayed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
