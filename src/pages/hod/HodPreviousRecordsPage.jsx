import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { hodApi } from "../../services/api";

const DEPARTMENT_ID = "D1";

export default function HodPreviousRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    hodApi
      .getPreviousRecords(DEPARTMENT_ID)
      .then(setRecords)
      .catch((err) =>
        setError(err?.message || "Failed to load archived records."),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return records.filter(
      (rec) =>
        rec.packetId.toLowerCase().includes(q) ||
        rec.courseName?.toLowerCase().includes(q) ||
        rec.courseCode?.toLowerCase().includes(q),
    );
  }, [records, searchTerm]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Previous Academic Records & Archives
        </h1>
        <p className="text-sm text-gray-500">
          Access and search historical assessment packets from completed
          academic cycles.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search archive by course name, packet ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Academic Cycle</th>
                <th className="py-3 px-4">Last Holder</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Loading archive...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    No archived records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.packetId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {rec.packetId}
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-600">
                      {rec.courseName}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {rec.cycleId}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {rec.currentHolderName}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {rec.deadline}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() =>
                          alert(`Opening archive for ${rec.packetId}`)
                        }
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto"
                      >
                        <Eye size={14} /> View Record
                      </button>
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
