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

export default function LecturerCalendarPage() {
  // ============================================================
  // CURRENT LECTURER
  // ============================================================

  const currentLecturerId = "U1";

  // ============================================================
  // DEADLINES FROM BACKEND
  // ============================================================

  const [events, setEvents] = useState([]);

  const [loadingDeadlines, setLoadingDeadlines] = useState(true);

  const [deadlineError, setDeadlineError] = useState("");

  // ============================================================
  // PRINTING SCHEDULES FROM BACKEND
  // ============================================================

  const [slots, setSlots] = useState([]);

  const [loadingPrintingSchedules, setLoadingPrintingSchedules] =
    useState(true);

  const [printingScheduleError, setPrintingScheduleError] = useState("");

  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const [courseCode, setCourseCode] = useState("");

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const currentLecturer = "Dr. John Doe";

  // ============================================================
  // LOAD DEADLINES FROM BACKEND
  // ============================================================

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        setLoadingDeadlines(true);

        setDeadlineError("");

        console.log("Loading deadlines for lecturer:", currentLecturerId);

        const response =
          await lecturerApi.getDeadlineCalendar(currentLecturerId);

        console.log("Backend deadline response:", response.data);

        const backendEvents = response.data.map((item) => ({
          id: item.packetId,

          packetId: item.packetId,

          title: `${item.courseCode} - ${item.courseName}`,

          date: item.deadline,

          type: "DEADLINE",

          time: "Deadline",

          courseCode: item.courseCode,

          courseName: item.courseName,

          status: item.status,
        }));

        setEvents(backendEvents);
      } catch (err) {
        console.error("Error loading deadlines:", err);

        setDeadlineError("Unable to load deadlines from the server.");

        setEvents([]);
      } finally {
        setLoadingDeadlines(false);
      }
    };

    fetchDeadlines();
  }, []);

  // ============================================================
  // LOAD PRINTING SCHEDULES FROM BACKEND
  // ============================================================

  useEffect(() => {
    const fetchPrintingSchedules = async () => {
      try {
        setLoadingPrintingSchedules(true);

        setPrintingScheduleError("");

        console.log(
          "Loading printing schedules for lecturer:",
          currentLecturerId,
        );

        const response =
          await lecturerApi.getPrintingSchedules(currentLecturerId);

        console.log("Backend printing schedules response:", response.data);

        if (!Array.isArray(response.data)) {
          setSlots([]);

          return;
        }

        // ======================================================
        // CONVERT BACKEND DATA TO FRONTEND SLOT FORMAT
        // ======================================================

        const backendSlots = response.data.map((item, index) => {
          const backendStatus = item.status
            ? item.status.toUpperCase()
            : "AVAILABLE";

          return {
            // Create unique frontend ID
            id: `${item.packetId}-${index}`,

            packetId: item.packetId,

            courseCode: item.courseCode,

            courseName: item.courseName,

            // Your current DTO gives deadline,
            // so use it as the displayed schedule date.
            date: item.deadline || "Date not available",

            // Current DTO does not contain a time.
            time: "Printing Schedule",

            status: backendStatus,

            bookedBy: backendStatus === "BOOKED" ? "Reserved" : null,
          };
        });

        setSlots(backendSlots);
      } catch (err) {
        console.error("Error loading printing schedules:", err);

        setPrintingScheduleError(
          "Unable to load printing schedules from the server.",
        );

        setSlots([]);
      } finally {
        setLoadingPrintingSchedules(false);
      }
    };

    fetchPrintingSchedules();
  }, []);

  // ============================================================
  // BOOK PRINTING SLOT
  // ============================================================

  const handleBookSlot = (e) => {
    e.preventDefault();

    setError("");

    setSuccessMessage("");

    if (!selectedSlotId) {
      setError("Please select an available printing schedule.");

      return;
    }

    if (!courseCode.trim()) {
      setError("Please enter your course code (e.g. CS1022).");

      return;
    }

    setSlots((previousSlots) =>
      previousSlots.map((slot) => {
        if (slot.id === selectedSlotId) {
          return {
            ...slot,

            status: "BOOKED",

            bookedBy: currentLecturer,

            courseCode: courseCode.trim().toUpperCase(),
          };
        }

        return slot;
      }),
    );

    setSuccessMessage(
      `Successfully booked printing schedule for ${courseCode
        .trim()
        .toUpperCase()}!`,
    );

    setSelectedSlotId(null);

    setCourseCode("");
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "No deadline";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============================================================
  // DEADLINE STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    if (status && status.toUpperCase() === "COMPLETED") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status && status.toUpperCase() === "OVERDUE") {
      return "bg-rose-100 text-rose-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  // ============================================================
  // PRINTING STATUS STYLE
  // ============================================================

  const getPrintingStatusStyle = (status) => {
    if (status === "BOOKED" || status === "RESERVED") {
      return "bg-slate-200 text-slate-600";
    }

    if (status === "COMPLETED") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "CANCELLED") {
      return "bg-rose-100 text-rose-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Academic Calendar & Schedules
        </h1>

        <p className="text-sm text-slate-500">
          Track key evaluation deadlines and select available office printing
          schedules.
        </p>
      </header>

      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />

          {successMessage}
        </div>
      )}

      {/* ======================================================
          UPCOMING DEADLINES
          DATA COMES FROM BACKEND
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-600" />
          Upcoming Deadlines & Events
        </h3>

        {/* LOADING */}

        {loadingDeadlines && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />

            <p>Loading deadlines...</p>
          </div>
        )}

        {/* ERROR */}

        {!loadingDeadlines && deadlineError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />

            {deadlineError}
          </div>
        )}

        {/* NO DEADLINES */}

        {!loadingDeadlines && !deadlineError && events.length === 0 && (
          <div className="py-10 text-center">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />

            <p className="font-medium text-slate-500">
              No upcoming deadlines found.
            </p>
          </div>
        )}

        {/* BACKEND DEADLINES */}

        {!loadingDeadlines && !deadlineError && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-start"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                    <Clock className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {event.courseCode}
                    </h4>

                    <p className="text-slate-500 text-xs mt-1">
                      {event.courseName}
                    </p>

                    <p className="text-slate-400 text-xs mt-2">
                      Deadline:{" "}
                      <span className="font-medium text-slate-600">
                        {formatDate(event.date)}
                      </span>
                    </p>

                    <p className="text-slate-400 text-xs mt-1">
                      Packet:{" "}
                      <span className="font-medium text-slate-600">
                        {event.packetId}
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusStyle(
                    event.status,
                  )}`}
                >
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================
          PRINTING SCHEDULE
          CONNECTED TO BACKEND
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ==================================================
            PRINTING SLOTS
        ================================================== */}

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-600" />
            Office-Provided Printing Schedule
          </h3>

          <p className="text-slate-500">
            Printing schedules assigned to your packets are loaded from the
            backend.
          </p>

          {/* ==================================================
              LOADING PRINTING SCHEDULES
          ================================================== */}

          {loadingPrintingSchedules && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />

              <p>Loading printing schedules...</p>
            </div>
          )}

          {/* ==================================================
              PRINTING ERROR
          ================================================== */}

          {!loadingPrintingSchedules && printingScheduleError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />

              {printingScheduleError}
            </div>
          )}

          <form onSubmit={handleBookSlot} className="space-y-4 pt-2">
            {/* ==================================================
                COURSE CODE
            ================================================== */}

            {!loadingPrintingSchedules &&
              !printingScheduleError &&
              slots.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enter Course Code for Reservation:
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. CS1022"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                  />
                </div>
              )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <p className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />

                {error}
              </p>
            )}

            {/* ==================================================
                PRINTING SCHEDULES
            ================================================== */}

            {!loadingPrintingSchedules &&
              !printingScheduleError &&
              slots.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <Printer className="w-8 h-8 mx-auto mb-2 text-slate-300" />

                  <p>No printing schedules available.</p>
                </div>
              )}

            {!loadingPrintingSchedules &&
              !printingScheduleError &&
              slots.length > 0 && (
                <div className="space-y-3">
                  {slots.map((slot) => {
                    const isBooked =
                      slot.status === "BOOKED" || slot.status === "RESERVED";

                    const isSelected = selectedSlotId === slot.id;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (!isBooked) {
                            setSelectedSlotId(slot.id);

                            setError("");
                          }
                        }}
                        className={`p-4 border rounded-xl flex justify-between items-center transition-all ${
                          isBooked
                            ? "bg-slate-100 border-slate-200 opacity-75 cursor-not-allowed"
                            : isSelected
                              ? "bg-brand-50 border-brand-500 shadow-sm cursor-pointer"
                              : "bg-slate-50 border-slate-100 hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        {/* SLOT INFORMATION */}

                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl ${
                              isBooked
                                ? "bg-slate-200 text-slate-500"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            <Clock className="w-5 h-5" />
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              {slot.courseCode}
                            </h4>

                            <p className="text-slate-500 text-xs mt-1">
                              {slot.courseName}
                            </p>

                            <p className="text-slate-400 text-xs mt-1">
                              Packet:{" "}
                              <span className="font-medium text-slate-600">
                                {slot.packetId}
                              </span>
                            </p>

                            <p className="text-slate-400 text-xs mt-1">
                              Date:{" "}
                              <span className="font-medium text-slate-600">
                                {formatDate(slot.date)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* SLOT STATUS */}

                        <div>
                          {isBooked ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getPrintingStatusStyle(
                                slot.status,
                              )}`}
                            >
                              {slot.status}
                            </span>
                          ) : (
                            <label
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="radio"
                                name="printingSlot"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedSlotId(slot.id);

                                  setError("");
                                }}
                                className="accent-brand-600 cursor-pointer"
                              />

                              <span className="font-bold text-slate-700">
                                Select Schedule
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* ==================================================
                BOOK
            ================================================== */}

            {!loadingPrintingSchedules &&
              !printingScheduleError &&
              slots.length > 0 && (
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Confirm & Book Selected Schedule
                </button>
              )}
          </form>
        </div>

        {/* ==================================================
            GUIDELINES
        ================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-600" />
            Printing Guidelines
          </h3>

          <p className="text-slate-500 leading-relaxed">
            Printing center operations run strictly according to office
            schedules. Once you select an available schedule, it becomes
            immediately locked in this page to prevent overlapping bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
