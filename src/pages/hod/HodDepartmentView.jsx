import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldAlert,
  Edit,
  CheckSquare,
  Award,
} from "lucide-react";
import { hodApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STAGE_META = [
  { key: "Paper Setting", icon: Edit },
  { key: "Paper Marking", icon: FileText },
  { key: "Paper Moderation", icon: CheckSquare },
  { key: "Second Marking", icon: Award },
];

export default function HodDepartmentView({ deptId = "ALL" }) {
  const navigate = useNavigate();
  const { getRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPackets, setShowAllPackets] = useState(false);
  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);

  const navigateTo = (target) => navigate(`/hod/${target}`);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      hodApi.getDepartmentStatistics(deptId),
      hodApi.getDepartmentPackets(deptId),
    ])
      .then(([statsRes, packetsRes]) => {
        if (!isMounted) return;
        setStats(statsRes.data || statsRes);
        const safePackets = Array.isArray(packetsRes.data)
          ? packetsRes.data
          : Array.isArray(packetsRes) ? packetsRes : [];
        setPackets(safePackets);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load department dashboard:", err);
        setError("Failed to load department dashboard data.");
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [deptId]);

  const summaryCards = useMemo(() => {
    return [
      {
        title: "Total Packets",
        value: stats?.totalPackets ?? packets.length,
        icon: FileText,
        color: "text-blue-600 bg-blue-50",
      },
      {
        title: "In Progress",
        value: stats?.inProgressPackets ?? packets.filter((p) => p.status !== "COMPLETED" && p.status !== "Completed").length,
        icon: Clock,
        color: "text-amber-600 bg-amber-50",
      },
      {
        title: "Overdue / Delayed",
        value: stats?.overduePackets ?? packets.filter((p) => p.isOverdue).length,
        icon: AlertTriangle,
        color: "text-red-600 bg-red-50",
      },
      {
        title: "Completed",
        value: stats?.completedPackets ?? packets.filter((p) => p.status === "COMPLETED" || p.status === "Completed").length,
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50",
      },
    ];
  }, [stats, packets]);

  const displayedPackets = showAllPackets ? packets : packets.slice(0, 5);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading department overview...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Head of Department Workspace</h1>
        <p className="text-slate-500 text-xs mt-1">
          Monitor academic exam packet progress, moderation, and lecturer workloads.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold">{card.title}</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Packets Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800">
              Department Exam Packets
            </h2>
            <button
              onClick={() => setShowAllPackets(!showAllPackets)}
              className="text-xs text-[#7c4dff] hover:underline font-semibold cursor-pointer"
            >
              {showAllPackets ? "Show Less" : `View All (${packets.length})`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Packet & Course</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Current Holder</th>
                  <th className="py-2.5 px-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedPackets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No exam packets recorded for this department.
                    </td>
                  </tr>
                ) : (
                  displayedPackets.map((pkt) => (
                    <tr key={pkt.packetId} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block text-xs">#{pkt.packetId} {pkt.courseCode}</span>
                        <span className="text-[11px] text-slate-400">{pkt.courseName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pkt.status === "COMPLETED" || pkt.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {pkt.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-xs">
                        {pkt.currentHolderName || "Unassigned"}
                        {pkt.isOverdue && (
                          <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {pkt.deadline || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Overdue Alert */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
          <h2 className="text-sm font-bold text-slate-800">Attention Required</h2>
          
          <div
            onClick={() => navigateTo("overdue")}
            className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-600 w-5 h-5" />
              <div>
                <p className="text-xs font-bold text-rose-900">Overdue Packets</p>
                <p className="text-[11px] text-rose-700">Check pending items past deadline</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-600" />
          </div>

          <div
            onClick={() => navigateTo("workload")}
            className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-100 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Users className="text-blue-600 w-5 h-5" />
              <div>
                <p className="text-xs font-bold text-blue-900">Lecturer Workload</p>
                <p className="text-[11px] text-blue-700">Review marking assignments</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => navigateTo("packets")}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              All Department Packets
            </button>
            <button
              onClick={() => navigateTo("reports")}
              className="w-full py-2 bg-[#7c4dff] hover:bg-[#6c3de8] text-white rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              Generate Department Report
            </button>
            <button
              onClick={() => navigateTo("previous")}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              Previous Academic Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
