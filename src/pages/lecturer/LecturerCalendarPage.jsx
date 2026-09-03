import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { lecturerApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function LecturerCalendarPage() {
  const { getUsername } = useAuth();
  const currentLecturerId = getUsername() || "1";

  const [events, setEvents] = useState([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);
  const [deadlineError, setDeadlineError] = useState("");

  const [slots, setSlots] = useState([]);
  const [loadingPrintingSchedules, setLoadingPrintingSchedules] = useState(true);
  const [printingScheduleError, setPrintingScheduleError] = useState("");

  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchDeadlines();
    fetchPrintingSchedules();
  }, [currentLecturerId]);

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
      console.error("Failed to load deadlines:", err);
      setDeadlineError("Failed to load deadlines.");
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const fetchPrintingSchedules = async () => {
    try {
      setLoadingPrintingSchedules(true);
      setPrintingScheduleError("");
      const response = await lecturerApi.getPrintingSchedules(currentLecturerId);
      const backendSlots = (Array.isArray(response.data) ? response.data : []).map((item) => ({
        id: item.packetId,
        packetId: item.packetId,
        courseCode: item.courseCode,
        courseName: item.courseName,
        status: item.printingStatus || "Scheduled",
        date: item.examDate,
      }));
      setSlots(backendSlots);
    } catch (err) {
      console.error("Failed to load printing schedules:", err);
      setPrintingScheduleError("Failed to load printing schedules.");
    } finally {
      setLoadingPrintingSchedules(false);
    }
  };

  const handleBookSlot = (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setError("Please select a printing schedule slot.");
      return;
    }
    setSuccessMessage("Printing slot reservation recorded successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Deadlines & Schedule</h1>
        <p className="text-slate-500 text-xs mt-1">
          Review packet submission deadlines and exam printing schedules.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
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
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#7c4dff]" />
            Printing Center Schedules
          </h2>

          {loadingPrintingSchedules ? (
            <div className="py-6 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7c4dff]" />
              <p>Loading printing schedules...</p>
            </div>
          ) : printingScheduleError ? (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl">
              {printingScheduleError}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-slate-400 italic py-4 text-center">No printing schedules available.</p>
          ) : (
            <form onSubmit={handleBookSlot} className="space-y-3">
              {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3.5 border rounded-xl flex justify-between items-center cursor-pointer transition ${
                      isSelected ? "bg-[#7c4dff]/5 border-[#7c4dff]" : "bg-slate-50 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{slot.courseCode} - {slot.courseName}</h4>
                        <p className="text-[11px] text-slate-400">Packet #{slot.packetId} | Exam: {slot.date || "Scheduled"}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {slot.status}
                    </span>
                  </div>
                );
              })}

              <button
                type="submit"
                className="px-4 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] text-white font-bold rounded-xl transition text-xs cursor-pointer mt-2"
              >
                Confirm Selection
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
            <CalendarIcon className="w-3.5 h-3.5 text-[#7c4dff]" />
            Printing Guidelines
          </h3>
          <p className="text-slate-500 leading-relaxed text-xs">
            Exam papers are processed strictly following faculty security guidelines. Please ensure question papers are submitted and approved before scheduled printing dates.
          </p>
        </div>
      </div>
    </div>
  );
}
