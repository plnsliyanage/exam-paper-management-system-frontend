import React, { useEffect, useState } from "react";
import {
  Printer,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  XCircle,
  FileText,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useAcademicCycle } from "../context/AcademicCycleContext";
import SchedulePrintModal from "../components/printing/SchedulePrintModal";

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Scheduled",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  COMPLETED: {
    label: "Printed & Ready",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  DELAYED: {
    label: "Delayed",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
};

const STATUS_FILTER_TABS = [
  { id: "ALL", label: "All Statuses" },
  { id: "SCHEDULED", label: "Scheduled", dot: "bg-blue-500" },
  { id: "IN_PROGRESS", label: "In Progress", dot: "bg-amber-500 animate-pulse" },
  { id: "COMPLETED", label: "Printed & Ready", dot: "bg-emerald-500" },
  { id: "DELAYED", label: "Delayed", dot: "bg-rose-500" },
  { id: "CANCELLED", label: "Cancelled", dot: "bg-slate-400" },
];

const formatLocalDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PrintingSchedule() {
  const { getRole, getUsername } = useAuth();
  const { selectedCycleId } = useAcademicCycle();
  const role = getRole();
  const isSuperAdmin = role === "ROLE_SYSTEM_ADMIN";
  const isAR = role === "ROLE_ADMIN";
  const canManageStatus = isSuperAdmin || isAR;

  const todayStr = formatLocalDate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({
    todayTotal: 0,
    todayScheduled: 0,
    todayInProgress: 0,
    todayCompleted: 0,
    totalCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [delayModal, setDelayModal] = useState(null);
  const [delayNotes, setDelayNotes] = useState("");

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (selectedDate) {
        params.fromDate = selectedDate;
        params.toDate = selectedDate;
      }
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (selectedCycleId) {
        params.cycleId = selectedCycleId;
      }
      const res = await axiosInstance.get("/printing/schedules", { params });
      setSchedules(res.data || []);
    } catch (err) {
      setError("Failed to load printing schedules.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = selectedCycleId ? { cycleId: selectedCycleId } : {};
      const res = await axiosInstance.get("/printing/stats", { params });
      setStats(res.data || {});
    } catch (err) {
      console.error("Failed to load printing stats", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchStats();
  }, [selectedDate, statusFilter, selectedCycleId]);

  const handleUpdateStatus = async (scheduleId, newStatus, customNotes = null) => {
    setActionLoading(`${scheduleId}-${newStatus}`);
    try {
      await axiosInstance.put(`/printing/schedules/${scheduleId}/status`, {
        status: newStatus,
        notes: customNotes,
      });
      setSuccessMsg(
        newStatus === "COMPLETED"
          ? "Printing marked as complete. Packet updated."
          : newStatus === "IN_PROGRESS"
          ? "Printing session started."
          : newStatus === "DELAYED"
          ? "Delay recorded and lecturer notified."
          : "Printing status updated."
      );
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchSchedules();
      fetchStats();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update printing status."
      );
    } finally {
      setActionLoading(null);
      setDelayModal(null);
      setDelayNotes("");
    }
  };

  const handleCancel = async (scheduleId) => {
    if (!confirm("Are you sure you want to cancel this printing appointment? The time slot will be immediately released.")) {
      return;
    }
    try {
      await axiosInstance.delete(`/printing/schedules/${scheduleId}`);
      setSuccessMsg("Printing appointment cancelled.");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchSchedules();
      fetchStats();
    } catch (err) {
      setError("Failed to cancel appointment.");
    }
  };

  const shiftDate = (days) => {
    const baseStr = selectedDate || todayStr;
    const parts = baseStr.split("-").map(Number);
    const dt = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
    dt.setDate(dt.getDate() + days);
    setSelectedDate(formatLocalDate(dt));
  };

  const filtered = schedules.filter((s) => {
    const matchesSearch =
      !search ||
      s.courseCode?.toLowerCase().includes(search.toLowerCase()) ||
      s.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      s.lecturerName?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.packetId).includes(search);
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Printer className="w-6 h-6 text-[#7c4dff]" />
            Exam Paper Printing Schedule
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Centralized university printing queue, time-slot allocation, and physical custody tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] text-white font-bold rounded-xl shadow-sm shadow-purple-200 transition cursor-pointer"
            title="Book a printing slot for an approved exam paper"
          >
            <Printer className="w-3.5 h-3.5" />
            + Schedule New Print
          </button>
          <button
            onClick={() => {
              fetchSchedules();
              fetchStats();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-semibold shadow-sm transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[11px] font-medium">Today's Total Prints</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.todayTotal || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7c4dff] flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[11px] font-medium">Scheduled Today</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.todayScheduled || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[11px] font-medium">In-Progress Printing</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.todayInProgress || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[11px] font-medium">Printed Today</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.todayCompleted || 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Date Navigator & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <CalendarIcon className="w-4 h-4 text-[#7c4dff]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="bg-transparent font-bold text-slate-800 text-xs outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              selectedDate === todayStr
                ? "bg-[#7c4dff] text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setSelectedDate("")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              !selectedDate
                ? "bg-[#7c4dff] text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Dates
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search course, lecturer, packet ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs outline-none text-slate-700 w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Pill Tabs Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTER_TABS.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#7c4dff] text-white shadow-sm shadow-purple-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {tab.dot && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-white" : tab.dot
                  }`}
                />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Schedule Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7c4dff]" />
            Printing Appointments Queue
            <span className="text-[11px] font-normal text-slate-400">
              ({filtered.length} {filtered.length === 1 ? "record" : "records"})
            </span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Facility: Exam Printing Center - Room 102
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-[#7c4dff]" />
            <p>Loading printing appointments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Printer className="w-8 h-8 mx-auto text-slate-300" />
            <div>
              <p className="font-semibold text-slate-600 text-sm">No printing appointments found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedDate ? `No scheduled prints on ${selectedDate}` : "Try adjusting your filters"}
              </p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] text-white font-bold rounded-xl shadow-sm transition text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Schedule Print for this Date
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Time Slot</th>
                  <th className="px-5 py-3.5">Exam Paper & Packet</th>
                  <th className="px-5 py-3.5">Lecturer</th>
                  <th className="px-5 py-3.5">Copies & Notes</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.SCHEDULED;
                  const isScheduled = item.status === "SCHEDULED";
                  const isInProgress = item.status === "IN_PROGRESS";
                  const isDelayed = item.status === "DELAYED";
                  const isCompleted = item.status === "COMPLETED";

                  return (
                    <tr key={item.scheduleId} className="hover:bg-slate-50/80 transition">
                      {/* Time Slot */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-50 text-[#7c4dff] shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{item.timeLabel}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <CalendarIcon className="w-3 h-3" />
                              {item.scheduleDate}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Course & Packet */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">
                              {item.courseCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#7c4dff] text-[10px] font-bold border border-purple-100">
                              Packet #{item.packetId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{item.courseName}</p>
                          <p className="text-[10px] text-slate-400">{item.departmentName}</p>
                        </div>
                      </td>

                      {/* Lecturer */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                            {item.lecturerName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{item.lecturerName}</p>
                            <p className="text-[10px] text-slate-400">{item.lecturerEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Copies & Notes */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#7c4dff]" />
                            {item.copies || 50} Copies
                          </span>
                          {item.notes ? (
                            <p className="text-[10px] text-slate-500 italic max-w-xs truncate" title={item.notes}>
                              "{item.notes}"
                            </p>
                          ) : (
                            <span className="text-[10px] text-slate-400">Standard print</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 w-fit ${statusInfo.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageStatus && isScheduled && (
                            <button
                              onClick={() => handleUpdateStatus(item.scheduleId, "IN_PROGRESS")}
                              disabled={actionLoading === `${item.scheduleId}-IN_PROGRESS`}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Start Printing Session"
                            >
                              <Play className="w-3 h-3" />
                              Start
                            </button>
                          )}

                          {canManageStatus && (isInProgress || isDelayed) && (
                            <button
                              onClick={() => handleUpdateStatus(item.scheduleId, "COMPLETED")}
                              disabled={actionLoading === `${item.scheduleId}-COMPLETED`}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition cursor-pointer shadow-sm"
                              title="Mark as Printed and Ready for Storage"
                            >
                              <Check className="w-3 h-3" />
                              Finish Print
                            </button>
                          )}

                          {canManageStatus && isInProgress && (
                            <button
                              onClick={() => {
                                setDelayModal(item);
                                setDelayNotes(item.notes || "");
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Report Delay / Issue"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Delay
                            </button>
                          )}

                          {(isScheduled || isDelayed) && (
                            <button
                              onClick={() => setRescheduleModal(item)}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold transition cursor-pointer"
                              title="Reschedule Slot"
                            >
                              Reschedule
                            </button>
                          )}

                          {isScheduled && (
                            <button
                              onClick={() => handleCancel(item.scheduleId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {isCompleted && (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule / Book New Print Modal */}
      {isBookModalOpen && (
        <SchedulePrintModal
          isOpen={isBookModalOpen}
          initialDate={selectedDate || todayStr}
          onClose={() => setIsBookModalOpen(false)}
          onSuccess={() => {
            setIsBookModalOpen(false);
            setSuccessMsg("Printing appointment scheduled successfully.");
            setTimeout(() => setSuccessMsg(""), 3000);
            fetchSchedules();
            fetchStats();
          }}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <SchedulePrintModal
          isOpen={!!rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          packet={{
            packetId: rescheduleModal.packetId,
            courseCode: rescheduleModal.courseCode,
            courseName: rescheduleModal.courseName,
          }}
          existingSchedule={rescheduleModal}
          onSuccess={() => {
            setSuccessMsg("Appointment successfully rescheduled.");
            setTimeout(() => setSuccessMsg(""), 3000);
            fetchSchedules();
            fetchStats();
          }}
        />
      )}

      {/* Delay Modal */}
      {delayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Report Printing Delay</h3>
                <p className="text-slate-500 text-[11px]">
                  {delayModal.courseCode} - Packet #{delayModal.packetId}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Reason / Delay Details</label>
              <textarea
                rows={3}
                value={delayNotes}
                onChange={(e) => setDelayNotes(e.target.value)}
                placeholder="e.g. Printer maintenance in progress, expected delay 45 minutes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDelayModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(delayModal.scheduleId, "DELAYED", delayNotes)
                }
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
              >
                Record Delay & Alert Lecturer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
