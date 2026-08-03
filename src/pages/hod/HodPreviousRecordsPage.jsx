import React, { useState, useEffect } from 'react';
import { hodApi } from '../../services/api';
import { History, Search, Download } from 'lucide-react';

export default function HodPreviousRecordsPage({ deptId = 'CS' }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hodApi.getPreviousRecords(deptId)
      .then((res) => setRecords(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [deptId]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Previous Academic Records</h1>
        <p className="text-sm text-slate-500">Historical archive of department exam packet lifecycles and moderation logs</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">Archived Cycles</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading historical records...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Academic Cycle</th>
                <th className="p-3.5">Total Packets Completed</th>
                <th className="p-3.5">Completion Rate</th>
                <th className="p-3.5 text-right">Archived Audit Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(records.length > 0 ? records : [
                { cycle: '2025 / Semester 2', count: 24, rate: '100%' },
                { cycle: '2025 / Semester 1', count: 22, rate: '98%' }
              ]).map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{rec.cycle}</td>
                  <td className="p-3.5">{rec.count} Packets</td>
                  <td className="p-3.5 text-emerald-600 font-semibold">{rec.rate}</td>
                  <td className="p-3.5 text-right">
                    <button className="text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Download PDF Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}