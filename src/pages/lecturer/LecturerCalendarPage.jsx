import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Initial schedule slots provided by the office
const INITIAL_PRINTING_SLOTS = [
  {
    id: "SLOT-01",
    date: "2026-06-01",
    time: "09:00 AM - 11:00 AM",
    status: "AVAILABLE",
    bookedBy: null,
  },
  {
    id: "SLOT-02",
    date: "2026-06-01",
    time: "01:00 PM - 03:00 PM",
    status: "AVAILABLE",
    bookedBy: null,
  },
  {
    id: "SLOT-03",
    date: "2026-06-02",
    time: "09:00 AM - 11:00 AM",
    status: "AVAILABLE",
    bookedBy: null,
  },
  {
    id: "SLOT-04",
    date: "2026-06-03",
    time: "10:00 AM - 12:00 PM",
    status: "AVAILABLE",
    bookedBy: null,
  },
];

export default function LecturerCalendarPage() {
  const [events] = useState([
    {
      id: 1,
      title: "CS1022 Exam Paper Printing",
      date: "2026-06-01",
      type: "PRINTING",
      time: "09:00 AM",
    },
    {
      id: 2,
      title: "CS1022 Marking Submission Deadline",
      date: "2026-06-15",
      type: "DEADLINE",
      time: "11:59 PM",
    },
    {
      id: 3,
      title: "CS2032 Review & Marks Entry Deadline",
      date: "2026-06-20",
      type: "DEADLINE",
      time: "05:00 PM",
    },
  ]);

  const [slots, setSlots] = useState(INITIAL_PRINTING_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentLecturer = "Dr. John Doe";

  const handleBookSlot = (e) => {
    e.preventDefault();
    if (!selectedSlotId) {
      setError("Please select an available time slot.");
      return;
    }
    if (!courseCode.trim()) {
      setError("Please enter your course code (e.g., CS1022).");
      return;
    }

    setSlots(
      slots.map((slot) => {
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
      `Successfully booked slot for ${courseCode.trim().toUpperCase()}!`,
    );
    setError("");
    setSelectedSlotId(null);
    setCourseCode("");
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Academic Calendar & Schedules
        </h1>
        <p className="text-sm text-slate-500">
          Track key evaluation deadlines and select available office printing
          schedules.
        </p>
      </header>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" /> {successMessage}
        </div>
      )}

      {/* Part 1: Deadlines Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-600" /> Upcoming Deadlines
          & Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${ev.type === "PRINTING" ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-600"}`}
                >
                  {ev.type === "PRINTING" ? (
                    <Printer className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {ev.title}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Date: {ev.date} at {ev.time}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ev.type === "PRINTING" ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700"}`}
              >
                {ev.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Printing Schedule Slot Booking Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-600" /> Office-Provided
            Printing Schedule
          </h3>
          <p className="text-slate-500">
            Choose an open printing slot below. Once a slot is reserved by any
            lecturer, it becomes unavailable for others.
          </p>

          <form onSubmit={handleBookSlot} className="space-y-4 pt-2">
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

            {error && (
              <p className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}

            <div className="space-y-3">
              {slots.map((slot) => {
                const isBooked = slot.status === "BOOKED";
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
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${isBooked ? "bg-slate-200 text-slate-500" : "bg-amber-50 text-amber-600"}`}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {slot.date} ({slot.time})
                        </h4>
                        <p className="text-slate-400 text-xs">
                          {isBooked
                            ? `Reserved by ${slot.bookedBy} (${slot.courseCode})`
                            : "Available Printing Session"}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isBooked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          BOOKED
                        </span>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer">
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
                            Select Slot
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Confirm & Book Selected Slot
            </button>
          </form>
        </div>

        {/* Rules & Info Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-600" /> Printing
            Guidelines
          </h3>
          <p className="text-slate-500 leading-relaxed">
            Printing center operations run strictly according to office
            schedules. Once you select an available slot, it becomes immediately
            locked to prevent overlapping bookings from other lecturers.
          </p>
        </div>
      </div>
    </div>
  );
}
