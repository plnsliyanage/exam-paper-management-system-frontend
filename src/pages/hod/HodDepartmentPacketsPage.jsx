import React, { useState, useEffect } from 'react';
import { hodApi } from '../../services/api';
import { Search, Filter, FileText, Eye, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import HodPacketDetailModal from '../../components/hod/HodPacketDetailModal';

export default function HodDepartmentPacketsPage({ deptId = 'CS' }) {
  const [packets, setPackets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLecturer, setSelectedLecturer] = useState('ALL');
  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    hodApi.getDepartmentPackets(deptId)
      .then((res) => setPackets(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [deptId]);

  const filteredPackets = packets.filter((pkt) => {
    const matchesSearch = 
      pkt.courseCode?.toLowerCase().includes(search.toLowerCase()) ||
      pkt.lecturer?.toLowerCase().includes(search.toLowerCase()) ||
      pkt.moderator?.toLowerCase().includes(search.toLowerCase());
    const matchesCycle = selectedCycle === 'ALL' || pkt.academicCycle === selectedCycle;
    const matchesStatus = selectedStatus === 'ALL' || pkt.status === selectedStatus;
    const matchesLecturer = selectedLecturer === 'ALL' || pkt.lecturer === selectedLecturer;
    return matchesSearch && matchesCycle && matchesStatus && matchesLecturer;
  });

  const lecturers = Array.from(new Set(packets.map((p) => p.lecturer).filter(Boolean)));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Department Packets</h1>
        <p className="text-sm text-slate-500">Track progress, current holders, and movement history across all courses</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search course, lecturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Academic Cycles</option>
            <option value="2026/S1">2026 / Semester 1</option>
            <option value="2025/S2">2025 / Semester 2</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Overdue">Overdue</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={selectedLecturer}
            onChange={(e) => setSelectedLecturer(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Lecturers</option>
            {lecturers.map((lec) => (
              <option key={lec} value={lec}>{lec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Packets Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="font-semibold text-xs text-slate-700">Showing {filteredPackets.length} Packets</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading packets...</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Course</th>
                <th className="p-3.5">Lecturer / Moderator</th>
                <th className="p-3.5">Current Holder</th>
                <th className="p-3.5">Marking Progress</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPackets.length > 0 ? (
                filteredPackets.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{pkt.courseCode}</span>
                      <span className="text-slate-500 text-[11px]">{pkt.courseTitle || 'Computer Science Paper'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-800 block">{pkt.lecturer}</span>
                      <span className="text-slate-400 text-[11px]">Mod: {pkt.moderator || 'None'}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-800">{pkt.currentHolder || 'Unassigned'}</td>
                    <td className="p-3.5">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>{pkt.completedScripts || 0}/{pkt.totalScripts || 0}</span>
                          <span className="font-semibold">{pkt.totalScripts ? Math.round((pkt.completedScripts / pkt.totalScripts) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-1.5 rounded-full"
                            style={{ width: `${pkt.totalScripts ? Math.min(100, (pkt.completedScripts / pkt.totalScripts) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        pkt.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                        pkt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {pkt.status || 'In Progress'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedPacketId(pkt.id)}
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400">
                    No matching packets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Packet Inspection Modal */}
      {selectedPacketId && (
        <HodPacketDetailModal
          packetId={selectedPacketId}
          onClose={() => setSelectedPacketId(null)}
        />
      )}
    </div>
  );
}