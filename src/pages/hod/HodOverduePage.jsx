import React, { useState } from "react";
import { Send, ShieldAlert } from "lucide-react";

export default function HodOverduePage() {
  const [overduePackets] = useState([
    {
      id: "PKT-2026-011",
      course: "Database Management Systems",
      lecturer: "Dr. Charlie Brown",
      holder: "Dr. Charlie Brown",
      daysDelayed: 5,
      status: "Marking in Progress",
    },
    {
      id: "PKT-2026-008",
      course: "Operating Systems",
      lecturer: "Prof. Bob Jones",
      holder: "Prof. Bob Jones",
      daysDelayed: 8,
      status: "Pending Moderation",
    },
    {
      id: "PKT-2026-005",
      course: "Computer Networks",
      lecturer: "Dr. Alice Smith",
      holder: "Exam Dept",
      daysDelayed: 3,
      status: "Verification",
    },
  ]);

  const [reminderMessage, setReminderMessage] = useState("");
  const [selectedPacket, setSelectedPacket] = useState(null);

  const handleSendReminder = (pkt) => {
    setSelectedPacket(pkt);
    setReminderMessage(
      `Dear ${pkt.lecturer}, this is an urgent reminder regarding packet ${pkt.id} (${pkt.course}) which is currently delayed by ${pkt.daysDelayed} days.`,
    );
  };

  const submitReminder = () => {
    alert(`Reminder successfully sent to ${selectedPacket?.lecturer}!`);
    setSelectedPacket(null);
    setReminderMessage("");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Overdue & Delayed Tasks Monitor
        </h1>
        <p className="text-sm text-gray-500">
          Track overdue packets, monitor bottlenecks, and send
          feedback/reminders to staff.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm bg-gradient-to-br from-red-50/50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Total Overdue
              </p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {overduePackets.length}
              </p>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800 text-sm">
          Delayed & Overdue Assessment Packets
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase bg-gray-50/50">
                <th className="py-3 px-4">Packet ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Lecturer / Responsible Holder</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Delay Duration</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {overduePackets.map((pkt) => (
                <tr key={pkt.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-red-600">
                    {pkt.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {pkt.course}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-800">{pkt.lecturer}</div>
                    <div className="text-xs text-gray-500">
                      Holder: {pkt.holder}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      {pkt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-red-600">
                    {pkt.daysDelayed} Days Overdue
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleSendReminder(pkt)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto"
                    >
                      <Send size={14} /> Send Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPacket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Send Overdue Reminder
            </h3>
            <p className="text-sm text-gray-500">
              Packet:{" "}
              <span className="font-semibold text-gray-700">
                {selectedPacket.id} - {selectedPacket.course}
              </span>
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPacket(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitReminder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
              >
                <Send size={16} /> Send Urgent Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
