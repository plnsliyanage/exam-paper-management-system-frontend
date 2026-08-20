import React, { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Users,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileText,
  Filter,
  X,
  Printer,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function HodReportsPage() {
  const [reportType, setReportType] = useState("overall");
  const [academicCycle, setAcademicCycle] = useState("2026/2027 Sem 1");
  const [selectedCourse, setSelectedCourse] = useState("all");

  // State for institutional document preview modal
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    format: "pdf", // 'pdf' | 'excel'
    title: "",
  });

  // ============================================================
  // SINGLE DEPARTMENT DATA (Department of Computer Science)
  // ============================================================

  const departmentData = {
    facultyName: "Faculty of Computing",
    departmentName: "Department of Computer Science",
    institution: "University Institute of Technology",
    courses: [
      {
        courseCode: "SCS1201",
        courseName: "Data Structures & Algorithms",
        lecturerName: "Dr. Samantha Perera",
        status: "Completed",
        stage: "Completed",
      },
      {
        courseCode: "SCS2202",
        courseName: "Database Management Systems",
        lecturerName: "Dr. Kasun Fernando",
        status: "In Progress",
        stage: "Paper Marking",
      },
      {
        courseCode: "SCS3104",
        courseName: "Software Engineering Principles",
        lecturerName: "Ms. Nadeesha Silva",
        status: "Overdue",
        stage: "Paper Setting",
      },
      {
        courseCode: "SCS3205",
        courseName: "Web Application Development",
        lecturerName: "Mr. Tharindu Jayasinghe",
        status: "In Progress",
        stage: "Moderation",
      },
      {
        courseCode: "SCS4101",
        courseName: "Advanced Artificial Intelligence",
        lecturerName: "Dr. Dinuka Wijesinghe",
        status: "Overdue",
        stage: "Second Marking",
      },
      {
        courseCode: "SCS1102",
        courseName: "Object-Oriented Programming",
        lecturerName: "Ms. Himashi Perera",
        status: "Completed",
        stage: "Completed",
      },
      {
        courseCode: "SCS2103",
        courseName: "Computer Networks & Security",
        lecturerName: "Prof. Rohan Silva",
        status: "In Progress",
        stage: "Paper Marking",
      },
      {
        courseCode: "SCS3301",
        courseName: "Distributed Systems Architecture",
        lecturerName: "Dr. Anusha Gunawardena",
        status: "Overdue",
        stage: "Moderation",
      },
    ],
  };

  // ============================================================
  // FILTERING & AGGREGATIONS
  // ============================================================

  const filteredCourses = useMemo(() => {
    if (selectedCourse === "all") {
      return departmentData.courses;
    }
    return departmentData.courses.filter(
      (c) => c.courseCode === selectedCourse,
    );
  }, [selectedCourse]);

  const totalCourses = departmentData.courses.length;

  // Categorized Sets
  const completedSet = departmentData.courses.filter(
    (c) => c.status === "Completed",
  );
  const inProgressSet = departmentData.courses.filter(
    (c) => c.status === "In Progress",
  );
  const overdueSet = departmentData.courses.filter(
    (c) => c.status === "Overdue",
  );

  const completionPercentage = Math.round(
    (completedSet.length / totalCourses) * 100,
  );

  // ============================================================
  // PREVIEW & EXPORT HANDLERS
  // ============================================================

  const handleOpenExportPreview = (format) => {
    setPreviewModal({
      isOpen: true,
      format,
      title: getReportTitle(),
    });
  };

  const handleConfirmDownload = () => {
    alert(
      `Department Audit Report successfully exported as ${previewModal.format.toUpperCase()} for academic cycle ${academicCycle}.`,
    );
    setPreviewModal({ isOpen: false, format: "pdf", title: "" });
  };

  const getReportTitle = () => {
    if (selectedCourse !== "all") {
      return `Course Audit Report: ${selectedCourse}`;
    }
    switch (reportType) {
      case "overall":
        return "Department Examination Workflow & Status Audit";
      case "sets":
        return "Categorized Lecturer Workflow Sets (Completed / Progress / Overdue)";
      case "matrix":
        return "Course Code & Stage Execution Ledger";
      default:
        return "Department Examination Report";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen text-slate-800 font-sans">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            {departmentData.facultyName} • {departmentData.departmentName}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Department Examination Reports & Status Sets
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review structured sets of lecturers categorized by completion status
            and active workflow stages.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenExportPreview("pdf")}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition"
          >
            <Download size={15} />
            Preview & Export PDF
          </button>
          <button
            onClick={() => handleOpenExportPreview("excel")}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition"
          >
            <Download size={15} />
            Preview & Export Excel
          </button>
        </div>
      </div>

      {/* ========================================================
          FILTER CONTROLS
      ======================================================== */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <Filter size={16} className="text-slate-500" />
          <h2 className="font-semibold text-sm text-slate-800 uppercase tracking-wide">
            Report Parameters & Scoping
          </h2>
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Report View Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-[240px]"
            >
              <option value="overall">Comprehensive Department Audit</option>
              <option value="sets">
                Categorized Status Sets (Sets of Lecturers)
              </option>
              <option value="matrix">Course Code & Stage Ledger</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Filter by Course Code
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-[220px]"
            >
              <option value="all">All Department Courses</option>
              {departmentData.courses.map((c) => (
                <option key={c.courseCode} value={c.courseCode}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Academic Cycle
            </label>
            <select
              value={academicCycle}
              onChange={(e) => setAcademicCycle(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option>2026/2027 Sem 1</option>
              <option>2025/2026 Sem 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================
          SUMMARY METRICS CARDS
      ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Total Courses
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalCourses}
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-md">
              <BarChart3 size={18} className="text-slate-700" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Department assigned units
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Completed Set
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {completedSet.length}
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-md">
              <CheckCircle2 size={18} className="text-slate-700" />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            {completionPercentage}% fully completed
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                In Progress Set
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {inProgressSet.length}
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-md">
              <Clock3 size={18} className="text-slate-700" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Active workflows ongoing
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">
                Overdue Set
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {overdueSet.length}
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-md">
              <AlertTriangle size={18} className="text-slate-700" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Requires immediate attention
          </p>
        </div>
      </div>

      {/* ========================================================
          CATEGORIZED STATUS SETS (COMPLETED / PROGRESS / OVERDUE)
      ======================================================== */}
      {(reportType === "overall" || reportType === "sets") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SET 1: Completed Lecturers & Stages */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" />
                Completed Set ({completedSet.length})
              </h3>
            </div>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {completedSet.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No completed courses found.
                </p>
              ) : (
                completedSet.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.courseCode}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px]">
                        Completed
                      </span>
                    </div>
                    <p className="text-slate-600">{item.courseName}</p>
                    <div className="pt-1 border-t border-slate-200/60 flex justify-between text-[11px]">
                      <span className="text-slate-500">
                        Lecturer:{" "}
                        <strong className="text-slate-800">
                          {item.lecturerName}
                        </strong>
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        Stage: {item.stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SET 2: In Progress Lecturers & Stages */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Clock3 size={16} className="text-amber-700" />
                In Progress Set ({inProgressSet.length})
              </h3>
            </div>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {inProgressSet.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No active courses in progress.
                </p>
              ) : (
                inProgressSet.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.courseCode}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px]">
                        In Progress
                      </span>
                    </div>
                    <p className="text-slate-600">{item.courseName}</p>
                    <div className="pt-1 border-t border-slate-200/60 flex justify-between text-[11px]">
                      <span className="text-slate-500">
                        Lecturer:{" "}
                        <strong className="text-slate-800">
                          {item.lecturerName}
                        </strong>
                      </span>
                      <span className="text-amber-700 font-semibold">
                        Stage: {item.stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SET 3: Overdue Lecturers & Stages */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-rose-700" />
                Overdue Set ({overdueSet.length})
              </h3>
            </div>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {overdueSet.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No overdue courses recorded.
                </p>
              ) : (
                overdueSet.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/50 rounded border border-rose-200 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.courseCode}</span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px]">
                        Overdue
                      </span>
                    </div>
                    <p className="text-slate-600">{item.courseName}</p>
                    <div className="pt-1 border-t border-rose-200/60 flex justify-between text-[11px]">
                      <span className="text-slate-500">
                        Lecturer:{" "}
                        <strong className="text-slate-900">
                          {item.lecturerName}
                        </strong>
                      </span>
                      <span className="text-rose-700 font-semibold">
                        Stage: {item.stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          COURSE & STAGE EXECUTION LEDGER TABLE
      ======================================================== */}
      {(reportType === "overall" || reportType === "matrix") && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <BookOpen size={16} className="text-slate-700" />
                Department Course & Stage Execution Ledger
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredCourses.length} course unit(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Course Code & Title
                  </th>
                  <th className="px-4 py-3 font-semibold">Assigned Lecturer</th>
                  <th className="px-3 py-3 font-semibold text-center">
                    Current Workflow Stage
                  </th>
                  <th className="px-3 py-3 font-semibold text-center">
                    Status Set
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {course.courseCode}
                      </div>
                      <div className="text-xs text-slate-600">
                        {course.courseName}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {course.lecturerName}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium text-xs border border-slate-200">
                        {course.stage}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          course.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : course.status === "In Progress"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          INSTITUTIONAL DOCUMENT PREVIEW MODAL
      ======================================================== */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-300">
            {/* Modal Control Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-300" />
                <span className="font-semibold text-sm tracking-wide">
                  Document Preview ({previewModal.format.toUpperCase()} Layout)
                </span>
              </div>
              <button
                onClick={() =>
                  setPreviewModal({ isOpen: false, format: "pdf", title: "" })
                }
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Document Canvas Preview */}
            <div className="p-8 overflow-y-auto bg-slate-50 flex-1 space-y-6">
              <div className="bg-white p-8 rounded border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-6 text-slate-800">
                {/* Institutional Header Stamp */}
                <div className="border-b border-slate-200 pb-6 text-center space-y-1">
                  <p className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                    {departmentData.institution}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">
                    {departmentData.facultyName}
                  </h3>
                  <p className="text-sm font-medium text-slate-700">
                    {departmentData.departmentName} - Examination Status Audit
                  </p>
                </div>

                {/* Report Metadata Block */}
                <div className="flex justify-between items-start text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="space-y-1">
                    <p>
                      <strong className="text-slate-900">Audit Focus:</strong>{" "}
                      {previewModal.title}
                    </p>
                    <p>
                      <strong className="text-slate-900">
                        Academic Cycle:
                      </strong>{" "}
                      {academicCycle}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p>
                      <strong className="text-slate-900">
                        Generated Date:
                      </strong>{" "}
                      August 20, 2026
                    </p>
                    <p>
                      <strong className="text-slate-900">
                        Classification:
                      </strong>{" "}
                      Official Department Record
                    </p>
                  </div>
                </div>

                {/* Executive Summary Metrics */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    Summary Statistics
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 border border-slate-200 bg-slate-50 rounded">
                      <span className="block text-slate-500 text-[10px]">
                        Total Courses
                      </span>
                      <strong className="text-slate-900">{totalCourses}</strong>
                    </div>
                    <div className="p-2 border border-slate-200 bg-slate-50 rounded">
                      <span className="block text-slate-500 text-[10px]">
                        Completed Set
                      </span>
                      <strong className="text-emerald-700">
                        {completedSet.length}
                      </strong>
                    </div>
                    <div className="p-2 border border-slate-200 bg-slate-50 rounded">
                      <span className="block text-slate-500 text-[10px]">
                        In Progress Set
                      </span>
                      <strong className="text-amber-700">
                        {inProgressSet.length}
                      </strong>
                    </div>
                    <div className="p-2 border border-slate-200 bg-slate-50 rounded">
                      <span className="block text-slate-500 text-[10px]">
                        Overdue Set
                      </span>
                      <strong className="text-rose-700">
                        {overdueSet.length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Detailed Sets Breakdown in Preview */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    Categorized Lecturer Sets & Workflow Stages
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <strong className="text-xs text-emerald-800 block mb-1">
                        1. Completed Set ({completedSet.length} Lecturers)
                      </strong>
                      <div className="text-xs text-slate-700 space-y-1">
                        {completedSet.map((c, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              • {c.lecturerName} ({c.courseCode} -{" "}
                              {c.courseName})
                            </span>
                            <span className="font-semibold text-slate-900">
                              Stage: {c.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <strong className="text-xs text-amber-800 block mb-1">
                        2. In Progress Set ({inProgressSet.length} Lecturers)
                      </strong>
                      <div className="text-xs text-slate-700 space-y-1">
                        {inProgressSet.map((c, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              • {c.lecturerName} ({c.courseCode} -{" "}
                              {c.courseName})
                            </span>
                            <span className="font-semibold text-slate-900">
                              Stage: {c.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50/50 rounded border border-rose-200">
                      <strong className="text-xs text-rose-800 block mb-1">
                        3. Overdue Set ({overdueSet.length} Lecturers)
                      </strong>
                      <div className="text-xs text-slate-700 space-y-1">
                        {overdueSet.map((c, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              • {c.lecturerName} ({c.courseCode} -{" "}
                              {c.courseName})
                            </span>
                            <span className="font-semibold text-rose-700">
                              Stage: {c.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sign-off footer */}
                <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p>Certified by Department Examination Committee</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Automated Department Management System
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
                    <p>Head of Department (Signature)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-slate-700" />
                <span>Document verified. Ready for download.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPreviewModal({ isOpen: false, format: "pdf", title: "" })
                  }
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDownload}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5 transition"
                >
                  <Printer size={14} /> Confirm & Download{" "}
                  {previewModal.format.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
