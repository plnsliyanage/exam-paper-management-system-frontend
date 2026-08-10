import React from "react";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function HodDepartmentView({ navigateTo }) {
  const stats = [
    {
      title: "Total Packets",
      value: "48",
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "In Progress",
      value: "24",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Overdue / Delayed",
      value: "7",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Completed",
      value: "17",
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
  ];

  const recentPackets = [
    {
      id: "PKT-2026-012",
      course: "Advanced Software Engineering",
      lecturer: "Dr. Alice Smith",
      moderator: "Prof. Bob Jones",
      status: "Pending Moderation",
      holder: "Prof. Bob Jones",
      overdue: false,
    },
    {
      id: "PKT-2026-011",
      course: "Database Management Systems",
      lecturer: "Dr. Charlie Brown",
      moderator: "Dr. Alice Smith",
      status: "Marking in Progress",
      holder: "Dr. Charlie Brown",
      overdue: true,
    },
    {
      id: "PKT-2026-010",
      course: "Data Structures & Algorithms",
      lecturer: "Prof. Diana Prince",
      moderator: "Dr. Evans",
      status: "Completed",
      holder: "Archived",
      overdue: false,
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Head of Department Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Monitor department packets, workload distribution, and staff
            performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo("reports")}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            View Reports
          </button>
          <button
            onClick={() => navigateTo("packets")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2"
          >
            Manage Packets <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Department Packets
            </h2>
            <button
              onClick={() => navigateTo("packets")}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-3">Packet ID & Course</th>
                  <th className="py-3 px-3">Lecturer / Moderator</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current Holder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentPackets.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-900">{pkt.id}</div>
                      <div className="text-xs text-gray-500">{pkt.course}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-gray-800">{pkt.lecturer}</div>
                      <div className="text-xs text-gray-500">
                        Mod: {pkt.moderator}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkt.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {pkt.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">
                      {pkt.holder}
                      {pkt.overdue && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                          Overdue
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Attention Required
            </h2>
            <div className="space-y-3">
              <div
                onClick={() => navigateTo("overdue")}
                className="p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-red-600" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      7 Overdue Packets
                    </p>
                    <p className="text-xs text-red-700">
                      Action needed to clear delays
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-red-600" />
              </div>

              <div
                onClick={() => navigateTo("workload")}
                className="p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Workload Disbalance
                    </p>
                    <p className="text-xs text-blue-700">
                      Check lecturer assignments
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigateTo("previous")}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Access Previous Academic Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
