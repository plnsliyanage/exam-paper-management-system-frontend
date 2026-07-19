import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const summaryCards = [
  {
    key: "totalPackets",
    label: "Total Packets",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
    icon: "📄",
    trend: "+12%",
    trendUp: true,
  },
  {
    key: "pending",
    label: "Pending",
    color: "bg-yellow-50",
    iconColor: "text-yellow-500",
    icon: "🕐",
    trend: "+5%",
    trendUp: true,
  },
  {
    key: "approved",
    label: "Approved",
    color: "bg-green-50",
    iconColor: "text-green-500",
    icon: "✅",
    trend: "+18%",
    trendUp: true,
  },
  {
    key: "delayed",
    label: "Delayed",
    color: "bg-red-50",
    iconColor: "text-red-500",
    icon: "⚠️",
    trend: "-3%",
    trendUp: false,
  },
  {
    key: "printingQueue",
    label: "Printing Queue",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
    icon: "🖨️",
    trend: "+7%",
    trendUp: true,
  },
];

const DONUT_COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/summary");
        setSummary(res.data.summary);
        setDepartmentStats(res.data.departmentStats);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const donutData = [
    { name: "Approved", value: summary.approved },
    { name: "Pending", value: summary.pending },
    { name: "Under Moderation", value: summary.underModeration },
    { name: "Delayed", value: summary.delayed },
  ];
try {
  return (

    

    
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  card.trendUp
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {card.trendUp ? "↑" : "↓"} {card.trend}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {summary[card.key]?.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Bar Chart — Department Performance */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-800">Department Performance</h2>
            <button className="text-sm text-[#7c4dff] hover:underline">
              View full report →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentStats} barCategoryGap="30%">
              <XAxis
                dataKey="departmentName"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              />
              <Bar dataKey="submitted" name="Submitted" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart — Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-6">Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-2 mt-2">
            {donutData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: DONUT_COLORS[index] }}
                  />
                  <span className="text-sm text-gray-500">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
    );
    }
    catch (err) {
  console.log(">>> DASHBOARD ERROR:", err.response?.status, err.response?.data, err.message);
  setError("Failed to load dashboard data.");
}
  
}