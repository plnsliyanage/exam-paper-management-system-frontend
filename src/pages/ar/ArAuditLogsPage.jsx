import React, { useEffect, useState } from 'react';
import { arApi } from '../../services/api';
import { History, FileSpreadsheet, FileText } from 'lucide-react';

export default function ArAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    arApi.getAuditLogs()
      .then((res) => setLogs(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format) => {
    try {
      const res = await arApi.generateReport('audit_logs', format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system_logs.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert(`Failed to export ${format.toUpperCase()} report.`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
          <p className="text-sm text-slate-500">Track all administrative actions, overrides, and security events</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <th className="p-4 font-semibold">Timestamp</th>
              <th className="p-4 font-semibold">User ID</th>
              <th className="p-4 font-semibold">Action</th>
              <th className="p-4 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-6 text-center text-slate-400">Loading audit logs...</td></tr>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-slate-500">{log.timestamp}</td>
                  <td className="p-4 font-medium text-slate-900">{log.userId}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-800 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="p-6 text-center text-slate-400">No activity logs recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}