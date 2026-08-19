import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const ROLE_BADGE_COLORS = {
  ROLE_ADMIN: "bg-blue-100 text-blue-700",
  ROLE_GUEST: "bg-green-100 text-green-700",
  ROLE_USER: "bg-purple-100 text-purple-700",
  ROLE_MODERATOR: "bg-yellow-100 text-yellow-700",
};

const ROLE_FILTER_LABELS = {
  ALL: "All Roles",
  ROLE_ADMIN: "AR",
  ROLE_GUEST: "HOD",
  ROLE_USER: "Lecturer",
  ROLE_MODERATOR: "Moderator",
};

export default function UserManagement() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/users");
      setData(res.data);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await axiosInstance.delete(`/users/${userId}`);
    setData((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.userId !== userId),
    }));
  };

  const handleToggleActive = async (userId) => {
    await axiosInstance.put(`/users/${userId}/toggle-active`);
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.userId === userId ? { ...u, isActive: !u.isActive } : u
      ),
    }));
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading users...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>;

  const { stats, users } = data;

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchSearch = !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const statsCards = [
    { value: stats.totalUsers, label: "Total Users", color: "text-blue-500", bg: "bg-blue-50" },
    { value: stats.lecturers, label: "Lecturers", color: "text-blue-500", bg: "bg-blue-50" },
    { value: stats.moderators, label: "Moderators", color: "text-yellow-500", bg: "bg-yellow-50" },
    { value: stats.activeUsers, label: "Active Users", color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-5">

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`text-xl ${card.color}`}>👤</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{card.value}</p>
            <p className="text-sm text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filters + add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-64">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-gray-600 w-full"
            />
          </div>

          {/* Role filter tabs */}
          {Object.entries(ROLE_FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRoleFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                roleFilter === key
                  ? "bg-[#7c4dff] text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="bg-[#7c4dff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6a3df0] transition">
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["User", "Role", "Department", "Status", "Last Login", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 text-sm py-12">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.userId} className="border-b border-gray-50 hover:bg-gray-50 transition">

                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${u.avatarColor} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                        {u.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_BADGE_COLORS[u.role] || "bg-gray-100 text-gray-500"}`}>
                      {u.roleLabel}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-sm text-gray-600">{u.department}</td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className={`text-sm ${u.isActive ? "text-green-600" : "text-gray-400"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* Last Login */}
                  <td className="px-6 py-4 text-sm text-gray-500">{u.lastLogin}</td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-blue-400 hover:text-blue-600 transition text-lg">✏️</button>
                      <button
                        onClick={() => handleToggleActive(u.userId)}
                        className={`transition text-lg ${u.isActive ? "text-gray-400 hover:text-gray-600" : "text-green-400 hover:text-green-600"}`}
                        title={u.isActive ? "Deactivate" : "Activate"}
                      >
                        🛡
                      </button>
                      <button
                        onClick={() => handleDelete(u.userId)}
                        className="text-red-400 hover:text-red-600 transition text-lg"
                      >
                        🗑
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}