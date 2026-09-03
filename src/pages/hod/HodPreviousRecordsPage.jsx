import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Archive } from "lucide-react";
import { hodApi } from "../../services/api";

export default function HodPreviousRecordsPage({ deptId = "ALL" }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    hodApi
      .getPreviousRecords(deptId)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setRecords(data);
      })
      .catch((err) =>
        setError(err?.message || "Failed to load archived records.")
      )
      .finally(() => setLoading(false));
  }, [deptId]);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return records.filter(
      (rec) =>
        !q ||
        String(rec.packetId || "").toLowerCase().includes(q) ||
        (rec.courseName || "").toLowerCase().includes(q) ||
        (rec.courseCode || "").toLowerCase().includes(q)
    );
  }, [records, searchTerm]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Archive className="text-[#7c4dff] w-6 h-6" />
          Previous Academic Records & Archives
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Historical exam packets from prior semesters and academic cycles.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search archive by course code, name, or packet ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#7c4dff]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Academic Cycle</th>
                <th className="py-3 px-4">Last Holder</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    Loading archive records...
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
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    No archived exam records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.packetId} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      #{rec.packetId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block text-xs">{rec.courseCode}</span>
                      <span className="text-[11px] text-slate-400">{rec.courseName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {rec.cycleId || "2026"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rec.currentHolderName || "Archive"}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {rec.deadline || "Completed"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {rec.status || "COMPLETED"}
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
