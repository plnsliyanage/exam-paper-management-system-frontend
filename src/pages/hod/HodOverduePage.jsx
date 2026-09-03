import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { hodApi } from "../../services/api";

export default function HodOverduePage({ deptId = "ALL" }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    hodApi
      .getOverduePackets(deptId)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setPackets(data);
      })
      .catch((err) =>
        setError(err?.message || "Failed to load overdue packets.")
      )
      .finally(() => setLoading(false));
  }, [deptId]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="text-rose-600 w-6 h-6" />
          Overdue Exam Packets
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Packets that have passed their assigned deadlines and require attention.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Current Holder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400">
                    Loading overdue packets...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-rose-500 font-semibold">
                    {error}
                  </td>
                </tr>
              ) : packets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-emerald-600 font-semibold">
                    ✓ No overdue packets. All academic packets are currently on track!
                  </td>
                </tr>
              ) : (
                packets.map((p) => (
                  <tr key={p.packetId} className="hover:bg-rose-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      #{p.packetId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-xs">{p.courseCode}</span>
                      <span className="text-[11px] text-slate-500">{p.courseName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> {p.status || "OVERDUE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600 text-xs">
                      {p.deadline || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {p.currentHolderName || "Unassigned"}
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
