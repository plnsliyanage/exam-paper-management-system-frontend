import React, { useEffect, useState } from 'react';
import { lecturerApi } from '../../services/api';
import { Calendar as CalendarIcon, Printer, Clock } from 'lucide-react';

export default function LecturerCalendarPage({ lecturerId = 'LEC001' }) {
  const [deadlines, setDeadlines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      lecturerApi.getDeadlineCalendar(lecturerId),
      lecturerApi.getPrintingSchedules(lecturerId)
    ])
      .then(([deadRes, schedRes]) => {
        setDeadlines(deadRes.data || []);
        setSchedules(schedRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [lecturerId]);

  if (loading) return <div className="p-8 text-slate-400">Loading schedules...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schedules & Deadlines</h1>
        <p className="text-sm text-slate-500">View upcoming packet deadlines and allocated printing time slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Academic Deadlines Timeline */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-slate-800">Key Deadlines</h2>
          </div>

          <div className="space-y-3">
            {deadlines.length > 0 ? (
              deadlines.map((d, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {d.courseCode}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{d.taskName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 block">{d.deadlineDate}</span>
                    <span className="text-[11px] text-slate-400">{d.daysRemaining} days left</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No active deadlines recorded.</p>
            )}
          </div>
        </div>

        {/* Printing Schedules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
            <Printer className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800">Printing Slots</h2>
          </div>

          <div className="space-y-3">
            {schedules.length > 0 ? (
              schedules.map((s, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.courseCode} - {s.courseName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Slot: {s.scheduledTimeSlot}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                    {s.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No scheduled printing activities.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}