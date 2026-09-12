import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Layers,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { lecturerApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useAcademicCycle } from "../../context/AcademicCycleContext";
import SchedulePrintModal from "../../components/printing/SchedulePrintModal";

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Scheduled",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_PROGRESS: {
    label: "Printing Now",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  COMPLETED: {
    label: "Printed & Ready",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  DELAYED: {
    label: "Delayed",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

export default function LecturerCalendarPage() {
  const { getUsername } = useAuth();
  const { selectedCycleId } = useAcademicCycle();
  const currentLecturerId = getUsername() || "1";

  const [events, setEvents] = useState([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);
  const [deadlineError, setDeadlineError] = useState("");

  const [schedules, setSchedules] = useState([]);
  const [loadingPrintingSchedules, setLoadingPrintingSchedules] = useState(true);
  const [printingScheduleError, setPrintingScheduleError] = useState("");

  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeadlines();
    fetchPrintingSchedules();
  }, [currentLecturerId, selectedCycleId]);

  const fetchDeadlines = async () => {
    try {
      setLoadingDeadlines(true);
      setDeadlineError("");
      const response = await lecturerApi.getDeadlineCalendar(currentLecturerId);
      const backendEvents = (Array.isArray(response.data) ? response.data : []).map((item) => ({
        id: item.packetId,
        packetId: item.packetId,
        title: `${item.courseCode} - ${item.courseName}`,
        date: item.deadline,
        type: "DEADLINE",
        status: item.status,
      }));
      setEvents(backendEvents);
    } catch (err) {
      setDeadlineError("Failed to load deadlines.");
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const fetchPrintingSchedules = async () => {
    try {
      setLoadingPrintingSchedules(true);
      setPrintingScheduleError("");
      const res = await axiosInstance.get("/printing/my-schedules");
      setSchedules(res.data || []);
    } catch (err) {
      setPrintingScheduleError("Failed to load printing schedules.");
    } finally {
      setLoadingPrintingSchedules(false);
    }
  };

  const handleCancel = async (scheduleId) => {
    if (!confirm("Are you sure you want to cancel this printing appointment?")) return;
    try {
      await axiosInstance.delete(`/printing/schedules/${scheduleId}`);
      setSuccessMessage("Printing appointment cancelled.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchPrintingSchedules();
    } catch (err) {
      setError("Failed to cancel appointment.");
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Deadlines & Schedule</h1>
        <p className="text-slate-500 text-xs mt-1">
          Review paper submission deadlines and manage your exam paper printing appointments.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* Deadlines Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#7c4dff]" />
          Upcoming Submission Deadlines
        </h2>

        {loadingDeadlines ? (
          <div className="py-6 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7c4dff]" />
            <p>Loading deadlines...</p>
          </div>
        ) : deadlineError ? (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
            {deadlineError}
          </div>
        ) : events.length === 0 ? (
          <p className="text-slate-400 italic py-4 text-center">No upcoming deadlines found.</p>
        ) : (
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{evt.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Packet ID: #{evt.packetId}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-700 block text-xs">{evt.date || "N/A"}</span>
                  <span className="text-[10px] text-amber-600 font-semibold">{evt.status || "PENDING"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printing Schedules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#7c4dff]" />
              My Printing Appointments
            </h2>
            <span className="text-[11px] text-slate-400">
              {schedules.length} {schedules.length === 1 ? "appointment" : "appointments"}
            </span>
          </div>

          {loadingPrintingSchedules ? (
            <div className="py-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7c4dff]" />
              <p>Loading printing appointments...</p>
            </div>
          ) : printingScheduleError ? (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
              {printingScheduleError}
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <Printer className="w-7 h-7 mx-auto text-slate-300 mb-1" />
              <p className="font-semibold text-slate-600">No printing appointments scheduled</p>
              <p className="text-[11px] text-slate-400">
                When your exam papers are approved, you can book a printing slot here or from your packet details.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((slot) => {
                const statusInfo = STATUS_CONFIG[slot.status] || STATUS_CONFIG.SCHEDULED;
                const isScheduled = slot.status === "SCHEDULED";
                const isDelayed = slot.status === "DELAYED";

                return (
                  <div
                    key={slot.scheduleId}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-300 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-xs">
                          {slot.courseCode} - {slot.courseName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7c4dff] border border-purple-100">
                          Packet #{slot.packetId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 flex items-center gap-2 font-medium">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#7c4dff]" />
                          {slot.scheduleDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#7c4dff]" />
                          {slot.timeLabel}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {slot.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          {slot.copies || 50} Copies
                        </span>
                      </p>
                      {slot.notes && (
                        <p className="text-[10px] text-slate-500 italic">"{slot.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>

                      {(isScheduled || isDelayed) && (
                        <>
                          <button
                            onClick={() => setRescheduleItem(slot)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition cursor-pointer text-[11px]"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(slot.scheduleId)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Cancel appointment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
            <CalendarIcon className="w-3.5 h-3.5 text-[#7c4dff]" />
            Printing Center Policy
          </h3>
          <ul className="text-slate-500 space-y-2 leading-relaxed text-[11px] list-disc list-inside">
            <li>Physical printing takes place at the Central Exam Printing Facility (Room 102).</li>
            <li>Each slot is reserved for 30 minutes to prevent machine congestion and delays.</li>
            <li>Slots are strictly non-overlapping and exclusive to the booked exam paper.</li>
            <li>Please arrive promptly at your designated time window.</li>
          </ul>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <SchedulePrintModal
          isOpen={!!rescheduleItem}
          onClose={() => setRescheduleItem(null)}
          packet={{
            packetId: rescheduleItem.packetId,
            courseCode: rescheduleItem.courseCode,
            courseName: rescheduleItem.courseName,
          }}
          existingSchedule={rescheduleItem}
          onSuccess={() => {
            setSuccessMessage("Printing slot successfully rescheduled.");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchPrintingSchedules();
          }}
        />
      )}
    </div>
  );
}
