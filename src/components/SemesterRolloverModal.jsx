import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAcademicCycle } from "../context/AcademicCycleContext";
import {
  MdClose,
  MdCalendarMonth,
  MdArrowForward,
  MdArrowBack,
  MdCheckCircle,
  MdLayers,
  MdSearch,
} from "react-icons/md";


export default function SemesterRolloverModal({ isOpen, onClose, onSuccess }) {
  const { cycles, refreshCycles, selectCycle } = useAcademicCycle();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [staffOptions, setStaffOptions] = useState({ lecturers: [], moderators: [] });

  // Step 1 Form Data
  const [targetAcademicYear, setTargetAcademicYear] = useState("");
  const [targetSemester, setTargetSemester] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sourceCycleId, setSourceCycleId] = useState("");
  const [keepStaffAssignments, setKeepStaffAssignments] = useState(true);
  const [autoShiftDeadlines, setAutoShiftDeadlines] = useState(true);

  // Step 2 Preview & Overrides
  const [previewItems, setPreviewItems] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState(new Set());
  const [staffOverrides, setStaffOverrides] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Result state
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError("");
      setExecutionResult(null);
      return;
    }

    // Initialize default target year & dates
    const now = new Date();
    const currentYear = now.getFullYear();
    setTargetAcademicYear(`${currentYear}/${currentYear + 1}`);

    // Default start/end dates
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 6, 0);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);

    // Choose recommended source cycle (e.g. matching semester from previous year or latest cycle)
    if (cycles && cycles.length > 0) {
      const active = cycles.find((c) => c.status === "ACTIVE") || cycles[0];
      setSourceCycleId(active ? active.cycleId : "");
    }

    // Fetch staff options for dropdown overrides
    axiosInstance
      .get("/courses/staff-options")
      .then((res) => {
        if (res.data) setStaffOptions(res.data);
      })
      .catch((err) => console.error("Failed to load staff options:", err));
  }, [isOpen, cycles]);

  if (!isOpen) return null;

  const handleFetchPreview = async () => {
    if (!targetAcademicYear || !targetAcademicYear.trim()) {
      setError("Please enter a target academic year (e.g. 2026/2027)");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select valid start and end dates");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        sourceCycleId: sourceCycleId || null,
        targetAcademicYear: targetAcademicYear.trim(),
        targetSemester: Number(targetSemester),
        startDate,
        endDate,
        keepStaffAssignments,
        autoShiftDeadlines,
      };

      const res = await axiosInstance.post("/cycles/rollover/preview", payload);
      const items = res.data.items || [];
      setPreviewItems(items);

      // Select all courses by default
      const allIds = new Set(items.map((i) => i.courseId));
      setSelectedCourseIds(allIds);

      // Initialize overrides from preview
      const initialOverrides = {};
      items.forEach((item) => {
        initialOverrides[item.courseId] = {
          courseId: item.courseId,
          lecturerId: item.lecturerId || null,
          moderatorId: item.moderatorId || null,
          customDeadline: item.calculatedDeadline || "",
          customModerationDeadline: item.calculatedModerationDeadline || "",
        };
      });
      setStaffOverrides(initialOverrides);

      setStep(2);
    } catch (err) {
      console.error("Preview failed:", err);
      setError(err.response?.data?.message || "Failed to generate rollover preview.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseSelect = (courseId) => {
    const updated = new Set(selectedCourseIds);
    if (updated.has(courseId)) {
      updated.delete(courseId);
    } else {
      updated.add(courseId);
    }
    setSelectedCourseIds(updated);
  };

  const toggleSelectAll = () => {
    if (selectedCourseIds.size === previewItems.length) {
      setSelectedCourseIds(new Set());
    } else {
      setSelectedCourseIds(new Set(previewItems.map((i) => i.courseId)));
    }
  };

  const handleOverrideChange = (courseId, field, value) => {
    setStaffOverrides((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value === "" ? null : value,
      },
    }));
  };

  const handleExecuteRollover = async () => {
    if (selectedCourseIds.size === 0) {
      setError("Please select at least one course to roll over.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const overridesList = Array.from(selectedCourseIds).map((cid) => staffOverrides[cid] || { courseId: cid });

      const payload = {
        sourceCycleId: sourceCycleId || null,
        targetAcademicYear: targetAcademicYear.trim(),
        targetSemester: Number(targetSemester),
        startDate,
        endDate,
        keepStaffAssignments,
        autoShiftDeadlines,
        includedCourseIds: Array.from(selectedCourseIds),
        staffOverrides: overridesList,
      };

      const res = await axiosInstance.post("/cycles/rollover/execute", payload);
      setExecutionResult(res.data);
      setStep(3);

      await refreshCycles();
      if (res.data.cycleId) {
        selectCycle(res.data.cycleId);
      }
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      console.error("Rollover execution failed:", err);
      setError(err.response?.data?.message || "Failed to execute semester rollover.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPreviewItems = previewItems.filter(
    (i) =>
      i.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c4dff] text-white flex items-center justify-center shadow-md shadow-purple-200">
              <MdCalendarMonth size={22} />
            </div>
            <div>

              <h2 className="text-base font-bold text-gray-800">
                Semester Rollover & Automated Setup
              </h2>
              <p className="text-xs text-gray-500">
                Clone previous semester courses, staff allocations, and deadlines in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-[#7c4dff] text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "text-gray-900 font-semibold" : "text-gray-400"}>
              Cycle Configuration
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-[#7c4dff] text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "text-gray-900 font-semibold" : "text-gray-400"}>
              Preview & Quick Edits
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "text-gray-900 font-semibold" : "text-gray-400"}>
              Launch Completed
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold text-red-500 hover:text-red-700 ml-3">
              ×
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: CONFIGURE TARGET CYCLE & SOURCE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetAcademicYear}
                    onChange={(e) => setTargetAcademicYear(e.target.value)}
                    placeholder="e.g. 2026/2027"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setTargetSemester(sem)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition border ${
                          targetSemester === sem
                            ? "bg-[#7c4dff] text-white border-[#7c4dff] shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        Semester {sem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Semester Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Semester End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Source Cycle Selection */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                  <MdLayers size={16} />
                  <span>Clone / Rollover Source</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Previous Semester or Master Template to Clone
                  </label>
                  <select
                    value={sourceCycleId}
                    onChange={(e) => setSourceCycleId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#7c4dff] transition"
                  >
                    <option value="">Master Course Catalog (Default Curriculum)</option>
                    {cycles.map((c) => (
                      <option key={c.cycleId} value={c.cycleId}>
                        {c.cycleName || c.cycleId} {c.status === "ACTIVE" ? "(Current Active)" : `(${c.status})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={keepStaffAssignments}
                      onChange={(e) => setKeepStaffAssignments(e.target.checked)}
                      className="w-4 h-4 text-[#7c4dff] rounded focus:ring-purple-400 accent-[#7c4dff]"
                    />
                    <span>
                      <strong>Keep Staff Assignments:</strong> Retain previously assigned Lecturers and Moderators
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={autoShiftDeadlines}
                      onChange={(e) => setAutoShiftDeadlines(e.target.checked)}
                      className="w-4 h-4 text-[#7c4dff] rounded focus:ring-purple-400 accent-[#7c4dff]"
                    />
                    <span>
                      <strong>Auto-Shift Deadlines:</strong> Automatically adjust submission & moderation dates based on new semester start
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & LIVE EDIT GRID */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700">
                    {selectedCourseIds.size} of {previewItems.length} courses selected
                  </span>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs text-[#7c4dff] hover:underline font-medium"
                  >
                    {selectedCourseIds.size === previewItems.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="relative w-64">
                  <MdSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses or depts..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:border-[#7c4dff]"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.size === previewItems.length && previewItems.length > 0}
                          onChange={toggleSelectAll}
                          className="accent-[#7c4dff]"
                        />
                      </th>
                      <th className="p-3 font-semibold text-gray-600">Course</th>
                      <th className="p-3 font-semibold text-gray-600">Department</th>
                      <th className="p-3 font-semibold text-gray-600">Assigned Lecturer</th>
                      <th className="p-3 font-semibold text-gray-600">Assigned Moderator</th>
                      <th className="p-3 font-semibold text-gray-600">Submission Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPreviewItems.map((item) => {
                      const isSelected = selectedCourseIds.has(item.courseId);
                      const currentOverride = staffOverrides[item.courseId] || {};

                      return (
                        <tr
                          key={item.courseId}
                          className={`hover:bg-purple-50/40 transition ${isSelected ? "bg-white" : "bg-gray-50/60 opacity-60"}`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCourseSelect(item.courseId)}
                              className="accent-[#7c4dff]"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-[#7c4dff]">{item.courseCode}</p>
                            <p className="text-gray-600 truncate max-w-[160px]" title={item.courseName}>
                              {item.courseName}
                            </p>
                          </td>
                          <td className="p-3 text-gray-500 whitespace-nowrap">{item.departmentName}</td>
                          <td className="p-3">
                            <select
                              value={currentOverride.lecturerId || ""}
                              onChange={(e) =>
                                handleOverrideChange(
                                  item.courseId,
                                  "lecturerId",
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              disabled={!isSelected}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs outline-none focus:border-[#7c4dff] max-w-[140px] truncate"
                            >
                              <option value="">Unassigned</option>
                              {staffOptions.lecturers.map((lec) => (
                                <option key={lec.id} value={lec.id}>
                                  {lec.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={currentOverride.moderatorId || ""}
                              onChange={(e) =>
                                handleOverrideChange(
                                  item.courseId,
                                  "moderatorId",
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              disabled={!isSelected}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs outline-none focus:border-[#7c4dff] max-w-[140px] truncate"
                            >
                              <option value="">Unassigned</option>
                              {staffOptions.moderators.map((mod) => (
                                <option key={mod.id} value={mod.id}>
                                  {mod.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="date"
                              value={currentOverride.customDeadline || ""}
                              onChange={(e) =>
                                handleOverrideChange(item.courseId, "customDeadline", e.target.value)
                              }
                              disabled={!isSelected}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs outline-none focus:border-[#7c4dff]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: EXECUTION SUCCESS */}
          {step === 3 && executionResult && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
                <MdCheckCircle size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {executionResult.cycleName} Initialized Successfully!
                </h3>
                <p className="text-sm text-gray-500 mt-1">{executionResult.message}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#7c4dff]">{executionResult.createdPacketsCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Exam Packets Created</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{executionResult.assignedLecturersCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Lecturers Assigned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{executionResult.assignedModeratorsCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Moderators Assigned</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={loading}
                className="px-5 py-2.5 bg-[#7c4dff] hover:bg-[#6b3fd4] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-purple-200 transition disabled:opacity-50"
              >
                {loading ? "Analyzing Catalog..." : "Generate Preview & Review"}
                <MdArrowForward size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 flex items-center gap-1.5 transition"
              >
                <MdArrowBack size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteRollover}
                disabled={loading || selectedCourseIds.size === 0}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-green-200 transition disabled:opacity-50"
              >
                {loading
                  ? "Rolling Over & Creating Packets..."
                  : `Confirm & Launch Semester (${selectedCourseIds.size} Courses)`}
              </button>

            </>
          )}

          {step === 3 && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#7c4dff] hover:bg-[#6b3fd4] text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-200 transition"
              >
                View New Semester Packets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
