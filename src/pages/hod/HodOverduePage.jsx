import React, { useState, useEffect } from 'react';
import { hodApi } from '../../services/api';
import { AlertTriangle, Clock, Mail, CheckCircle2, FileText } from 'lucide-react';

export default function HodOverduePage({ deptId = 'CS' }) {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hodApi.getOverduePackets(deptId)
      .then((res) => setOverdue(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [deptId]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overdue Task Monitoring</h1>
        <p className="text-sm text-slate-500">Track and intervene in delayed packet evaluations requiring urgent action</p>
      </div>

      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
        <div className="text-xs text-rose-900">
          <span className="font-bold block">Intervention Recommended</span>
          Packets listed below have exceeded their prescribed SLA window. Send reminders or reassign tasks directly.
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading overdue tasks...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Course</th>
                <th className="p-3.5">Current Holder</th>
                <th className="p-3.5">Days Overdue</th>
                <th className="p-3.5">Pending Action</th>
                <th className="p-3.5 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {overdue.length > 0 ? (
                overdue.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-rose-50/30">
                    <td className="p-3.5 font-bold text-slate-900">{pkt.courseCode}</td>
                    <td className="p-3.5 text-slate-800">{pkt.currentHolder || 'Unassigned'}</td>
                    <td className="p-3.5 font-bold text-rose-600">{pkt.daysOverdue || 3} Days Late</td>
                    <td className="p-3.5 text-slate-500">{pkt.pendingAction || 'Marking / Moderation'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => alert(`Reminder sent to ${pkt.currentHolder}`)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors"
                      >
                        <Mail className="w-3 h-3" /> Nudge Holder
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    No overdue packets currently requiring intervention.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}