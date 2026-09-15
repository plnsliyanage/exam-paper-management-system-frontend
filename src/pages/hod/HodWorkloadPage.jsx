import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Bell,
  Send,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  CheckSquare,
  Clock,
  ShieldAlert,
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCheck2,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import { hodApi } from "../../services/api";
import { useAcademicCycle } from "../../context/AcademicCycleContext";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  DRAFT: { label: "Draft", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  SUBMITTED: { label: "Under Moderation", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  UNDER_MODERATION: { label: "Under Moderation", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  REJECTED: { label: "Revision", bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  PRINTING: { label: "Printing", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  PRINTING_QUEUE: { label: "Printing", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  "PAPERS STORED": { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  PAPERS_STORED: { label: "Papers Stored", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  "ANSWER SHEETS TAKEN": { label: "Sheets Taken", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  ANSWER_SHEETS_TAKEN: { label: "Sheets Taken", bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  FIRST_MARKING: { label: "1st Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  UNDER_MARKING: { label: "Marking", bg: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  SECOND_MARKING: { label: "2nd Marking", bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  SECOND_MARKING_COMPLETE: { label: "2nd Marking Done", bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", dot: "bg-fuchsia-500" },
  "MARKING COMPLETE": { label: "Marking Done", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  MARKING_COMPLETE: { label: "Marking Done", bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  COMPLETED: { label: "Completed", bg: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
};

export default function HodWorkloadPage({ deptId = "ALL" }) {
  const { selectedCycleId } = useAcademicCycle();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accordion state for expanded course breakdowns
  const [expandedStaffIds, setExpandedStaffIds] = useState(new Set());

  // Modal Notification state
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [courseContext, setCourseContext] = useState(null);

  // Filter and Search
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterMarking, setFilterMarking] = useState("ALL"); // ALL, IN_PROGRESS, COMPLETED
  const [searchQuery, setSearchQuery] = useState("");

  const loadWorkload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hodApi.getDepartmentWorkload(deptId, selectedCycleId);
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setLecturers(data);
    } catch (err) {
      console.error("Failed to load department workload:", err);
      setError("Failed to load department workload data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkload();
  }, [deptId, selectedCycleId]);

  const toggleExpand = (lecturerId) => {
    setExpandedStaffIds((prev) => {
      const next = new Set(prev);
      if (next.has(lecturerId)) {
        next.delete(lecturerId);
      } else {
        next.add(lecturerId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set(lecturers.map((l) => l.lecturerId));
    setExpandedStaffIds(allIds);
  };

  const collapseAll = () => {
    setExpandedStaffIds(new Set());
  };

  const openNotifyModal = (staff, course = null) => {
    setSelectedStaff(staff);
    setCourseContext(course);
    if (course) {
      setNotificationMessage(
        `Dear ${staff.lecturerName},\n\nRegarding ${course.courseCode} (${course.courseName}): Please ensure the script marking progress is kept up to date. Current progress: ${course.markedScripts || 0}/${course.numberOfCopies || 50} scripts (${course.markingProgress || 0}%). Deadline: ${course.deadline || "Scheduled"}.\n\nBest regards,\nHead of Department`
      );
    } else {
      setNotificationMessage("");
    }
    setIsUrgent(false);
  };

  const handleSendNotification = async () => {
    if (!selectedStaff || !notificationMessage.trim()) return;

    setSending(true);
    try {
      await hodApi.notifyStaff({
        targetUserId: selectedStaff.lecturerId,
        message: notificationMessage.trim(),
        title: isUrgent ? "URGENT: Department Exam Notice" : "Notice from Head of Department",
        isUrgent: isUrgent,
      });

      setSuccessMessage(`Notification successfully sent to ${selectedStaff.lecturerName}`);
      setNotificationMessage("");
      setSelectedStaff(null);
      setCourseContext(null);
      setIsUrgent(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to send notification:", err);
      alert("Failed to send notification. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return lecturers.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (l.lecturerName || "").toLowerCase().includes(q) ||
        (l.username || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.assignedCourses || []).some((c) => c.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      // Role filter
      if (filterRole === "ROLE_USER" && l.role !== "ROLE_USER") return false;
      if (filterRole === "ROLE_MODERATOR" && l.role !== "ROLE_MODERATOR") return false;

      // Marking filter
      if (filterMarking === "IN_PROGRESS") {
        if ((l.totalScripts || 0) === 0 || (l.markedScripts || 0) >= (l.totalScripts || 0)) {
          return false;
        }
      } else if (filterMarking === "COMPLETED") {
        if ((l.totalScripts || 0) === 0 || (l.markedScripts || 0) < (l.totalScripts || 0)) {
          return false;
        }
      }

      return true;
    });
  }, [lecturers, searchQuery, filterRole, filterMarking]);

  // Aggregate statistics
  const statsSummary = useMemo(() => {
    const totalStaff = lecturers.length;
    const totalPackets = lecturers.reduce((sum, l) => sum + (l.totalAssignedPackets || 0), 0);
    const totalOverdue = lecturers.reduce((sum, l) => sum + (l.overduePackets || 0), 0);
    const totalCopies = lecturers.reduce((sum, l) => sum + (l.totalScripts || 0), 0);
    const totalMarked = lecturers.reduce((sum, l) => sum + (l.markedScripts || 0), 0);
    const avgProgress = totalCopies > 0 ? Math.round((totalMarked / totalCopies) * 100) : 0;

    return { totalStaff, totalPackets, totalOverdue, totalCopies, totalMarked, avgProgress };
  }, [lecturers]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Staff Workload & Marking Progress</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7c4dff]/10 text-[#7c4dff] border border-[#7c4dff]/20">
              Live Monitoring
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Track exam drafting, moderation assignments, and physical script marking progress per relevant lecturer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expandedStaffIds.size > 0 ? (
            <button
              onClick={collapseAll}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronUp className="w-3.5 h-3.5" /> Collapse All
            </button>
          ) : (
            <button
              onClick={expandAll}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronDown className="w-3.5 h-3.5" /> Expand All Courses
            </button>
          )}

          <button
            onClick={loadWorkload}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm cursor-pointer font-semibold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#7c4dff]" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xs">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Academic Staff</span>
            <p className="text-2xl font-black text-slate-900">{statsSummary.totalStaff}</p>
            <span className="text-[10px] text-slate-500 font-medium">Assigned in Dept</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Total Exam Units</span>
            <p className="text-2xl font-black text-slate-900">{statsSummary.totalPackets}</p>
            <span className="text-[10px] text-slate-500 font-medium">Packets under management</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Script Copies Volume</span>
            <p className="text-2xl font-black text-indigo-600">
              {statsSummary.totalMarked.toLocaleString()} <span className="text-sm font-bold text-slate-400">/ {statsSummary.totalCopies.toLocaleString()}</span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              {statsSummary.totalCopies - statsSummary.totalMarked} copies remaining
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] text-slate-400 font-semibold block">Overall Marking Progress</span>
              <span className="text-xs font-black text-emerald-600">{statsSummary.avgProgress}%</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{statsSummary.avgProgress}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(statsSummary.avgProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterRole("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                filterRole === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Staff ({lecturers.length})
            </button>
            <button
              onClick={() => setFilterRole("ROLE_USER")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                filterRole === "ROLE_USER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lecturers
            </button>
            <button
              onClick={() => setFilterRole("ROLE_MODERATOR")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                filterRole === "ROLE_MODERATOR" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Moderators
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterMarking("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                filterMarking === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Progress
            </button>
            <button
              onClick={() => setFilterMarking("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                filterMarking === "IN_PROGRESS" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Marking In Progress
            </button>
            <button
              onClick={() => setFilterMarking("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                filterMarking === "COMPLETED" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Marking Completed
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by lecturer, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs font-medium"
          />
        </div>
      </div>

      {/* Workload Table with Nested Course Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
            <span>Loading staff workload and script progress...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
            {error}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No staff members found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4">Academic Staff</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Courses</th>
                  <th className="py-3 px-4 text-center">Assigned Units</th>
                  <th className="py-3 px-4 min-w-[200px]">Script Copies & Marking Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => {
                  const isExpanded = expandedStaffIds.has(staff.lecturerId);
                  const totalScripts = staff.totalScripts || 0;
                  const markedScripts = staff.markedScripts || 0;
                  const progressPct = staff.progressPercentage || (totalScripts > 0 ? Math.round((markedScripts / totalScripts) * 100) : 0);
                  const remainingScripts = Math.max(0, totalScripts - markedScripts);
                  const breakdown = staff.courseBreakdown || [];

                  return (
                    <React.Fragment key={staff.lecturerId}>
                      {/* Main Staff Summary Row */}
                      <tr
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          isExpanded ? "bg-slate-50/60" : ""
                        }`}
                        onClick={() => toggleExpand(staff.lecturerId)}
                      >
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          <button
                            type="button"
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
                            title={isExpanded ? "Collapse course details" : "Expand course details"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#7c4dff]" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c4dff] to-[#9d72ff] text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                              {(staff.lecturerName || "U")
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                                {staff.lecturerName}
                              </span>
                              <span className="text-[11px] text-slate-400 block">{staff.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              staff.role === "ROLE_MODERATOR"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {staff.role === "ROLE_MODERATOR" ? "Moderator" : "Lecturer"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          {staff.assignedCourses && staff.assignedCourses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {staff.assignedCourses.slice(0, 2).map((c, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200"
                                >
                                  {c.split(" - ")[0]}
                                </span>
                              ))}
                              {staff.assignedCourses.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                                  +{staff.assignedCourses.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">None assigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-black text-slate-900 text-xs px-2.5 py-1 bg-slate-100 rounded-lg">
                            {staff.totalAssignedPackets || 0}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-800">
                                📝 {markedScripts} <span className="text-slate-400 font-normal">/ {totalScripts} copies</span>
                              </span>
                              <span
                                className={`font-black text-xs ${
                                  progressPct >= 100
                                    ? "text-emerald-600"
                                    : progressPct > 0
                                    ? "text-[#7c4dff]"
                                    : "text-slate-400"
                                }`}
                              >
                                {progressPct}%
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progressPct >= 100
                                    ? "bg-emerald-500"
                                    : progressPct >= 50
                                    ? "bg-gradient-to-r from-[#7c4dff] to-[#9d72ff]"
                                    : "bg-gradient-to-r from-amber-400 to-[#7c4dff]"
                                }`}
                                style={{ width: `${Math.min(progressPct, 100)}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[10px]">
                              {remainingScripts > 0 ? (
                                <span className="text-amber-600 font-semibold">{remainingScripts} remaining</span>
                              ) : totalScripts > 0 ? (
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> All Marked
                                </span>
                              ) : (
                                <span className="text-slate-400">No copies assigned</span>
                              )}

                              {breakdown.length > 0 && (
                                <span className="text-slate-400 text-[10px]">
                                  {breakdown.length} {breakdown.length === 1 ? "paper" : "papers"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleExpand(staff.lecturerId)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-[11px] inline-flex items-center gap-1"
                            >
                              {isExpanded ? "Hide" : "Courses"}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => openNotifyModal(staff)}
                              className="px-3 py-1.5 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/20 rounded-xl font-bold transition cursor-pointer text-xs inline-flex items-center gap-1.5"
                            >
                              <Bell className="w-3.5 h-3.5" /> Notify
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Course Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={7} className="p-4 md:p-5">
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-[#7c4dff]" />
                                    Relevant Assigned Exam Packets & Script Marking Details for {staff.lecturerName}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Breakdown of individual course packets, script copy volumes, and marking progression.
                                  </p>
                                </div>

                                <div className="text-[11px] text-slate-500 font-medium">
                                  Total Copies: <strong className="text-slate-800">{totalScripts}</strong> | Marked:{" "}
                                  <strong className="text-emerald-700">{markedScripts}</strong> ({progressPct}%)
                                </div>
                              </div>

                              {breakdown.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 italic text-xs">
                                  No active course packets assigned to this lecturer for the current cycle.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="py-2 px-3">Packet ID</th>
                                        <th className="py-2 px-3">Course</th>
                                        <th className="py-2 px-3">Role</th>
                                        <th className="py-2 px-3">Workflow Stage</th>
                                        <th className="py-2 px-3 text-center">Copies Configured</th>
                                        <th className="py-2 px-3 min-w-[180px]">Script Marking Progress</th>
                                        <th className="py-2 px-3">Deadline</th>
                                        <th className="py-2 px-3 text-right">Quick Directive</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {breakdown.map((course, idx) => {
                                        const cfg = STATUS_CONFIG[course.status] || {
                                          label: course.status,
                                          bg: "bg-slate-100 text-slate-700 border-slate-200",
                                          dot: "bg-slate-400",
                                        };
                                        const cCopies = course.numberOfCopies || 50;
                                        const cMarked = course.markedScripts || 0;
                                        const cProgress =
                                          course.markingProgress !== undefined
                                            ? course.markingProgress
                                            : cCopies > 0
                                            ? Math.round((cMarked / cCopies) * 100)
                                            : 0;
                                        const cRemaining = Math.max(0, cCopies - cMarked);

                                        return (
                                          <tr key={idx} className="hover:bg-slate-50/80 transition">
                                            <td className="py-2.5 px-3">
                                              <span className="font-mono font-bold text-[11px] text-[#7c4dff] bg-[#7c4dff]/5 px-2 py-0.5 rounded border border-[#7c4dff]/10">
                                                {course.packetId || `PKT-${course.id}`}
                                              </span>
                                            </td>

                                            <td className="py-2.5 px-3">
                                              <span className="font-bold text-slate-900 block text-xs">
                                                {course.courseCode}
                                              </span>
                                              <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                                                {course.courseName}
                                              </span>
                                            </td>

                                            <td className="py-2.5 px-3">
                                              <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                  course.roleOnPacket?.includes("Author") ||
                                                  course.roleOnPacket?.includes("Lecturer")
                                                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                    : "bg-purple-50 text-purple-700 border border-purple-100"
                                                }`}
                                              >
                                                {course.roleOnPacket || "Assigned"}
                                              </span>
                                            </td>

                                            <td className="py-2.5 px-3">
                                              <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg}`}
                                              >
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                              </span>
                                            </td>

                                            <td className="py-2.5 px-3 text-center">
                                              <span className="font-bold text-slate-800 text-xs px-2 py-0.5 bg-slate-100 rounded">
                                                {cCopies}
                                              </span>
                                            </td>

                                            <td className="py-2.5 px-3">
                                              <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[11px]">
                                                  <span className="font-bold text-slate-800">
                                                    {cMarked} / {cCopies} scripts
                                                  </span>
                                                  <span
                                                    className={`font-bold text-xs ${
                                                      cProgress >= 100
                                                        ? "text-emerald-600"
                                                        : cProgress > 0
                                                        ? "text-[#7c4dff]"
                                                        : "text-slate-400"
                                                    }`}
                                                  >
                                                    {cProgress}%
                                                  </span>
                                                </div>

                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                  <div
                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                      cProgress >= 100
                                                        ? "bg-emerald-500"
                                                        : "bg-[#7c4dff]"
                                                    }`}
                                                    style={{ width: `${Math.min(cProgress, 100)}%` }}
                                                  />
                                                </div>

                                                <div className="text-[10px] text-slate-400 flex justify-between">
                                                  {cRemaining > 0 ? (
                                                    <span>{cRemaining} copies left to mark</span>
                                                  ) : (
                                                    <span className="text-emerald-600 font-semibold">Marking Completed</span>
                                                  )}
                                                </div>
                                              </div>
                                            </td>

                                            <td className="py-2.5 px-3">
                                              <span className="text-[11px] text-slate-600 font-medium">
                                                {course.deadline || "Scheduled"}
                                              </span>
                                            </td>

                                            <td className="py-2.5 px-3 text-right">
                                              <button
                                                onClick={() => openNotifyModal(staff, course)}
                                                className="px-2.5 py-1 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/20 rounded-lg font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                                              >
                                                <Mail className="w-3 h-3" /> Remind
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct HOD Communication Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-[#7c4dff] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Direct HOD Communication
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Notify {selectedStaff.lecturerName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedStaff(null);
                  setCourseContext(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recipient</span>
                  <p className="font-bold text-slate-800 mt-0.5 text-xs">
                    {selectedStaff.lecturerName} ({selectedStaff.email})
                  </p>
                  {courseContext && (
                    <span className="text-[10px] text-[#7c4dff] font-semibold block mt-0.5">
                      Subject Context: {courseContext.courseCode} - {courseContext.courseName}
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7c4dff]/10 text-[#7c4dff]">
                  {selectedStaff.role === "ROLE_MODERATOR" ? "Moderator" : "Lecturer"}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Message / Academic Directive
                </label>
                <textarea
                  rows={5}
                  placeholder="e.g. Please ensure script marking progress is recorded promptly and completed before the deadline..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs text-slate-800 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentFlag"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer accent-rose-600"
                />
                <label htmlFor="urgentFlag" className="text-slate-700 font-semibold cursor-pointer">
                  Mark as High Priority / Urgent Alert
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedStaff(null);
                    setCourseContext(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !notificationMessage.trim()}
                  className="px-5 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] disabled:opacity-50 text-white rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending..." : "Send Directive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
