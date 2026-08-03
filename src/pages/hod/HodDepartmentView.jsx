import React, { useEffect, useState } from 'react';
import { hodApi } from '../../services/api';
import { Download, Search, FileSpreadsheet, PieChart, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function HodDepartmentView({ deptId = 'CS' }) {
  const [packets, setPackets] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPacket, setSelectedPacket] = useState(null); // For history/comment modal

  const fetchPackets = () => {
    setLoading(true);
    hodApi.searchPackets(deptId, { query, status })
      .then((res) => setPackets(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackets();
  }, [deptId]);

  // Compute stats for visual graph bars
  const totalPackets = packets.length;
  const statusCounts = packets.reduce((acc, pkt) => {
    acc[pkt.status] = (acc[pkt.status] || 0) + 1;
    return acc;
  }, {});

  const handleExportPdf = async () => {
    try {
      const res = await hodApi.exportPdf(deptId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Department_Report_${deptId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('PDF Export failed', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await hodApi.exportExcel(deptId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Department_Report_${deptId}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Excel Export failed', err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Overview & Analytics</h1>
          <p className="text-sm text-slate-500">Monitor overall progress, status workflows, and export reports</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm hover:bg-emerald-800 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </header>

      {/* Visual Graphical Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Total Packets</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalPackets}</h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><PieChart className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">In Progress / Moderation</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{statusCounts['MODERATION'] || 0}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Printing Stage</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{statusCounts['PRINTING'] || 0}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Search className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Completed</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{statusCounts['COMPLETED'] || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Visual Status Progress Graph Representation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Workflow Distribution Bar</h3>
        <div className="w-full bg-slate-100 rounded-full h-4 flex overflow-hidden">
          {totalPackets > 0 ? (
            Object.entries(statusCounts).map(([st, count], idx) => {
              const colors = ['bg-blue-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500'];
              const pct = (count / totalPackets) * 100;
              return (
                <div 
                  key={st} 
                  style={{ width: `${pct}%` }} 
                  className={`${colors[idx % colors.length]} h-full transition-all`}
                  title={`${st}: ${count} (${Math.round(pct)}%)`}
                />
              );
            })
          ) : (
            <div className="bg-slate-200 w-full h-full" />
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
          {Object.entries(statusCounts).map(([st, count]) => (
            <span key={st} className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block" /> {st}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by course code, name, lecturer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="MODERATION">In Moderation</option>
            <option value="PRINTING">Printing</option>
            <option value="MARKING">Marking</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <button 
          onClick={fetchPackets}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* Packet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Current Holder</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Deadline</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-400">Loading packets...</td></tr>
            ) : packets.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-400">No packets found.</td></tr>
            ) : (
              packets.map((pkt) => (
                <tr key={pkt.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{pkt.courseCode}</span>
                    <span className="block text-xs text-slate-500">{pkt.courseName}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{pkt.currentHolder || 'Unassigned'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                      {pkt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{pkt.deadline}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedPacket(pkt)}
                      className="text-brand-600 hover:underline font-medium text-xs bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
                    >
                      View Details & History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}