import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { hodApi } from "../../services/api"; // Adjust the path to your api file if needed

export default function HodDepartmentView({ navigateTo, deptId = "D1" }) {
  const [stats, setStats] = useState([
    {
      title: "Total Packets",
      value: "0",
      icon: FileText,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "In Progress",
      value: "0",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Overdue / Delayed",
      value: "0",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Completed",
      value: "0",
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
  ]);

  const [recentPackets, setRecentPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentData();
  }, [deptId]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);

      // Fetch aggregated stats and department packets in parallel
      const [statsRes, packetsRes] = await Promise.all([
        hodApi.getDepartmentStatistics(deptId),
        hodApi.getDepartmentPackets(deptId),
      ]);

      const data = statsRes.data;

      // Update metrics state with backend response
      setStats([
        {
          title: "Total Packets",
          value: data.totalPackets.toString(),
          icon: FileText,
          color: "text-blue-600 bg-blue-50",
        },
        {
          title: "In Progress",
          value: data.inProgressPackets.toString(),
          icon: Clock,
          color: "text-amber-600 bg-amber-50",
        },
        {
          title: "Overdue / Delayed",
          value: data.overduePackets.toString(),
          icon: AlertTriangle,
          color: "text-red-600 bg-red-50",
        },
        {
          title: "Completed",
          value: data.completedPackets.toString(),
          icon: CheckCircle2,
          color: "text-green-600 bg-green-50",
        },
      ]);

      // Set top 3 recent packets for the table
      setRecentPackets(packetsRes.data.slice(0, 3));
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch department dashboard data:", err);
      setError("Failed to load department data from server.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-gray-500 text-sm font-medium animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-red-600 text-sm font-medium">{error}</p>
      </div>
    );
  }

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
                  <th className="py-3 px-3">Cycle</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Current Holder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentPackets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-4 text-center text-gray-500 text-xs"
                    >
                      No packets found for this department.
                    </td>
                  </tr>
                ) : (
                  recentPackets.map((pkt) => (
                    <tr key={pkt.packetId} className="hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900">
                          {pkt.packetId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pkt.courseName} ({pkt.courseCode})
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 text-xs">
                        {pkt.cycleId}
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
                        {pkt.currentHolderName}
                        {pkt.isOverdue && (
                          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                            Overdue
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
                      Overdue Packets
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

      {/* Semester Workload Structure Comparison Line Graph */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Semester Workload Comparison
            </h2>
            <p className="text-xs text-gray-500">
              Comparing total assessment packets and processing volume across
              recent academic terms.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
              <span>Total Packets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
              <span>Completed</span>
            </div>
          </div>
        </div>

        <div className="h-48 w-full pt-4 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
            <line
              x1="0"
              y1="0"
              x2="600"
              y2="0"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="40"
              x2="600"
              y2="40"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="80"
              x2="600"
              y2="80"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="120"
              x2="600"
              y2="120"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="160"
              x2="600"
              y2="160"
              stroke="#e5e7eb"
              strokeWidth="1"
            />

            {/* Total Packets Line */}
            <path
              d="M 50,70 Q 175,20 300,50 T 550,30"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
            />
            {/* Completed Packets Line */}
            <path
              d="M 50,110 Q 175,80 300,90 T 550,45"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
            />

            <circle cx="50" cy="70" r="4" fill="#2563eb" />
            <circle cx="300" cy="50" r="4" fill="#2563eb" />
            <circle cx="550" cy="30" r="4" fill="#2563eb" />

            <circle cx="50" cy="110" r="4" fill="#22c55e" />
            <circle cx="300" cy="90" r="4" fill="#22c55e" />
            <circle cx="550" cy="45" r="4" fill="#22c55e" />
          </svg>

          <div className="flex justify-between text-xs text-gray-500 px-2 mt-2 font-medium">
            <span>2024/2025 Sem 2</span>
            <span>2025/2026 Sem 1</span>
            <span>2026/2027 Sem 1 (Current)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
