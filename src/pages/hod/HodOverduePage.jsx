import React, { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { hodApi } from "../../services/api";

const DEPARTMENT_ID = "D1";

export default function HodOverduePage() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    hodApi
      .getOverduePackets(DEPARTMENT_ID)
      .then(setPackets)
      .catch((err) =>
        setError(err?.message || "Failed to load overdue packets."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={24} />
          Overdue Packets
        </h1>
        <p className="text-sm text-gray-500">
          Packets that have passed their deadline and require immediate action.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Current Holder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Loading overdue packets...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : packets.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    No overdue packets. Everything is on track.
                  </td>
                </tr>
              ) : (
                packets.map((p) => (
                  <tr key={p.packetId} className="hover:bg-red-50/40">
                    <td className="py-3 px-4 font-semibold text-red-600">
                      {p.packetId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {p.courseName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.courseCode}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                        <Clock size={12} /> {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-red-600 font-semibold">
                      {p.deadline}
                    </td>
                    <td className="py-3 px-4 text-gray-700 text-sm">
                      {p.currentHolderName}
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
