import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

export default function AddPacket() {
  const { id } = useParams(); // if editing
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    courseId: "", lecturerId: "", moderatorId: "", statusId: "",
    deadline: "", moderationDeadline: "", examDate: "",
    duration: "", totalMarks: "", questions: "", format: "", moderatorNote: "",
  });

  const [dropdowns, setDropdowns] = useState({
    courses: [], moderators: [], statuses: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role && role !== "ROLE_SYSTEM_ADMIN") {
      navigate("/packets", { replace: true });
      return;
    }

    // Load dropdown data
    axiosInstance.get("/form-data").then(res => {
      setDropdowns(res.data);
    }).catch(() => {});

    // If editing, load existing packet
    if (isEdit) {
      axiosInstance.get(`/packets/${id}`).then(res => {
        const p = res.data;
        setFormData({
          courseId: p.courseId || "",
          lecturerId: p.lecturerId || "",
          moderatorId: p.moderatorId || "",
          statusId: p.statusId || "",
          deadline: p.deadline || "",
          moderationDeadline: p.moderationDeadline || "",
          examDate: p.examDate || "",
          duration: p.duration || "",
          totalMarks: p.totalMarks || "",
          questions: p.questions || "",
          format: p.format || "",
          moderatorNote: p.moderatorNote || "",
        });
      }).catch(() => {});
    }
  }, [id, isEdit, role, navigate]);

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    const selectedCourse = dropdowns.courses.find(c => String(c.id) === String(selectedCourseId));
    setFormData(prev => ({
      ...prev,
      courseId: selectedCourseId,
      lecturerId: selectedCourse?.lecturerId ? String(selectedCourse.lecturerId) : "",
    }));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedCourse = dropdowns.courses.find(c => String(c.id) === String(formData.courseId));
  const assignedLecturerName = selectedCourse?.lecturerName || "Unassigned";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit) {
      const selected = dropdowns.courses.find(c => String(c.id) === String(formData.courseId));
      if (selected && selected.hasPacket) {
        setError(`An exam packet already exists for course ${selected.code}. Please update the existing packet.`);
        return;
      }
    }

    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/packets/${id}`, formData);
      } else {
        await axiosInstance.post("/packets", formData);
      }
      navigate("/packets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save packet. Check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7c4dff] focus:ring-1 focus:ring-[#7c4dff] bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Packet" : "Add New Packet"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit ? "Update packet details" : "Create a new exam packet"}
          </p>
        </div>
        <button
          onClick={() => navigate("/packets")}
          className="text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2"
        >
          ← Back to Packets
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Course & Assignment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Course & Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Dropdown */}
            <div>
              <label className={labelClass}>Course</label>
              <select name="courseId" value={formData.courseId} onChange={handleCourseChange} className={inputClass} required>
                <option value="">Select course</option>
                {dropdowns.courses.map(c => {
                  const isTaken = !isEdit && c.hasPacket;
                  return (
                    <option key={c.id} value={c.id} disabled={isTaken}>
                      {c.code} — {c.name} {isTaken ? " (Packet already exists)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Auto-Assigned Lecturer (from Course) */}
            <div>
              <label className={labelClass}>Course Lecturer</label>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 flex items-center justify-between">
                <span className="font-medium truncate">{assignedLecturerName}</span>
                <span className="text-[11px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-semibold shrink-0 ml-2">
                  Auto from Course
                </span>
              </div>
            </div>

            {/* Assign Moderator */}
            <div>
              <label className={labelClass}>Assign Moderator</label>
              <select name="moderatorId" value={formData.moderatorId} onChange={handleChange} className={inputClass} required>
                <option value="">Select moderator</option>
                {dropdowns.moderators?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Submission Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Moderation Deadline</label>
              <input type="date" name="moderationDeadline" value={formData.moderationDeadline} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Exam Date</label>
              <input type="date" name="examDate" value={formData.examDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Exam Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Exam Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 3 Hours" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Total Marks</label>
              <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleChange} placeholder="e.g. 100" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Questions</label>
              <input type="text" name="questions" value={formData.questions} onChange={handleChange} placeholder="e.g. 7 sections, 40 questions" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Format</label>
              <input type="text" name="format" value={formData.format} onChange={handleChange} placeholder="e.g. Open Book Allowed" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Status & Notes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Status & Notes</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Status</label>
              <select name="statusId" value={formData.statusId} onChange={handleChange} className={inputClass} required>
                <option value="">Select status</option>
                {dropdowns.statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Moderator Note</label>
              <textarea
                name="moderatorNote"
                value={formData.moderatorNote}
                onChange={handleChange}
                placeholder="Optional note from moderator..."
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/packets")}
            className="px-5 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-[#7c4dff] rounded-lg hover:bg-[#6a3df0] disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : isEdit ? "Update Packet" : "Create Packet"}
          </button>
        </div>
      </form>
    </div>
  );
}