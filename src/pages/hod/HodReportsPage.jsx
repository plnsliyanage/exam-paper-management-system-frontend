import React, { useState } from 'react';
import { hodApi } from '../../services/api';
import { FileSpreadsheet, FileText, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function HodReportsPage({ deptId = 'CS' }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = (type) => {
    setExporting(true);
    const action = type === 'excel' ? hodApi.exportExcel(deptId) : hodApi.exportPdf(deptId);
    
    action
      .then(() => alert(`Department ${type.toUpperCase()} Report generated successfully.`))
      .catch(() => alert(`Exported mock ${type.toUpperCase()} file.`))
      .finally(() => setExporting(false));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Generate evaluation progress, delay summaries, and export faculty data</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3.5 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <span className="text-slate-500 font-semibold block">Average Marking Velocity</span>
          <span className="text-2xl font-bold text-slate-900">4.2 Days</span>
          <p className="text-emerald-600 font-medium">↑ 12% faster than previous cycle</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <span className="text-slate-500 font-semibold block">Overall Moderation Pass Rate</span>
          <span className="text-2xl font-bold text-slate-900">96.4%</span>
          <p className="text-slate-500">Based on active semester packets</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
          <span className="text-slate-500 font-semibold block">Identified Bottlenecks</span>
          <span className="text-2xl font-bold text-amber-600">2 Stages</span>
          <p className="text-amber-700 font-medium">Moderator Review & Final Signoff</p>
        </div>
      </div>
    </div>
  );
}