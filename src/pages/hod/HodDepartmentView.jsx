import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldAlert,
  Edit3,
  CheckSquare,
  Printer,
  BarChart2,
  BookOpen,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Activity,
  Send,
} from "lucide-react";
import { hodApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useAcademicCycle } from "../../context/AcademicCycleContext";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  DRAFT: { label: "Draft", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  SUBMITTED: { label: "Under Moderation", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  REJECTED: { label: "Changes Requested", bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  PRINTING: { label: "Printing", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  "PAPERS STORED": { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  PAPERS_STORED: { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  "ANSWER SHEETS TAKEN": { label: "Sheets Taken", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  ANSWER_SHEETS_TAKEN: { label: "Sheets Taken", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  UNDER_MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  "MARKING COMPLETE": { label: "Marking Complete", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  MARKING_COMPLETE: { label: "Marking Complete", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
};

export default function HodDepartmentView({ deptId = "ALL" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCycleId } = useAcademicCycle();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigateTo = (target) => navigate(`/hod/${target}`);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [statsRes, packetsRes] = await Promise.all([
        hodApi.getDepartmentStatistics(deptId),
        hodApi.getDepartmentPackets(deptId),
      ]);

      setStats(statsRes.data || statsRes);
      const safePackets = Array.isArray(packetsRes.data)
        ? packetsRes.data
        : Array.isArray(packetsRes)
          ? packetsRes
          : [];
      setPackets(safePackets);
    } catch (err) {
      console.error("Failed to load department dashboard:", err);
      setError("Failed to load department dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptId, selectedCycleId]);

  const totalPacketsCount = stats?.totalPackets ?? packets.length;
  const pendingCount = stats?.pendingPackets ?? packets.filter((p) => (p.status || "").toUpperCase() === "PENDING").length;
  const draftCount = stats?.draftPackets ?? packets.filter((p) => (p.status || "").toUpperCase() === "DRAFT").length;
  const submittedCount = stats?.submittedPackets ?? packets.filter((p) => (p.status || "").toUpperCase() === "SUBMITTED").length;
  const approvedCount = stats?.approvedPackets ?? packets.filter((p) => (p.status || "").toUpperCase() === "APPROVED").length;
  const printingCount = stats?.printingPackets ?? packets.filter((p) => ["PRINTING", "PAPERS STORED", "PAPERS_STORED"].includes((p.status || "").toUpperCase())).length;
  const markingCount = packets.filter((p) => ["ANSWER SHEETS TAKEN", "ANSWER_SHEETS_TAKEN", "MARKING", "UNDER_MARKING"].includes((p.status || "").toUpperCase())).length;
  const completedCount = stats?.completedPackets ?? packets.filter((p) => ["COMPLETED", "MARKING COMPLETE", "MARKING_COMPLETE"].includes((p.status || "").toUpperCase())).length;
  const overdueCount = stats?.overduePackets ?? packets.filter((p) => p.overdue || p.isOverdue).length;

  const summaryCards = useMemo(() => {
    return [
      {
        title: "Total Dept Packets",
        value: totalPacketsCount,
        icon: FileText,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        desc: "All active & archived",
      },
      {
        title: "Pending / In Draft",
        value: pendingCount + draftCount,
        icon: Edit3,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        desc: "Awaiting lecturer drafting",
      },
      {
        title: "Under Moderation",
        value: submittedCount,
        icon: CheckSquare,
        color: "text-purple-600 bg-purple-50 border-purple-100",
        desc: "Submitted for review",
      },
      {
        title: "Approved / Printing & Stored",
        value: approvedCount + printingCount,
        icon: Printer,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
        desc: "Ready or in safe custody",
      },
      {
        title: "Marking & Completed",
        value: markingCount + completedCount,
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        desc: "Marking in-progress or done",
      },
    ];
  }, [totalPacketsCount, pendingCount, draftCount, submittedCount, approvedCount, printingCount, markingCount, completedCount]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
        <span>Loading Department Workspace...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-[#7c4dff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7c4dff]/30 text-indigo-200 border border-[#7c4dff]/40 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                {stats?.departmentName || user?.department?.departmentName || "Academic Department"}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Academic Year 2025/2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Head of Department Workspace
            </h1>
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              Supervise examination packets, track lecturer & moderator progress, oversee staff workload, and resolve bottlenecks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 border border-white/15 text-xs shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              onClick={() => navigateTo("reports")}
              className="px-4 py-2.5 bg-[#7c4dff] hover:bg-[#6c3de8] text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-2 text-xs shadow-lg shadow-[#7c4dff]/30"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Department Report
            </button>

          </div>
        </div>
      </div>

      {/* Overdue Alert Banner if overdue > 0 */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs">
                {overdueCount} Exam Packet{overdueCount > 1 ? "s" : ""} Overdue in Your Department!
              </p>
              <p className="text-[11px] text-rose-700">
                Action required: Some packets have passed their submission or moderation deadlines.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo("overdue")}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition cursor-pointer text-xs whitespace-nowrap"
          >
            Review Overdue Items →
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">{card.title}</span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stage Distribution Pipeline Visual Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7c4dff]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Department Exam Packet Lifecycle Distribution
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            {totalPacketsCount} Total Units Active
          </span>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {totalPacketsCount > 0 ? (
            <>
              <div
                style={{ width: `${(pendingCount / totalPacketsCount) * 100}%` }}
                className="bg-slate-400 h-full transition-all"
                title={`Pending: ${pendingCount}`}
              />
              <div
                style={{ width: `${(draftCount / totalPacketsCount) * 100}%` }}
                className="bg-blue-500 h-full transition-all"
                title={`Draft: ${draftCount}`}
              />
              <div
                style={{ width: `${(submittedCount / totalPacketsCount) * 100}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Under Moderation: ${submittedCount}`}
              />
              <div
                style={{ width: `${(approvedCount / totalPacketsCount) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Approved: ${approvedCount}`}
              />
              <div
                style={{ width: `${(printingCount / totalPacketsCount) * 100}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Printing Queue: ${printingCount}`}
              />
              <div
                style={{ width: `${(completedCount / totalPacketsCount) * 100}%` }}
                className="bg-teal-500 h-full transition-all"
                title={`Completed: ${completedCount}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-200 h-full" />
          )}
        </div>

        <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Pending ({pendingCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Draft ({draftCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Under Moderation ({submittedCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Approved ({approvedCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Printing ({printingCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Completed ({completedCount})
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Packets Table + Quick Nav Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Packets Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Department Exam Packets</h2>
              <p className="text-[11px] text-slate-400">Recent examination packets in your department</p>
            </div>
            <button
              onClick={() => navigateTo("packets")}
              className="text-xs text-[#7c4dff] hover:text-[#6c3de8] font-bold cursor-pointer flex items-center gap-1"
            >
              View All ({packets.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Packet & Course</th>
                  <th className="py-2.5 px-3">Lecturer</th>
                  <th className="py-2.5 px-3">Moderator</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No exam packets recorded for this department.
                    </td>
                  </tr>
                ) : (
                  packets.slice(0, 6).map((pkt) => {
                    const statusKey = (pkt.status || "PENDING").toUpperCase();
                    const statusMeta = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
                    return (
                      <tr key={pkt.id || pkt.packetId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block text-xs">
                            {pkt.courseCode}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {pkt.courseName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium text-xs">
                          {pkt.lecturerName || "Unassigned"}
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-xs">
                          {pkt.moderatorName || "Unassigned"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 text-xs font-semibold">
                          {pkt.deadline || "N/A"}
                          {pkt.overdue && (
                            <span className="block text-[9px] text-rose-600 font-bold">Overdue</span>
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

        {/* Quick Navigation Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-800">Quick Navigation</h2>

            <div className="space-y-2">
              <div
                onClick={() => navigateTo("courses")}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Course Staffing</p>
                    <p className="text-[11px] text-slate-500">Assign Lecturers & Moderators</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>

              <div
                onClick={() => navigateTo("workload")}
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Staff Workload</p>
                    <p className="text-[11px] text-slate-500">Monitor marking & moderation</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </div>

              <div
                onClick={() => navigateTo("overdue")}
                className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Overdue Items</p>
                    <p className="text-[11px] text-slate-500">
                      {overdueCount > 0 ? `${overdueCount} packets delayed` : "All packets on track"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition" />
              </div>

              <div
                onClick={() => navigateTo("reports")}
                className="p-3 bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-100 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>

                    <p className="text-xs font-bold text-slate-800">Department Reports</p>
                    <p className="text-[11px] text-slate-500">Generate stats & export CSV</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
              </div>

              <div
                onClick={() => navigateTo("previous")}
                className="p-3 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-100 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Academic Archives</p>
                    <p className="text-[11px] text-slate-500">Completed & past records</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
