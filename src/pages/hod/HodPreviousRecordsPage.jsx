import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Archive, CheckCircle2, RefreshCw, Layers } from "lucide-react";
import { hodApi } from "../../services/api";
import { useAcademicCycle } from "../../context/AcademicCycleContext";

export default function HodPreviousRecordsPage({ deptId = "ALL" }) {
  const { selectedCycleId } = useAcademicCycle();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hodApi.getPreviousRecords(deptId);
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setRecords(data);
    } catch (err) {
      setError(err?.message || "Failed to load archived records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [deptId, selectedCycleId]);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return records.filter(
      (rec) =>
        !q ||
        String(rec.packetId || "").toLowerCase().includes(q) ||
        (rec.courseName || "").toLowerCase().includes(q) ||
        (rec.courseCode || "").toLowerCase().includes(q) ||
        (rec.lecturerName || "").toLowerCase().includes(q)
    );
  }, [records, searchTerm]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Archive className="text-[#7c4dff] w-7 h-7" />
            Previous Academic Records & Archives
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Historical archive of completed examination packets and previous academic semester records.
          </p>
        </div>

        <button
          onClick={loadRecords}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm cursor-pointer font-semibold text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Archive
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search archive by course code, title, lecturer, or packet ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-slate-800"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Course Unit</th>
                <th className="py-3 px-4">Academic Cycle</th>
                <th className="py-3 px-4">Lecturer</th>
                <th className="py-3 px-4">Moderator</th>
                <th className="py-3 px-4">Completed Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
                      <span>Loading archive records...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-rose-500 font-semibold">
                    {error}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Archive className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-bold text-slate-600">
                        No archived examination records found.
                      </span>
                      <span className="text-xs text-slate-400">
                        Completed packets from past academic semesters will appear here automatically.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id || rec.packetId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-xs">{rec.courseCode}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{rec.courseName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      2025/2026
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium text-xs">
                      {rec.lecturerName || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {rec.moderatorName || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {rec.deadline || "Finalized"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
