import React, { useEffect, useState } from 'react';
import { arApi } from '../../services/api';
import { Printer, UserCheck, AlertOctagon, CheckCircle } from 'lucide-react';

export default function ArOverview() {
  const [overview, setOverview] = useState(null);
  const [printingSchedules, setPrintingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([arApi.getOverview(), arApi.getPrintingSchedules()])
      .then(([overviewRes, schedulesRes]) => {
        setOverview(overviewRes.data);
        setPrintingSchedules(schedulesRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading AR Management Console...</div>;

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Assistant Registrar Console</h1>
        <p className="text-sm text-slate-500">Faculty-wide scheduling, assignment overrides, and printing dispatch</p>
      </header>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase">Total Packets</span>
            <p className="text-3xl font-bold text-slate-900 mt-1">{overview?.totalPackets || 0}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-blue-500" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase">Approved for Printing</span>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{overview?.approvedForPrinting || 0}</p>
          </div>
          <Printer className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase">Action Required</span>
            <p className="text-3xl font-bold text-rose-600 mt-1">{overview?.attentionNeededCount || 0}</p>
          </div>
          <AlertOctagon className="w-8 h-8 text-rose-500" />
        </div>
      </div>

      {/* Scheduled Printing Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Active Printing Schedules</h2>
        <div className="space-y-3">
          {printingSchedules.length > 0 ? (
            printingSchedules.map((schedule) => (
              <div key={schedule.id} className="p-4 border border-slate-100 bg-slate-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">{schedule.packetCode} - {schedule.courseName}</p>
                  <p className="text-xs text-slate-500">Scheduled Time Slot: {schedule.scheduledSlot}</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800">
                  {schedule.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm">No printing tasks currently scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}