import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Bell,
  Send,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  CheckSquare,
  Clock,
  ShieldAlert,
  X,
  Mail,
} from "lucide-react";
import { hodApi } from "../../services/api";
import { useAcademicCycle } from "../../context/AcademicCycleContext";

export default function HodWorkloadPage({ deptId = "ALL" }) {
  const { selectedCycleId } = useAcademicCycle();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [filterRole, setFilterRole] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadWorkload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await hodApi.getDepartmentWorkload(deptId);
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setLecturers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load department workload data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkload();
  }, [deptId, selectedCycleId]);

  const handleSendNotification = async (staffId, customMsg, urgentFlag = false) => {
    const targetStaff = staffId ? lecturers.find((l) => l.lecturerId === staffId) : selectedStaff;
    const msg = customMsg || notificationMessage;

    if (!targetStaff || !msg.trim()) return;

    setSending(true);
    try {
      await hodApi.notifyStaff({
        targetUserId: targetStaff.lecturerId,
        message: msg.trim(),
        title: urgentFlag || isUrgent ? "URGENT: Department Exam Notice" : "Notice from Head of Department",
        isUrgent: urgentFlag || isUrgent,
      });

      setSuccessMessage(`Notification successfully sent to ${targetStaff.lecturerName}`);
      setNotificationMessage("");
      setSelectedStaff(null);
      setIsUrgent(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to send notification:", err);
      alert("Failed to send notification. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return lecturers.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (l.lecturerName || "").toLowerCase().includes(q) ||
        (l.username || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (filterRole === "ALL") return true;
      if (filterRole === "ROLE_USER") return l.role === "ROLE_USER";
      if (filterRole === "ROLE_MODERATOR") return l.role === "ROLE_MODERATOR";
      return true;
    });
  }, [lecturers, searchQuery, filterRole]);

  const statsSummary = useMemo(() => {
    const totalStaff = lecturers.length;
    const totalPackets = lecturers.reduce((sum, l) => sum + (l.totalAssignedPackets || 0), 0);
    const totalOverdue = lecturers.reduce((sum, l) => sum + (l.overduePackets || 0), 0);
    const avgProgress =
      totalStaff > 0
        ? Math.round(lecturers.reduce((sum, l) => sum + (l.progressPercentage || 0), 0) / totalStaff)
        : 0;

    return { totalStaff, totalPackets, totalOverdue, avgProgress };
  }, [lecturers]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Department Staff Workload</h1>
          <p className="text-slate-500 text-xs mt-1">
            Monitor exam drafting, paper moderation assignments, and progress across departmental academic staff.
          </p>
        </div>

        <button
          onClick={loadWorkload}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm cursor-pointer font-semibold text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Workload
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-xs">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Academic Staff</span>
            <p className="text-2xl font-black text-slate-900">{statsSummary.totalStaff}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Total Assigned Units</span>
            <p className="text-2xl font-black text-slate-900">{statsSummary.totalPackets}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Avg Dept Progress</span>
            <p className="text-2xl font-black text-emerald-600">{statsSummary.avgProgress}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Overdue Items</span>
            <p className="text-2xl font-black text-rose-600">{statsSummary.totalOverdue}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterRole("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              filterRole === "ALL" ? "bg-[#7c4dff] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Staff ({lecturers.length})
          </button>
          <button
            onClick={() => setFilterRole("ROLE_USER")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              filterRole === "ROLE_USER" ? "bg-[#7c4dff] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Lecturers
          </button>
          <button
            onClick={() => setFilterRole("ROLE_MODERATOR")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              filterRole === "ROLE_MODERATOR" ? "bg-[#7c4dff] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Moderators
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter staff by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs"
        />
      </div>

      {/* Workload Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7c4dff]" />
            <span>Loading staff workload...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 text-rose-600 font-semibold">
            {error}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No staff members found for this criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Academic Staff</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Courses</th>
                  <th className="py-3 px-4 text-center">Packets</th>
                  <th className="py-3 px-4 text-center">Stage Progress</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => (
                  <tr key={staff.lecturerId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-xs">{staff.lecturerName}</span>
                      <span className="text-[11px] text-slate-400">{staff.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          staff.role === "ROLE_MODERATOR"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {staff.role === "ROLE_MODERATOR" ? "Moderator" : "Lecturer"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {staff.assignedCourses && staff.assignedCourses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {staff.assignedCourses.slice(0, 3).map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                            >
                              {c.split(" - ")[0]}
                            </span>
                          ))}
                          {staff.assignedCourses.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{staff.assignedCourses.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">None assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
                      {staff.totalAssignedPackets}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#7c4dff] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(staff.progressPercentage || 0, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 text-xs">
                          {staff.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStaff(staff)}
                        className="px-3 py-1.5 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/20 rounded-xl font-bold transition cursor-pointer text-xs inline-flex items-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5" /> Notify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notify Staff Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-[#7c4dff] uppercase tracking-wider">
                  Direct HOD Communication
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Notify {selectedStaff.lecturerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recipient</span>
                  <p className="font-bold text-slate-800 mt-0.5 text-xs">
                    {selectedStaff.lecturerName} ({selectedStaff.email})
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7c4dff]/10 text-[#7c4dff]">
                  {selectedStaff.role === "ROLE_MODERATOR" ? "Moderator" : "Lecturer"}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Message / Academic Directive
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Please ensure draft exam paper for CS201 is submitted for moderation before this Friday..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff]/20 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgentFlag"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer accent-rose-600"
                />
                <label htmlFor="urgentFlag" className="text-slate-700 font-semibold cursor-pointer">
                  Mark as High Priority / Urgent Alert
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendNotification()}
                  disabled={sending || !notificationMessage.trim()}
                  className="px-5 py-2 bg-[#7c4dff] hover:bg-[#6c3de8] disabled:opacity-50 text-white rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending..." : "Send Directive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
