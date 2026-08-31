import React, { useEffect, useState } from "react";
import { Users, AlertTriangle, Bell, Send, CheckCircle2 } from "lucide-react";
import { hodApi } from "../../services/api";

const DEPARTMENT_ID = "D1";

export default function HodWorkloadPage() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NOTE: the backend does not expose a notifications endpoint yet, so
  // sending here is local-only (kept from the original mock behaviour).
  // Wire this up to a real /api/hod/notifications endpoint when available.
  const [notifications, setNotifications] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    hodApi
      .getDepartmentWorkload(DEPARTMENT_ID)
      .then((response) => {
        // Handle cases where the API returns a direct array or wraps it in an object (e.g., { data: [...] } or { lecturers: [...] })
        const data = Array.isArray(response)
          ? response
          : response?.data || response?.lecturers || [];
        setLecturers(data);
      })
      .catch((err) => setError(err?.message || "Failed to load workload data."))
      .finally(() => setLoading(false));
  }, []);

  const handleSendNotification = () => {
    if (!selectedLecturer) {
      alert("Please select a lecturer.");
      return;
    }
    if (!notificationMessage.trim()) {
      alert("Please enter a notification message.");
      return;
    }

    const lecturer = lecturers.find(
      (item) => item.lecturerId === selectedLecturer,
    );
    if (!lecturer) return;

    setSending(true);
    setSuccessMessage("");

    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        lecturerId: lecturer.lecturerId,
        lecturerName: lecturer.lecturerName,
        message: notificationMessage,
        date: new Date().toISOString().split("T")[0],
      };

      setNotifications((previous) => [newNotification, ...previous]);
      setNotificationMessage("");
      setSelectedLecturer("");
      setSending(false);
      setSuccessMessage(`Notification sent to ${lecturer.lecturerName}`);

      setTimeout(() => setSuccessMessage(""), 3000);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* LECTURER WORKLOAD */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Lecturer Workload
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Packet assignment and marking progress by lecturer
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">
                  Lecturer
                </th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">
                  Assigned Packets
                </th>
                <th className="text-center px-4 py-3 font-semibold text-amber-600">
                  Total Scripts
                </th>
                <th className="text-center px-4 py-3 font-semibold text-green-600">
                  Marked Scripts
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Loading workload...
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
              ) : lecturers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    No lecturers found for this department.
                  </td>
                </tr>
              ) : (
                lecturers.map((lecturer) => (
                  <tr
                    key={lecturer.lecturerId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {lecturer.lecturerName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {lecturer.lecturerId}
                      </p>
                    </td>
                    <td className="text-center px-4 py-4">
                      <StatusNumber
                        value={lecturer.totalAssignedPackets}
                        type="blue"
                      />
                    </td>
                    <td className="text-center px-4 py-4">
                      <StatusNumber
                        value={lecturer.totalScripts}
                        type="amber"
                      />
                    </td>
                    <td className="text-center px-4 py-4">
                      <StatusNumber
                        value={lecturer.markedScripts}
                        type="green"
                      />
                    </td>
                    <td className="text-center px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(lecturer.progressPercentage || 0, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {lecturer.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEND NOTIFICATION */}
      <div className="bg-white border border-gray-200 rounded-xl mt-6">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Bell size={19} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Send Notification
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Send a notification to a lecturer about their workload
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Select Lecturer
              </label>
              <select
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value="">Select a lecturer</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                    {lecturer.lecturerName} ({lecturer.lecturerId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Notification
              </label>
              <input
                type="text"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter notification message..."
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <button
              onClick={handleSendNotification}
              disabled={sending}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          {successMessage && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {successMessage}
            </div>
          )}
        </div>
      </div>

      {/* SENT NOTIFICATIONS */}
      <div className="bg-white border border-gray-200 rounded-xl mt-6">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell size={19} className="text-gray-600" />
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Recent Notifications
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Notifications sent to lecturers this session
              </p>
            </div>
          </div>
        </div>

        <div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">
              No notifications sent yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="px-5 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {notification.lecturerName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {notification.lecturerId} • {notification.date}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                    Sent
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusNumber({ value, type }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-orange-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`inline-flex min-w-[30px] justify-center px-2 py-1 rounded-md font-semibold ${styles[type]}`}
    >
      {value}
    </span>
  );
}
