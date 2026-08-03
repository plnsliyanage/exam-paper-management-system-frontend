import React, { useEffect, useState } from 'react';
import { hodApi } from '../../services/api';
import { BarChart3, AlertTriangle, Users } from 'lucide-react';

export default function HodWorkloadPage({ deptId = 'CS' }) {
  const [workloads, setWorkloads] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      hodApi.getWorkload(deptId),
      hodApi.getOverduePackets(deptId)
    ])
      .then(([workRes, overRes]) => {
        setWorkloads(workRes.data || []);
        setOverdue(overRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [deptId]);

  if (loading) return <div className="p-8 text-slate-400">Loading department analytics...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Workload & Staff Performance</h1>
        <p className="text-sm text-slate-500">Monitor lecturer packet assignments, progress metrics, and delay bottlenecks</p>
      </div>

      {/* Overdue Items Alert Panel */}
      {overdue.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Overdue Packets Requiring Intervention ({overdue.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {overdue.map((pkt) => (
              <div key={pkt.id} className="p-3 bg-white rounded border border-rose-200 text-xs">
                <span className="font-bold text-slate-900 block">{pkt.courseCode}</span>
                <span className="text-slate-500">Holder: {pkt.currentHolder || 'Unassigned'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Workload Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600" /> Lecturer Workload Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workloads.length > 0 ? (
            workloads.map((staff, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 text-sm">{staff.lecturerName}</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {staff.assignedPacketsCount} Packets
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Scripts Assigned:</span>
                    <span className="font-semibold text-slate-900">{staff.totalScripts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marked Progress:</span>
                    <span className="font-semibold text-emerald-600">{staff.completedScripts || 0}</span>
                  </div>
                </div>

                {/* Simple Bar Visualizer */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-brand-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${staff.totalScripts ? Math.min(100, (staff.completedScripts / staff.totalScripts) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No workload records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}