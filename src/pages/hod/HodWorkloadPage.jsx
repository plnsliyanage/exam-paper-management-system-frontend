import React, { useState } from "react";
import { Users, AlertTriangle, Bell, Send, CheckCircle2 } from "lucide-react";

export default function HodWorkloadPage() {
  // ============================================================
  // SAMPLE LECTURER DATA
  // ============================================================

  const [lecturers] = useState([
    {
      id: "U1",
      name: "Dr. Samantha Perera",
      paperSetting: 1,
      moderating: 1,
      marking: 2,
      secondMarking: 1,
      completed: 2,
      overdue: 0,
    },
    {
      id: "U2",
      name: "Dr. Kasun Fernando",
      paperSetting: 2,
      moderating: 1,
      marking: 2,
      secondMarking: 0,
      completed: 1,
      overdue: 1,
    },
    {
      id: "U3",
      name: "Prof. Nimal Silva",
      paperSetting: 1,
      moderating: 1,
      marking: 1,
      secondMarking: 1,
      completed: 2,
      overdue: 0,
    },
    {
      id: "U4",
      name: "Dr. Anjali Perera",
      paperSetting: 1,
      moderating: 1,
      marking: 2,
      secondMarking: 1,
      completed: 0,
      overdue: 1,
    },
  ]);

  // ============================================================
  // SAMPLE PREVIOUS NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      lecturerId: "U2",
      lecturerName: "Dr. Kasun Fernando",
      message: "Please complete the pending marking work before the deadline.",
      date: "2026-08-20",
    },
    {
      id: 2,
      lecturerId: "U4",
      lecturerName: "Dr. Anjali Perera",
      message:
        "Your assigned paper requires attention. Please check the packet.",
      date: "2026-08-19",
    },
  ]);

  // ============================================================
  // NOTIFICATION STATES
  // ============================================================

  const [selectedLecturer, setSelectedLecturer] = useState("");

  const [notificationMessage, setNotificationMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================
  // TOTAL WORKLOAD
  // ============================================================

  const getTotalWorkload = (lecturer) => {
    return (
      lecturer.paperSetting +
      lecturer.moderating +
      lecturer.marking +
      lecturer.secondMarking +
      lecturer.completed
    );
  };

  // ============================================================
  // SEND NOTIFICATION
  // ============================================================

  const handleSendNotification = () => {
    if (!selectedLecturer) {
      alert("Please select a lecturer.");
      return;
    }

    if (!notificationMessage.trim()) {
      alert("Please enter a notification message.");
      return;
    }

    const lecturer = lecturers.find((item) => item.id === selectedLecturer);

    if (!lecturer) return;

    setSending(true);
    setSuccessMessage("");

    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        lecturerId: lecturer.id,
        lecturerName: lecturer.name,
        message: notificationMessage,
        date: new Date().toISOString().split("T")[0],
      };

      setNotifications((previous) => [newNotification, ...previous]);

      setNotificationMessage("");
      setSelectedLecturer("");
      setSending(false);

      setSuccessMessage(`Notification sent to ${lecturer.name}`);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 700);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ======================================================
          LECTURER WORKLOAD
      ====================================================== */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* HEADER */}

        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Lecturer Workload
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Packet assignment and workflow status by lecturer
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">
                  Lecturer
                </th>

                <th className="text-center px-4 py-3 font-semibold text-blue-600">
                  Setting
                </th>

                <th className="text-center px-4 py-3 font-semibold text-purple-600">
                  Moderating
                </th>

                <th className="text-center px-4 py-3 font-semibold text-amber-600">
                  Marking
                </th>

                <th className="text-center px-4 py-3 font-semibold text-orange-600">
                  2nd Marking
                </th>

                <th className="text-center px-4 py-3 font-semibold text-green-600">
                  Completed
                </th>

                <th className="text-center px-4 py-3 font-semibold text-red-600">
                  Overdue
                </th>

                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {lecturers.map((lecturer) => (
                <tr
                  key={lecturer.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {/* LECTURER */}

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {lecturer.name}
                      </p>

                      <p className="text-xs text-gray-400">{lecturer.id}</p>
                    </div>
                  </td>

                  {/* SETTING */}

                  <td className="text-center px-4 py-4">
                    <StatusNumber value={lecturer.paperSetting} type="blue" />
                  </td>

                  {/* MODERATING */}

                  <td className="text-center px-4 py-4">
                    <StatusNumber value={lecturer.moderating} type="purple" />
                  </td>

                  {/* MARKING */}

                  <td className="text-center px-4 py-4">
                    <StatusNumber value={lecturer.marking} type="amber" />
                  </td>

                  {/* SECOND MARKING */}

                  <td className="text-center px-4 py-4">
                    <StatusNumber
                      value={lecturer.secondMarking}
                      type="orange"
                    />
                  </td>

                  {/* COMPLETED */}

                  <td className="text-center px-4 py-4">
                    <StatusNumber value={lecturer.completed} type="green" />
                  </td>

                  {/* OVERDUE */}

                  <td className="text-center px-4 py-4">
                    {lecturer.overdue > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                        <AlertTriangle size={14} />

                        {lecturer.overdue}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>

                  {/* TOTAL */}

                  <td className="text-center px-4 py-4">
                    <span className="font-bold text-gray-800">
                      {getTotalWorkload(lecturer)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          SEND NOTIFICATION
      ====================================================== */}

      <div className="bg-white border border-gray-200 rounded-xl mt-6">
        {/* NOTIFICATION HEADER */}

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

        {/* FORM */}

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr_auto] gap-4 items-end">
            {/* SELECT LECTURER */}

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
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name} ({lecturer.id})
                  </option>
                ))}
              </select>
            </div>

            {/* MESSAGE */}

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

            {/* SEND BUTTON */}

            <button
              onClick={handleSendNotification}
              disabled={sending}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send size={16} />

              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />

              {successMessage}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          SENT NOTIFICATIONS
      ====================================================== */}

      <div className="bg-white border border-gray-200 rounded-xl mt-6">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell size={19} className="text-gray-600" />

            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Recent Notifications
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Notifications sent to lecturers
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

// ============================================================
// STATUS NUMBER COMPONENT
// ============================================================

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
