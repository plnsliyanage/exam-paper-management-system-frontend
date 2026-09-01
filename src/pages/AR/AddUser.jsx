import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const ROLE_OPTIONS = [
  { value: "ROLE_ADMIN", label: "Asst. Registrar (AR)" },
  { value: "ROLE_GUEST", label: "Head of Department (HOD)" },
  { value: "ROLE_USER", label: "Lecturer" },
  { value: "ROLE_MODERATOR", label: "Moderator" },
];

export default function AddUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ROLE_USER",
    departmentId: "",
    isActive: true,
  });

  useEffect(() => {
    // Load departments
    axiosInstance.get("/users/departments").then(res => {
      setDepartments(res.data);
    });

    // If editing, load user data
    if (isEdit) {
      axiosInstance.get("/users").then(res => {
        const user = res.data.users.find(u => u.userId === parseInt(id));
        if (user) {
          setForm(prev => ({
            ...prev,
            fullName: user.fullName || "",
            email: user.email || "",
            role: user.role || "ROLE_USER",
            isActive: user.isActive,
          }));
        }
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isEdit && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/users/${id}`, {
          fullName: form.fullName,
          email: form.email,
          role: form.role,
          departmentId: form.departmentId || null,
          isActive: form.isActive,
          password: form.password || null,
        });
      } else {
        await axiosInstance.post("/users", {
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          departmentId: form.departmentId || null,
        });
      }
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7c4dff] focus:ring-1 focus:ring-[#7c4dff] bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit User" : "Add New User"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit ? "Update user details" : "Create a new system user"}
          </p>
        </div>
        <button
          onClick={() => navigate("/users")}
          className="text-sm text-gray-500 hover:text-[#7c4dff] bg-white border border-gray-200 hover:border-[#7c4dff] rounded-lg px-4 py-2 transition"
        >
          ← Back to Users
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Full Name</label>
              <input
                type="text" name="fullName" value={form.fullName}
                onChange={handleChange} required
                placeholder="e.g. Dr. Sarah Mitchell"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange}
                placeholder="e.g. sarah@univ.edu.my"
                className={inputClass}
              />
            </div>
            {!isEdit && (
              <div>
                <label className={labelClass}>Username</label>
                <input
                  type="text" name="username" value={form.username}
                  onChange={handleChange} required
                  placeholder="e.g. sarah"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </div>

        {/* Role & Department */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Role & Department</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Role</label>
              <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
                {ROLE_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange} className={inputClass}>
                <option value="">— No Department —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            {isEdit && (
              <div className="col-span-2 flex items-center gap-3">
                <input
                  type="checkbox" name="isActive" id="isActive"
                  checked={form.isActive} onChange={handleChange}
                  className="w-4 h-4 accent-[#7c4dff]"
                />
                <label htmlFor="isActive" className="text-sm text-gray-600">
                  User is active
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            {isEdit ? "Reset Password" : "Password"}
          </h2>
          {isEdit && (
            <p className="text-xs text-gray-400 mb-4">
              Leave blank to keep the current password.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {isEdit ? "New Password" : "Password"}
              </label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange}
                required={!isEdit}
                placeholder={isEdit ? "Leave blank to keep current" : "Min. 6 characters"}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange}
                required={!isEdit}
                placeholder="Repeat password"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-5 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-[#7c4dff] rounded-lg hover:bg-[#6a3df0] disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}