import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MdApartment,
  MdPerson,
  MdSchool,
  MdPeople,
  MdFolderOpen,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdCheckCircle,
  MdErrorOutline,
  MdInfoOutline,
  MdArrowForward,
  MdEmail,
} from "react-icons/md";

export default function DepartmentManagement({ isHod = false }) {
  const { getRole } = useAuth();
  const role = getRole();
  const isHodUser = isHod || role === "ROLE_GUEST";
  const navigate = useNavigate();

  // Data state
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalHODsAssigned: 0,
    totalFacultyCourses: 0,
    totalFacultyStaff: 0,
    userDepartmentName: null,
  });
  const [eligibleHods, setEligibleHods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search state
  const [search, setSearch] = useState("");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    departmentName: "",
    hodUserId: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    // Dispatch global event for header notification bell badge update
    window.dispatchEvent(new Event("notificationsUpdated"));
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    fetchDepartments();
    if (!isHodUser) {
      fetchEligibleHods();
    }
  }, [isHodUser]);

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/departments");
      if (res.data) {
        setDepartments(res.data.departments || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError(
        err.response?.data?.message || "Failed to load departments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleHods = async () => {
    try {
      const res = await axiosInstance.get("/departments/eligible-hods");
      setEligibleHods(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load eligible HODs:", err);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingDepartment(null);
    setFormData({
      departmentName: "",
      hodUserId: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (dept) => {
    setEditingDepartment(dept);
    setFormData({
      departmentName: dept.departmentName || "",
      hodUserId: dept.hodUserId ? String(dept.hodUserId) : "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Save Department (Create or Update)
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.departmentName.trim()) {
      setFormError("Department name is required.");
      return;
    }

    const deptNameTrimmed = formData.departmentName.trim().toLowerCase();
    const isDuplicate = departments.some(
      (d) =>
        d.departmentName?.trim().toLowerCase() === deptNameTrimmed &&
        (!editingDepartment || d.departmentId !== editingDepartment.departmentId)
    );
    if (isDuplicate) {
      setFormError(`Department name "${formData.departmentName.trim()}" already exists.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        departmentName: formData.departmentName.trim(),
        hodUserId: formData.hodUserId ? Number(formData.hodUserId) : null,
      };

      if (editingDepartment) {
        await axiosInstance.put(`/departments/${editingDepartment.departmentId}`, payload);
        showToast(`Department "${payload.departmentName}" updated successfully!`);
      } else {
        await axiosInstance.post("/departments", payload);
        showToast(`Department "${payload.departmentName}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchDepartments();
      fetchEligibleHods();
    } catch (err) {
      console.error("Error saving department:", err);
      setFormError(
        err.response?.data?.message ||
        "An error occurred while saving the department. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDeleteDialog = (dept) => {
    setDeptToDelete(dept);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await axiosInstance.delete(`/departments/${deptToDelete.departmentId}`);
      showToast(`Department "${deptToDelete.departmentName}" deleted successfully!`);
      setDeleteModalOpen(false);
      setDeptToDelete(null);
      fetchDepartments();
      fetchEligibleHods();
    } catch (err) {
      console.error("Error deleting department:", err);
      setDeleteError(
        err.response?.data?.message ||
        "Failed to delete department. Ensure all courses and staff are reallocated first."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Filtered departments for search
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const q = search.toLowerCase();
      return (
        !search ||
        d.departmentName?.toLowerCase().includes(q) ||
        d.hodFullName?.toLowerCase().includes(q) ||
        d.hodUsername?.toLowerCase().includes(q)
      );
    });
  }, [departments, search]);

  // HOD specific single department profile view
  const currentHodDepartment = departments.length > 0 ? departments[0] : null;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border transition-all animate-bounce ${toast.type === "success"
              ? "bg-white border-green-200 text-green-800"
              : "bg-white border-red-200 text-red-800"
            }`}
        >
          {toast.type === "success" ? (
            <MdCheckCircle className="text-green-500 text-xl" />
          ) : (
            <MdErrorOutline className="text-red-500 text-xl" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 text-sm ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Departments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {isHodUser ? "My Department" : "Total Departments"}
            </p>
            <p className="text-2xl font-bold text-gray-800 truncate max-w-[180px]">
              {isHodUser
                ? stats.userDepartmentName || "Department Assigned"
                : stats.totalDepartments}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isHodUser ? "Academic Scope" : "Academic units registered"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#7c4dff] text-2xl">
            <MdApartment />
          </div>
        </div>

        {/* Assigned HODs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {isHodUser ? "Department Head" : "Assigned HODs"}
            </p>
            <p className="text-2xl font-bold text-gray-800 truncate max-w-[180px]">
              {isHodUser
                ? currentHodDepartment?.hodFullName || "You (HOD)"
                : `${stats.totalHODsAssigned} / ${stats.totalDepartments}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isHodUser ? "Current Leadership" : "Departments with assigned HOD"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-2xl">
            <MdPerson />
          </div>
        </div>

        {/* Faculty Courses */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {isHodUser ? "Dept Courses" : "Total Courses"}
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {isHodUser
                ? currentHodDepartment?.totalCourses || 0
                : stats.totalFacultyCourses}
            </p>
            <p className="text-xs text-gray-400 mt-1">Curriculum subjects</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 text-2xl">
            <MdSchool />
          </div>
        </div>

        {/* Academic Staff */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {isHodUser ? "Dept Staff" : "Total Staff"}
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {isHodUser
                ? currentHodDepartment?.totalLecturers || 0
                : stats.totalFacultyStaff}
            </p>
            <p className="text-xs text-gray-400 mt-1">Lecturers & Moderators</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 text-2xl">
            <MdPeople />
          </div>
        </div>
      </div>

      {/* Control Bar (AR View) */}
      {!isHodUser && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 w-80 shadow-sm focus-within:border-[#7c4dff] transition">
            <MdSearch size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search departments, HODs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none text-gray-700 w-full placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Add Department Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 bg-[#7c4dff] hover:bg-[#6a3df0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition cursor-pointer shrink-0"
          >
            <MdAdd size={18} />
            <span>Add Department</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-8 h-8 border-4 border-[#7c4dff] border-t-transparent rounded-full animate-spin mb-3"></div>
          Loading departments...
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-red-500 text-sm gap-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <MdErrorOutline size={32} />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchDepartments}
            className="mt-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition"
          >
            Retry
          </button>
        </div>
      ) : isHodUser ? (
        /* HOD Department Profile View */
        <div className="space-y-6">
          {currentHodDepartment ? (
            <>
              {/* Department Overview Banner */}
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#7c4dff] text-white text-xs font-semibold rounded-lg uppercase tracking-wider">
                      Department Profile
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    {currentHodDepartment.departmentName}
                  </h2>
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <MdPerson className="text-[#7c4dff]" />
                    Head of Department:{" "}
                    <span className="font-semibold text-white">
                      {currentHodDepartment.hodFullName || "You"}
                    </span>
                  </p>
                </div>

                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/hod/courses")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition cursor-pointer"
                  >
                    <MdSchool size={18} />
                    <span>View Courses ({currentHodDepartment.totalCourses})</span>
                    <MdArrowForward size={14} />
                  </button>
                  <button
                    onClick={() => navigate("/hod/packets")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#7c4dff] hover:bg-[#6a3df0] rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    <MdFolderOpen size={18} />
                    <span>View Packets ({currentHodDepartment.activePacketsCount})</span>
                    <MdArrowForward size={14} />
                  </button>
                </div>
              </div>

              {/* Department Staff List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      Academic Staff Directory
                    </h3>
                    <p className="text-xs text-gray-400">
                      Lecturers and moderators assigned to {currentHodDepartment.departmentName}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-purple-50 text-[#7c4dff] text-xs font-bold rounded-lg">
                    {currentHodDepartment.staff?.length || 0} Staff Members
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {!currentHodDepartment.staff || currentHodDepartment.staff.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-gray-400 text-sm py-12">
                            No staff members assigned to this department yet.
                          </td>
                        </tr>
                      ) : (
                        currentHodDepartment.staff.map((s, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7c4dff] flex items-center justify-center text-xs font-bold">
                                  {s.fullName?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {s.fullName}
                                  </p>
                                  <p className="text-xs text-gray-400">@{s.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <MdEmail className="text-gray-400" />
                                <span>{s.email || "—"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.role === "ROLE_MODERATOR"
                                    ? "bg-amber-50 text-amber-700"
                                    : s.role === "ROLE_USER"
                                      ? "bg-purple-50 text-[#7c4dff]"
                                      : "bg-blue-50 text-blue-700"
                                  }`}
                              >
                                {s.role === "ROLE_USER"
                                  ? "Lecturer"
                                  : s.role === "ROLE_MODERATOR"
                                    ? "Moderator"
                                    : s.role === "ROLE_GUEST"
                                      ? "HOD"
                                      : "Admin"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              No department assigned to your account. Please contact the Assistant Registrar.
            </div>
          )}
        </div>
      ) : (
        /* AR Departments Table */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Head of Department (HOD)
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Academic Staff
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Active Packets
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 text-sm py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <MdApartment size={40} className="text-gray-300 mb-1" />
                        <p className="font-medium text-gray-600">No departments found</p>
                        <p className="text-xs text-gray-400">
                          {search
                            ? "Try adjusting your search criteria."
                            : "Click '+ Add Department' to create the first department."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((d) => (
                    <tr key={d.departmentId} className="hover:bg-gray-50/80 transition group">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7c4dff] flex items-center justify-center text-lg shrink-0">
                            <MdApartment />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {d.departmentName}
                            </p>
                            <p className="text-xs text-gray-400">ID: #{d.departmentId}</p>
                          </div>
                        </div>
                      </td>

                      {/* HOD */}
                      <td className="px-6 py-4">
                        {d.hodFullName ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {d.hodFullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 leading-tight">
                                {d.hodFullName}
                              </p>
                              <p className="text-xs text-gray-400">@{d.hodUsername}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
                            <MdInfoOutline size={12} />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Courses */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {d.totalCourses} {d.totalCourses === 1 ? "course" : "courses"}
                        </span>
                      </td>

                      {/* Staff */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          {d.totalLecturers} staff
                        </span>
                      </td>

                      {/* Active Packets */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${d.activePacketsCount > 0
                              ? "bg-purple-50 text-[#7c4dff]"
                              : "bg-gray-100 text-gray-400"
                            }`}
                        >
                          {d.activePacketsCount} packets
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            className="p-1.5 text-gray-400 hover:text-[#7c4dff] hover:bg-purple-50 rounded-lg transition"
                            title="Edit department"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(d)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete department"
                          >
                            <MdDeleteOutline size={18} />
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
      )}

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <MdErrorOutline size={16} className="shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Department Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Department of Computer Science & Engineering"
                  value={formData.departmentName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      departmentName: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition"
                  autoFocus
                />
              </div>

              {/* Assign HOD */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Assign Head of Department (HOD)
                </label>
                <select
                  value={formData.hodUserId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hodUserId: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition cursor-pointer"
                >
                  <option value="">-- Leave Unassigned --</option>
                  {eligibleHods.map((hod) => {
                    const isAssignedHere =
                      editingDepartment &&
                      hod.currentDepartmentId === editingDepartment.departmentId;
                    return (
                      <option key={hod.userId} value={hod.userId}>
                        {hod.fullName} (@{hod.username}){" "}
                        {isAssignedHere
                          ? "(Current HOD)"
                          : hod.currentDepartmentName !== "Unassigned"
                            ? `(Currently assigned to ${hod.currentDepartmentName})`
                            : ""}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Users registered with role <strong>Head of Dept (ROLE_GUEST)</strong> are listed here.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#7c4dff] hover:bg-[#6a3df0] disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingDepartment ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-2xl mx-auto">
              <MdDeleteOutline />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-800">
                Delete Department?
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deptToDelete.departmentName}
                </span>
                ?
              </p>
              {(deptToDelete.totalCourses > 0 ||
                deptToDelete.totalLecturers > 0 ||
                deptToDelete.activePacketsCount > 0) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-start gap-2 text-left mt-2">
                    <MdInfoOutline size={16} className="shrink-0 text-blue-600 mt-0.5" />
                    <span>
                      Note: Deleting this department will safely set any linked{" "}
                      <strong>{deptToDelete.totalCourses} course(s)</strong> and{" "}
                      <strong>{deptToDelete.totalLecturers} staff member(s)</strong> to{" "}
                      <em>Unassigned</em>. No courses or user accounts will be lost.
                    </span>
                  </div>
                )}
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <MdErrorOutline size={16} className="shrink-0 text-red-500 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
