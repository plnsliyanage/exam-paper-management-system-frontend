import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  MdSchool,
  MdApartment,
  MdFolderOpen,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdCheckCircle,
  MdErrorOutline,
  MdInfoOutline,
  MdPerson,
  MdVerifiedUser,
} from "react-icons/md";

export default function CourseManagement({ isHod = false }) {
  const { getRole } = useAuth();
  const role = getRole();
  const isHodUser = isHod || role === "ROLE_GUEST";

  // Data state
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalDepartments: 0,
    totalPacketsLinked: 0,
    userDepartmentName: null,
  });
  const [departments, setDepartments] = useState([]);
  const [staffOptions, setStaffOptions] = useState({
    lecturers: [],
    moderators: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    departmentId: "",
    lecturerId: "",
    moderatorId: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
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
    fetchCourses();
    fetchStaffOptions();
    if (!isHodUser) {
      fetchDepartments();
    }
  }, [isHodUser]);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/courses");
      if (res.data) {
        setCourses(res.data.courses || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError(
        err.response?.data?.message || "Failed to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/courses/departments");
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  const fetchStaffOptions = async () => {
    try {
      const res = await axiosInstance.get("/courses/staff-options");
      if (res.data) {
        setStaffOptions({
          lecturers: Array.isArray(res.data.lecturers) ? res.data.lecturers : [],
          moderators: Array.isArray(res.data.moderators) ? res.data.moderators : [],
        });
      }
    } catch (err) {
      console.error("Failed to load staff options:", err);
    }
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({
      courseCode: "",
      courseName: "",
      departmentId: departments.length > 0 ? String(departments[0].id) : "",
      lecturerId: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode || "",
      courseName: course.courseName || "",
      departmentId: course.departmentId ? String(course.departmentId) : "",
      lecturerId: course.lecturerId ? String(course.lecturerId) : "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.courseCode.trim()) {
      setFormError("Course code is required.");
      return;
    }
    if (!formData.courseName.trim()) {
      setFormError("Course name is required.");
      return;
    }
    if (!isHodUser && !formData.departmentId) {
      setFormError("Please select a department.");
      return;
    }

    const codeUpper = formData.courseCode.trim().toUpperCase();
    const nameTrimmed = formData.courseName.trim().toLowerCase();
    const targetDeptId = formData.departmentId ? Number(formData.departmentId) : null;

    const isDuplicateCode = courses.some(
      (c) =>
        c.courseCode?.toUpperCase() === codeUpper &&
        (!editingCourse || c.courseId !== editingCourse.courseId)
    );
    if (isDuplicateCode) {
      setFormError(`Course code "${codeUpper}" already exists. Course codes must be unique.`);
      return;
    }

    const isDuplicateNameInDept = courses.some(
      (c) =>
        c.courseName?.trim().toLowerCase() === nameTrimmed &&
        ((targetDeptId && c.departmentId === targetDeptId) || (!targetDeptId && isHodUser)) &&
        (!editingCourse || c.courseId !== editingCourse.courseId)
    );
    if (isDuplicateNameInDept) {
      setFormError(`A course with name "${formData.courseName.trim()}" already exists in this department.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseCode: formData.courseCode.trim().toUpperCase(),
        courseName: formData.courseName.trim(),
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        lecturerId: formData.lecturerId ? Number(formData.lecturerId) : null,
      };

      if (editingCourse) {
        await axiosInstance.put(`/courses/${editingCourse.courseId}`, payload);
        showToast(`Course "${payload.courseCode}" updated successfully!`);
      } else {
        await axiosInstance.post("/courses", payload);
        showToast(`Course "${payload.courseCode}" added successfully!`);
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error("Error saving course:", err);
      setFormError(
        err.response?.data?.message ||
        "An error occurred while saving the course. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (course) => {
    setCourseToDelete(course);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await axiosInstance.delete(`/courses/${courseToDelete.courseId}`);
      showToast(`Course "${courseToDelete.courseCode}" deleted successfully!`);
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      setDeleteError(
        err.response?.data?.message ||
        "Failed to delete course. It may be linked to active exam packets."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.courseCode?.toLowerCase().includes(q) ||
        c.courseName?.toLowerCase().includes(q) ||
        c.departmentName?.toLowerCase().includes(q) ||
        c.lecturerName?.toLowerCase().includes(q) ||
        c.moderatorName?.toLowerCase().includes(q);

      const matchesDept =
        departmentFilter === "ALL" ||
        String(c.departmentId) === String(departmentFilter);

      return matchesSearch && matchesDept;
    });
  }, [courses, search, departmentFilter]);

  // Extract unique departments from courses list for filter dropdown if not fetched
  const departmentOptions = useMemo(() => {
    if (departments.length > 0) return departments;
    const map = new Map();
    courses.forEach((c) => {
      if (c.departmentId && c.departmentName) {
        map.set(c.departmentId, { id: c.departmentId, name: c.departmentName });
      }
    });
    return Array.from(map.values());
  }, [departments, courses]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Courses */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {isHodUser ? "Department Courses" : "Total Courses"}
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalCourses}
            </p>
            <p className="text-xs text-gray-400 mt-1">Active curriculum items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#7c4dff] text-2xl">
            <MdSchool />
          </div>
        </div>

        {/* Departments or Scope */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {isHodUser ? "Assigned Department" : "Total Departments"}
            </p>
            <p className="text-2xl font-bold text-gray-800 truncate max-w-[200px]">
              {isHodUser
                ? stats.userDepartmentName || "Department Assigned"
                : stats.totalDepartments}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isHodUser ? "Academic Scope" : "Academic departments"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-2xl">
            <MdApartment />
          </div>
        </div>

        {/* Linked Packets */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Linked Exam Packets
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalPacketsLinked}
            </p>
            <p className="text-xs text-gray-400 mt-1">Associated exam packets</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500 text-2xl">
            <MdFolderOpen />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 w-72 shadow-sm focus-within:border-[#7c4dff] transition">
            <MdSearch size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search code, course, staff..."
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

          {/* Department Filter (Visible only for AR / Global view) */}
          {!isHodUser && departmentOptions.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <span className="text-xs text-gray-400 font-medium">Dept:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer pr-2 font-medium"
              >
                <option value="ALL">All Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* HOD Dept Badge */}
          {isHodUser && stats.userDepartmentName && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-[#7c4dff] text-xs font-semibold rounded-xl border border-purple-100 shadow-sm">
              <MdApartment size={14} />
              {stats.userDepartmentName}
            </span>
          )}
        </div>

        {/* Add Course Button */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-[#7c4dff] hover:bg-[#6a3df0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition cursor-pointer shrink-0"
        >
          <MdAdd size={18} />
          <span>Add Course</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
            <div className="w-8 h-8 border-4 border-[#7c4dff] border-t-transparent rounded-full animate-spin mb-3"></div>
            Loading courses...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500 text-sm gap-2">
            <MdErrorOutline size={32} />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Course Name
                  </th>
                  {!isHodUser && (
                    <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                      Department
                    </th>
                  )}
                  <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Assigned Lecturer
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Assigned Moderator
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Packets
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isHodUser ? 6 : 7}
                      className="text-center text-gray-400 text-sm py-16"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <MdSchool size={40} className="text-gray-300 mb-1" />
                        <p className="font-medium text-gray-600">No courses found</p>
                        <p className="text-xs text-gray-400">
                          {search
                            ? "Try refining your search query."
                            : "Click '+ Add Course' to create your first course unit."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr
                      key={c.courseId}
                      className="hover:bg-gray-50/80 transition group"
                    >
                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-purple-50 text-[#7c4dff] font-bold text-xs rounded-lg border border-purple-100/80 font-mono tracking-wide">
                          {c.courseCode}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">
                          {c.courseName}
                        </p>
                      </td>

                      {/* Department (for AR) */}
                      {!isHodUser && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-100 px-2.5 py-1 rounded-md">
                            <MdApartment size={13} className="text-gray-400" />
                            {c.departmentName || "Unassigned"}
                          </span>
                        </td>
                      )}

                      {/* Lecturer */}
                      <td className="px-6 py-4">
                        {c.lecturerName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                              {c.lecturerName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {c.lecturerName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Moderator */}
                      <td className="px-6 py-4">
                        {c.moderatorName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                              {c.moderatorName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {c.moderatorName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Linked Packets */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.activePacketsCount > 0
                              ? "bg-purple-50 text-[#7c4dff]"
                              : "bg-gray-100 text-gray-400"
                            }`}
                        >
                          {c.activePacketsCount}{" "}
                          {c.activePacketsCount === 1 ? "packet" : "packets"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-gray-400 hover:text-[#7c4dff] hover:bg-purple-50 rounded-lg transition"
                            title="Edit course & staff assignments"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteDialog(c)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete course"
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
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">
                {editingCourse ? "Edit Course & Staff" : "Add New Course Unit"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <MdErrorOutline size={16} className="shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Course Code & Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Course Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Course Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS3012"
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        courseCode: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition"
                    autoFocus
                  />
                </div>

                {/* Course Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Database Systems"
                    value={formData.courseName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        courseName: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Department selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                {isHodUser ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600">
                    <MdApartment className="text-gray-400" />
                    <span>
                      {stats.userDepartmentName || "Your Department"}
                    </span>
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md ml-auto font-medium">
                      Auto Assigned
                    </span>
                  </div>
                ) : (
                  <select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        departmentId: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {departmentOptions.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Assign Lecturer */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MdPerson className="text-blue-500" />
                  <span>Assign Lecturer</span>
                </label>
                <select
                  value={formData.lecturerId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lecturerId: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition cursor-pointer"
                >
                  <option value="">-- Leave Unassigned --</option>
                  {staffOptions.lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name} (@{lec.username})
                    </option>
                  ))}
                </select>
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#7c4dff] hover:bg-[#6a3df0] disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-2xl mx-auto">
              <MdDeleteOutline />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-800">
                Delete Course Unit?
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800 font-mono">
                  {courseToDelete.courseCode}
                </span>{" "}
                ({courseToDelete.courseName})?
              </p>
              {courseToDelete.activePacketsCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2 text-left mt-2">
                  <MdInfoOutline
                    size={16}
                    className="shrink-0 text-amber-600 mt-0.5"
                  />
                  <span>
                    Warning: This course is currently linked to{" "}
                    <strong>{courseToDelete.activePacketsCount}</strong> exam
                    packet(s). Deletion will be rejected by the server to preserve
                    data integrity.
                  </span>
                </div>
              )}
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <MdErrorOutline
                  size={16}
                  className="shrink-0 text-red-500 mt-0.5"
                />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
