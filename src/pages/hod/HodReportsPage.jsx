import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { hodApi } from "../../services/api";

const DEPARTMENT_ID = "D1";

export default function HodReportsPage() {
  const [reportType, setReportType] = useState("overall");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const [report, setReport] = useState(null);
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null); // "pdf" | "excel" | null

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      hodApi.getDepartmentReport(DEPARTMENT_ID),
      hodApi.getDepartmentPackets(DEPARTMENT_ID),
    ])
      .then(([reportData, packetsData]) => {
        setReport(reportData);
        // Safely extract array whether it's returned directly or nested in an object
        const packetList = Array.isArray(packetsData)
          ? packetsData
          : packetsData?.data || packetsData?.packets || [];
        setPackets(packetList);
      })
      .catch((err) => setError(err?.message || "Failed to load report data."))
      .finally(() => setLoading(false));
  }, []);

  // Ensure packets is always treated safely as an array
  const safePackets = useMemo(() => {
    return Array.isArray(packets) ? packets : [];
  }, [packets]);

  // Course dropdown, built from live packets
  const courses = useMemo(
    () =>
      Array.from(
        new Map(
          safePackets.map((p) => [
            p.courseCode,
            { code: p.courseCode, name: p.courseName },
          ]),
        ).values(),
      ),
    [safePackets],
  );

  const filteredPackets = useMemo(() => {
    if (selectedCourse === "all") return safePackets;
    return safePackets.filter((p) => p.courseCode === selectedCourse);
  }, [safePackets, selectedCourse]);

  const completedSet = filteredPackets.filter((p) => p.status === "Completed");
  const inProgressSet = filteredPackets.filter(
    (p) => p.status !== "Completed" && !p.isOverdue,
  );
  const overdueSet = filteredPackets.filter((p) => p.isOverdue);

  const completionPercentage =
    filteredPackets.length > 0
      ? Math.round((completedSet.length / filteredPackets.length) * 100)
      : 0;

  const handleExport = (format) => {
    setExporting(format);
    hodApi
      .exportReport(DEPARTMENT_ID, format)
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `department_report_${DEPARTMENT_ID}.${format === "excel" ? "csv" : "pdf"}`;
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
      <div className="p-6 flex justify-center items-center min-h-screen bg-slate-100">
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Loading report...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-slate-100">
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen text-slate-800 font-sans">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            {report?.departmentName || DEPARTMENT_ID}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Department Examination Reports & Status Sets
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review structured sets of lecturers categorized by completion status
            and active workflow stages.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition disabled:opacity-60"
          >
            <Download size={15} />
            {exporting === "pdf" ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={exporting !== null}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition disabled:opacity-60"
          >
            <Download size={15} />
            {exporting === "excel" ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Report View Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-[240px]"
            >
              <option value="overall">Comprehensive Department Audit</option>
              <option value="sets">Categorized Status Sets</option>
              <option value="matrix">Course Code & Stage Ledger</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Filter by Course Code
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-[220px]"
            >
              <option value="all">All Department Courses</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={BarChart3}
          label="Total Packets"
          value={report?.totalPackets ?? 0}
          note="Department assigned units"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Completed"
          value={report?.completedPackets ?? 0}
          note={`${completionPercentage}% fully completed`}
        />
        <MetricCard
          icon={Clock3}
          label="In Progress"
          value={report?.inProgressPackets ?? 0}
          note="Active workflows ongoing"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={report?.overduePackets ?? 0}
          note="Requires immediate attention"
        />
      </div>

      {/* CATEGORIZED SETS */}
      {(reportType === "overall" || reportType === "sets") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatusSetCard
            title="Completed Set"
            icon={CheckCircle2}
            iconColor="text-emerald-700"
            items={completedSet}
            badgeClass="bg-emerald-100 text-emerald-800"
          />
          <StatusSetCard
            title="In Progress Set"
            icon={Clock3}
            iconColor="text-amber-700"
            items={inProgressSet}
            badgeClass="bg-amber-100 text-amber-800"
          />
          <StatusSetCard
            title="Overdue Set"
            icon={AlertTriangle}
            iconColor="text-rose-700"
            items={overdueSet}
            badgeClass="bg-rose-100 text-rose-800"
            danger
          />
        </div>
      )}

      {/* LEDGER TABLE */}
      {(reportType === "overall" || reportType === "matrix") && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <BookOpen size={16} className="text-slate-700" />
              Department Course & Stage Execution Ledger
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredPackets.length} packet(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Course Code & Title
                  </th>
                  <th className="px-4 py-3 font-semibold">Current Holder</th>
                  <th className="px-3 py-3 font-semibold text-center">
                    Current Workflow Stage
                  </th>
                  <th className="px-3 py-3 font-semibold text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPackets.map((p) => (
                  <tr
                    key={p.packetId}
                    className="hover:bg-slate-50/70 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {p.courseCode}
                      </div>
                      <div className="text-xs text-slate-600">
                        {p.courseName}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.currentHolderName}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium text-xs border border-slate-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          p.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : p.isOverdue
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {p.status === "Completed"
                          ? "Completed"
                          : p.isOverdue
                            ? "Overdue"
                            : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck size={16} className="text-slate-700" />
        <span>
          Exports are generated live from the current department data.
        </span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="p-2 bg-slate-100 rounded-md">
          <Icon size={18} className="text-slate-700" />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">{note}</p>
    </div>
  );
}

function StatusSetCard({
  title,
  icon: Icon,
  iconColor,
  items,
  badgeClass,
  danger,
}) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Icon size={16} className={iconColor} />
          {title} ({items.length})
        </h3>
      </div>
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No packets in this set.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.packetId}
              className={`p-3 rounded border text-xs space-y-1.5 ${danger ? "bg-rose-50/50 border-rose-200" : "bg-slate-50 border-slate-200"}`}
            >
              <div className="flex justify-between font-bold text-slate-900">
                <span>{item.courseCode}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${badgeClass}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-slate-600">{item.courseName}</p>
              <div className="pt-1 border-t border-slate-200/60 flex justify-between text-[11px]">
                <span className="text-slate-500">
                  Holder:{" "}
                  <strong className="text-slate-800">
                    {item.currentHolderName}
                  </strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
