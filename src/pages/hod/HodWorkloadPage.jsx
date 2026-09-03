import React, { useEffect, useState } from "react";
import { Users, Bell, Send, CheckCircle2 } from "lucide-react";
import { hodApi } from "../../services/api";

export default function HodWorkloadPage({ deptId = "ALL" }) {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    hodApi
      .getDepartmentWorkload(deptId)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setLecturers(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load department workload data.");
      })
      .finally(() => setLoading(false));
  }, [deptId]);

  const handleSendNotification = () => {
    if (!selectedLecturer || !notificationMessage.trim()) return;
    const lecturer = lecturers.find((l) => l.lecturerId === selectedLecturer);
    if (!lecturer) return;

    setSending(true);
    setTimeout(() => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          lecturerId: lecturer.lecturerId,
          lecturerName: lecturer.lecturerName,
          message: notificationMessage.trim(),
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      setNotificationMessage("");
      setSelectedLecturer("");
      setSending(false);
      setSuccessMessage(`Notification sent to ${lecturer.lecturerName}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 400);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lecturer Workload & Progress</h1>
        <p className="text-slate-500 text-xs mt-1">
          Review paper marking distribution and task progress across academic staff.
        </p>
      </div>

      {/* Workload Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
          <Users className="w-4 h-4 text-[#7c4dff]" />
          Department Academic Staff Workload
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading workload metrics...</div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600">{error}</div>
        ) : lecturers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No lecturers found for this department.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Lecturer</th>
                  <th className="py-3 px-4 text-center">Assigned Packets</th>
                  <th className="py-3 px-4 text-center">Total Scripts</th>
                  <th className="py-3 px-4 text-center">Marked Scripts</th>
                  <th className="py-3 px-4 text-center">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lecturers.map((l) => (
                  <tr key={l.lecturerId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block text-xs">{l.lecturerName}</span>
                      <span className="text-[11px] text-slate-400">ID: #{l.lecturerId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#7c4dff]">
                      {l.totalAssignedPackets}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-600">
                      {l.totalScripts}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      {l.markedScripts}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#7c4dff] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(l.progressPercentage || 0, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-xs">
                          {l.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send Notification Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#7c4dff]" />
          Notify Lecturer
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Lecturer</label>
            <select
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs cursor-pointer font-medium"
            >
              <option value="">Choose lecturer...</option>
              {lecturers.map((l) => (
                <option key={l.lecturerId} value={l.lecturerId}>
                  {l.lecturerName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Message</label>
            <input
              type="text"
              placeholder="e.g. Please expedite marking for CS102..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"
            />
          </div>

          <button
            onClick={handleSendNotification}
            disabled={sending || !selectedLecturer || !notificationMessage.trim()}
            className="px-5 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}
