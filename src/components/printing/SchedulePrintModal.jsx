import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Printer,
  AlertCircle,
  CheckCircle2,
  X,
  MapPin,
  Layers,
  FileText,
  Loader2,
  Lock,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const DEFAULT_LOCATION = "Exam Printing Center - Room 102";

const formatLocalDate = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getUpcomingDays = (count = 6) => {
  const days = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(base.getDate() + i);
    const dateStr = formatLocalDate(d);
    const dayLabel =
      i === 0
        ? "Today"
        : i === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days.push({ dateStr, label: dayLabel, isToday: i === 0 });
  }
  return days;
};

export default function SchedulePrintModal({
  isOpen,
  onClose,
  packet = null,
  initialDate = null,
  existingSchedule = null,
  onSuccess,
}) {
  const isReschedule = !!existingSchedule;
  const todayDateStr = formatLocalDate(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = initialDate
    ? initialDate
    : isReschedule && existingSchedule?.scheduleDate
    ? existingSchedule.scheduleDate
    : formatLocalDate(tomorrow);

  const [date, setDate] = useState(defaultDate);
  const location = existingSchedule?.location || DEFAULT_LOCATION;
  const [copies, setCopies] = useState(existingSchedule?.copies || 50);
  const [notes, setNotes] = useState(existingSchedule?.notes || "");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");

  // Support packet selection if not pre-passed
  const [approvedPackets, setApprovedPackets] = useState([]);
  const [selectedPacket, setSelectedPacket] = useState(packet);
  const [loadingPackets, setLoadingPackets] = useState(false);

  const upcomingDays = getUpcomingDays(6);

  useEffect(() => {
    if (isOpen) {
      if (packet) {
        setSelectedPacket(packet);
      } else if (!isReschedule) {
        fetchApprovedPackets();
      }

      if (existingSchedule) {
        setDate(existingSchedule.scheduleDate || defaultDate);
        setCopies(existingSchedule.copies || 50);
        setNotes(existingSchedule.notes || "");
        setSelectedSlot({
          startTime: existingSchedule.startTime,
          endTime: existingSchedule.endTime,
          timeLabel: existingSchedule.timeLabel,
        });
      } else {
        setDate(initialDate || defaultDate);
        setCopies(50);
        setNotes("");
        setSelectedSlot(null);
      }
      setError("");
      setConflictMessage("");
    }
  }, [isOpen, packet, existingSchedule, initialDate]);

  useEffect(() => {
    if (isOpen && date) {
      fetchAvailableSlots();
    }
  }, [isOpen, date, location]);

  const fetchApprovedPackets = async () => {
    try {
      setLoadingPackets(true);
      const res = await axiosInstance.get("/packets");
      const list = Array.isArray(res.data) ? res.data : [];
      const eligible = list.filter(
        (p) => p.status === "APPROVED" || p.status === "PRINTING" || p.status === "PRINTING_QUEUE"
      );
      setApprovedPackets(eligible);
      if (eligible.length > 0 && !selectedPacket) {
        setSelectedPacket(eligible[0]);
      }
    } catch (err) {
      console.error("Failed to load approved packets", err);
    } finally {
      setLoadingPackets(false);
    }
  };

const generateDefaultSlots = () => {
  const defaultTimes = [
    { start: "08:30", end: "09:00", label: "08:30 AM - 09:00 AM" },
    { start: "09:00", end: "09:30", label: "09:00 AM - 09:30 AM" },
    { start: "09:30", end: "10:00", label: "09:30 AM - 10:00 AM" },
    { start: "10:00", end: "10:30", label: "10:00 AM - 10:30 AM" },
    { start: "10:30", end: "11:00", label: "10:30 AM - 11:00 AM" },
    { start: "11:00", end: "11:30", label: "11:00 AM - 11:30 AM" },
    { start: "11:30", end: "12:00", label: "11:30 AM - 12:00 PM" },
    { start: "12:00", end: "12:30", label: "12:00 PM - 12:30 PM" },
    { start: "12:30", end: "13:00", label: "12:30 PM - 01:00 PM" },
    { start: "13:00", end: "13:30", label: "01:00 PM - 01:30 PM" },
    { start: "13:30", end: "14:00", label: "01:30 PM - 02:00 PM" },
    { start: "14:00", end: "14:30", label: "02:00 PM - 02:30 PM" },
    { start: "14:30", end: "15:00", label: "02:30 PM - 03:00 PM" },
    { start: "15:00", end: "15:30", label: "03:00 PM - 03:30 PM" },
    { start: "15:30", end: "16:00", label: "03:30 PM - 04:00 PM" },
    { start: "16:00", end: "16:30", label: "04:00 PM - 04:30 PM" },
  ];
  return defaultTimes.map((t) => ({
    startTime: t.start,
    endTime: t.end,
    timeLabel: t.label,
    isAvailable: true,
    available: true,
  }));
};

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setError("");
      setConflictMessage("");
      const res = await axiosInstance.get("/printing/slots/available", {
        params: { date, location },
      });
      const data =
        Array.isArray(res.data) && res.data.length > 0 ? res.data : generateDefaultSlots();
      setSlots(data);

      // If rescheduling, check if the currently selected slot is the existing one
      if (isReschedule && existingSchedule) {
        const found = data.find(
          (s) =>
            String(s.startTime).substring(0, 5) ===
              String(existingSchedule.startTime).substring(0, 5) ||
            s.timeLabel === existingSchedule.timeLabel
        );
        if (found) {
          setSelectedSlot(found);
        }
      }
    } catch (err) {
      console.warn("Using fallback default slots:", err);
      setSlots(generateDefaultSlots());
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const activePacket = selectedPacket || packet;
    if (!activePacket && !isReschedule) {
      setError("Please select an approved exam paper to print.");
      return;
    }
    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    setSubmitting(true);
    setError("");
    setConflictMessage("");

    try {
      if (isReschedule) {
        const payload = {
          scheduleDate: date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          location,
          copies: parseInt(copies, 10) || 50,
          notes,
        };
        const res = await axiosInstance.put(
          `/printing/schedules/${existingSchedule.scheduleId}/reschedule`,
          payload
        );
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        const rawPacketId = activePacket?.id ?? activePacket?.packetId;
        let numericPacketId = rawPacketId;
        if (typeof rawPacketId === "string") {
          if (rawPacketId.includes("-")) {
            const parts = rawPacketId.split("-");
            numericPacketId = parseInt(parts[parts.length - 1], 10);
          } else {
            numericPacketId = parseInt(rawPacketId, 10);
          }
        }

        const payload = {
          packetId: numericPacketId || rawPacketId,
          scheduleDate: date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          location,
          copies: parseInt(copies, 10) || 50,
          notes,
        };
        const res = await axiosInstance.post("/printing/book", payload);
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to schedule printing appointment.";
      if (status === 409) {
        setConflictMessage(msg);
        fetchAvailableSlots(); // Refresh slots to show newly booked state
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentActivePacket = selectedPacket || packet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#7c4dff]/10 via-purple-50 to-indigo-50 border-b border-purple-100 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#7c4dff] text-white rounded-2xl shadow-md shadow-purple-200">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isReschedule
                  ? "Reschedule Printing Appointment"
                  : "Book Exam Paper Printing Slot"}
              </h2>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {currentActivePacket?.courseCode
                  ? `${currentActivePacket.courseCode} - ${currentActivePacket.courseName}`
                  : "Select a date and 30-minute time slot at the printing center"}
                {currentActivePacket?.packetId ? ` (Packet #${currentActivePacket.packetId})` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/80 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirm} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Conflict Banner */}
          {conflictMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold text-xs">Slot Booking Conflict</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{conflictMessage}</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {error && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Packet Picker if opened standalone */}
          {!packet && !isReschedule && (
            <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#7c4dff]" />
                Select Exam Paper to Print
              </label>
              {loadingPackets ? (
                <div className="py-2 text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7c4dff]" />
                  <span>Loading approved exam papers...</span>
                </div>
              ) : approvedPackets.length === 0 ? (
                <p className="text-amber-700 text-[11px] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  No approved packets found currently waiting for printing.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pt-1">
                  {approvedPackets.map((p) => {
                    const isPicked =
                      (selectedPacket?.packetId || selectedPacket?.id) === (p.packetId || p.id);
                    return (
                      <div
                        key={p.packetId || p.id}
                        onClick={() => setSelectedPacket(p)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isPicked
                            ? "bg-purple-50 border-[#7c4dff] text-[#7c4dff] font-bold shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{p.courseCode}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[170px]">{p.courseName}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                          #{p.packetId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Date & Fixed Designated Facility */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#7c4dff]" />
                Select Printing Date
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Active Date: <span className="font-bold text-[#7c4dff]">{date}</span>
              </span>
            </div>

            {/* Quick Date Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {upcomingDays.map((d) => {
                const isSelected = date === d.dateStr;
                return (
                  <button
                    type="button"
                    key={d.dateStr}
                    onClick={() => {
                      setDate(d.dateStr);
                      setSelectedSlot(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] transition cursor-pointer ${
                      isSelected
                        ? "bg-[#7c4dff] text-white shadow-sm shadow-purple-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500">
                  Or Pick Custom Date
                </label>
                <input
                  type="date"
                  min={todayDateStr}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]/20 focus:border-[#7c4dff] transition cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500">
                  Designated Printing Facility
                </label>
                <div className="w-full bg-purple-50/60 border border-purple-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{DEFAULT_LOCATION}</p>
                    <p className="text-[10px] text-[#7c4dff] font-medium">Centralized Secure Facility</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#7c4dff] text-white text-[10px] font-bold">
                    Official
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Time Slot Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7c4dff]" />
                Choose a 30-Minute Time Slot
              </label>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c4dff]"></span> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Booked
                </span>
              </div>
            </div>

            {loadingSlots ? (
              <div className="py-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#7c4dff]" />
                <span>Checking available slots...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-400">
                No slots found for this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {slots.map((slot, idx) => {
                  const isBooked =
                    !!slot.bookedScheduleId ||
                    slot.isAvailable === false ||
                    slot.available === false;

                  const isMyExistingSlot =
                    isReschedule &&
                    existingSchedule &&
                    (existingSchedule.scheduleId === slot.bookedScheduleId ||
                      String(existingSchedule.startTime).substring(0, 5) ===
                        String(slot.startTime).substring(0, 5));

                  const isAvailable =
                    !isBooked ||
                    isMyExistingSlot ||
                    slot.isAvailable === true ||
                    slot.available === true;

                  const canSelect = isAvailable || isMyExistingSlot;

                  const isSelected =
                    selectedSlot &&
                    (selectedSlot.timeLabel === slot.timeLabel ||
                      (selectedSlot.startTime &&
                        slot.startTime &&
                        String(selectedSlot.startTime).substring(0, 5) ===
                          String(slot.startTime).substring(0, 5)));

                  return (
                    <button
                      type="button"
                      key={idx}
                      disabled={!canSelect}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-[#7c4dff] text-white border-[#7c4dff] shadow-md shadow-purple-200 ring-2 ring-purple-300"
                          : canSelect
                          ? "bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer"
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                      }`}
                      title={
                        !canSelect
                          ? `Already reserved for ${slot.bookedCourseCode || "another exam paper"}`
                          : slot.timeLabel
                      }
                    >
                      <div className="flex items-center gap-1 text-[11px]">
                        {!canSelect && <Lock className="w-3 h-3 text-slate-400" />}
                        <span>{slot.timeLabel?.split(" - ")[0] || slot.startTime}</span>
                      </div>
                      <span className="text-[10px] opacity-80">
                        to {slot.timeLabel?.split(" - ")[1] || slot.endTime}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Print Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7c4dff]" />
                Number of Copies
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
                placeholder="e.g. 120"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]/20 focus:border-[#7c4dff] transition"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7c4dff]" />
                Special Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Double-sided, staple top left corner"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c4dff]/20 focus:border-[#7c4dff] transition"
              />
            </div>
          </div>

          {/* Selected Summary Card */}
          {selectedSlot && (
            <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7c4dff]/10 flex items-center justify-center text-[#7c4dff]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-xs">
                    {date} • {selectedSlot.timeLabel}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {location} • {copies} Copies
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                Ready to Book
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSlot || submitting}
              className="px-5 py-2.5 bg-[#7c4dff] hover:bg-[#6c3de8] disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>
                    {isReschedule ? "Confirm Reschedule" : "Confirm Booking"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
