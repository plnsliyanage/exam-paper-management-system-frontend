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
} from "lucide-react";
import { hodApi } from "../../services/api";

export default function HodReportsPage({ deptId = "ALL" }) {
  const [reportType, setReportType] = useState("overall");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const [report, setReport] = useState(null);
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      hodApi.getDepartmentReport(deptId),
      hodApi.getDepartmentPackets(deptId),
    ])
      .then(([reportRes, packetsRes]) => {
        setReport(reportRes.data || reportRes);
        const packetList = Array.isArray(packetsRes.data)
          ? packetsRes.data
          : Array.isArray(packetsRes) ? packetsRes : [];
        setPackets(packetList);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load department report data.");
      })
      .finally(() => setLoading(false));
  }, [deptId]);

  const safePackets = useMemo(() => Array.isArray(packets) ? packets : [], [packets]);

  const courses = useMemo(
    () =>
      Array.from(
        new Map(
          safePackets.map((p) => [
            p.courseCode,
            { code: p.courseCode, name: p.courseName },
          ])
        ).values()
      ),
    [safePackets]
  );

  const filteredPackets = useMemo(() => {
    if (selectedCourse === "all") return safePackets;
    return safePackets.filter((p) => p.courseCode === selectedCourse);
  }, [safePackets, selectedCourse]);

  const completedSet = filteredPackets.filter(
    (p) => (p.status || "").toUpperCase() === "COMPLETED" || (p.status || "").toUpperCase() === "APPROVED"
  );
  const inProgressSet = filteredPackets.filter(
    (p) =>
      (p.status || "").toUpperCase() !== "COMPLETED" &&
      (p.status || "").toUpperCase() !== "APPROVED" &&
      !p.isOverdue
  );
  const overdueSet = filteredPackets.filter((p) => p.isOverdue);

  const completionPercentage =
    filteredPackets.length > 0
      ? Math.round((completedSet.length / filteredPackets.length) * 100)
      : 0;

  const handleExport = (format) => {
    setExporting(format);
    hodApi
      .exportReport(deptId, format)
      .then((response) => {
        const blob = new Blob([response.data], {
          type: format === "excel" ? "text/csv" : "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `department_report_${deptId}.${format === "excel" ? "csv" : "pdf"}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert("Export failed. Please try again."))
      .finally(() => setExporting(null));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Generating department report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#7c4dff] bg-[#7c4dff]/10 px-2 py-0.5 rounded">
            {report?.departmentName || deptId}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Department Examination Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of department packet progress and lecturer workloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer text-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            {exporting === "excel" ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="px-3.5 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] text-white font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer text-xs shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            {exporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Packets</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{report?.totalPackets ?? filteredPackets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{report?.completedPackets ?? completedSet.length}</p>
          <span className="text-[10px] text-slate-400">{completionPercentage}% of total</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">In Progress</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{report?.inProgressPackets ?? inProgressSet.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Overdue</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{report?.overduePackets ?? overdueSet.length}</p>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Completed Packets ({completedSet.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {completedSet.length === 0 ? (
              <p className="text-slate-400 italic text-center py-4">No completed packets.</p>
            ) : (
              completedSet.map((p) => (
                <div key={p.packetId} className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="font-bold text-slate-800 block text-xs">{p.courseCode}</span>
                  <span className="text-[11px] text-slate-500">{p.courseName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
            <Clock3 className="w-4 h-4 text-amber-600" />
            In Progress Packets ({inProgressSet.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {inProgressSet.length === 0 ? (
              <p className="text-slate-400 italic text-center py-4">No in-progress packets.</p>
            ) : (
              inProgressSet.map((p) => (
                <div key={p.packetId} className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <span className="font-bold text-slate-800 block text-xs">{p.courseCode}</span>
                  <span className="text-[11px] text-slate-500">{p.courseName} • Holder: {p.currentHolderName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Overdue Packets ({overdueSet.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {overdueSet.length === 0 ? (
              <p className="text-slate-400 italic text-center py-4">No overdue packets.</p>
            ) : (
              overdueSet.map((p) => (
                <div key={p.packetId} className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <span className="font-bold text-slate-800 block text-xs">{p.courseCode}</span>
                  <span className="text-[11px] text-rose-600 font-semibold">Deadline: {p.deadline || "Past"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
