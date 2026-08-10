import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, Printer } from "lucide-react";

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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Academic Calendar & Schedules
        </h1>
        <p className="text-sm text-slate-500">
          Track key evaluation deadlines, milestones, and printing schedules.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-600" /> Upcoming
            Deadlines & Printing Sessions
          </h3>
          <div className="space-y-3">
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

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800">Printing Schedule Rule</h3>
          <p className="text-slate-500 leading-relaxed">
            Printing center operations run 2 weeks prior to exam deadlines.
            Ensure paper packets are submitted to the department head on time.
          </p>
        </div>
      </div>
    </div>
  );
}
