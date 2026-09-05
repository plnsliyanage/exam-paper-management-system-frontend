import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  RefreshCw,
  X,
  Bell,
  User,
  ShieldAlert,
} from "lucide-react";
import { hodApi } from "../../services/api";

export default function HodOverduePage({ deptId = "ALL" }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPacket, setSelectedPacket] = useState(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadOverdue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hodApi.getOverduePackets(deptId);
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setPackets(data);
    } catch (err) {
      setError(err?.message || "Failed to load overdue packets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverdue();
  }, [deptId]);

  const openExpediteModal = (packet) => {
    setSelectedPacket(packet);
    setReminderMessage(
      `URGENT: Exam packet for ${packet.courseCode} (${packet.courseName}) is past its deadline (${packet.deadline}). Please submit/complete your required task immediately.`
    );
  };

  const handleSendExpediteAlert = async () => {
    if (!selectedPacket || !reminderMessage.trim()) return;

    setSending(true);
    try {
      // Find lecturer or moderator target
      await hodApi.notifyStaff({
        targetUserId: selectedPacket.lecturerId || 1,
        message: reminderMessage.trim(),
        title: `URGENT: Overdue Notice for ${selectedPacket.courseCode}`,
        isUrgent: true,
        courseCode: selectedPacket.courseCode,
        packetId: selectedPacket.id || selectedPacket.packetId,
      });

      setSuccessMessage(`Urgent reminder dispatched for ${selectedPacket.courseCode}`);
      setSelectedPacket(null);
      setReminderMessage("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to send expedite notice:", err);
      alert("Failed to send expedite notice. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-rose-600 w-7 h-7" />
            Overdue Department Exam Packets
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Exam units that have exceeded scheduled deadlines and require immediate administrative intervention.
          </p>
        </div>

        <button
          onClick={loadOverdue}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm cursor-pointer font-semibold text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xs">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overdue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Course Unit</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Responsible Lecturer</th>
                <th className="py-3 px-4">Moderator</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
                      <span>Checking overdue status...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-rose-500 font-semibold">
                    {error}
                  </td>
                </tr>
              ) : packets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-emerald-600 font-semibold">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-800">
                        Excellent! No overdue exam packets.
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        All departmental course units are currently tracking within their deadlines.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                packets.map((p) => (
                  <tr key={p.id || p.packetId} className="hover:bg-rose-50/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-xs">{p.courseCode}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{p.courseName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> {p.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium text-xs">
                      {p.lecturerName || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {p.moderatorName || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600 text-xs">
                      {p.deadline || "Past Deadline"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openExpediteModal(p)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition cursor-pointer text-xs inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Expedite Alert
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expedite Modal */}
      {selectedPacket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Urgent Escalation Notice
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Expedite {selectedPacket.courseCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPacket(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Course & Lecturer</span>
                <p className="font-bold text-slate-900 mt-0.5 text-xs">
                  {selectedPacket.courseCode} - {selectedPacket.courseName}
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Lecturer: {selectedPacket.lecturerName || "Unassigned"} • Deadline: {selectedPacket.deadline}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Escalation Directive Message
                </label>
                <textarea
                  rows={4}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedPacket(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendExpediteAlert}
                  disabled={sending || !reminderMessage.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending..." : "Dispatch Urgent Alert"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
