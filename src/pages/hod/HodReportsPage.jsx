import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
} from "lucide-react";

import { hodApi } from "../../services/api";

export default function HodReportsPage() {
  // ============================================================
  // CONFIGURATION
  // ============================================================

  // Change this if your HOD belongs to another department.
  const departmentId =
    localStorage.getItem("departmentId") ||
    localStorage.getItem("deptId") ||
    "D1";

  // ============================================================
  // STATE
  // ============================================================

  const [reportType, setReportType] = useState("progress");

  const [academicCycle, setAcademicCycle] = useState("all");

  const [packets, setPackets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [overduePackets, setOverduePackets] = useState([]);
  const [previousRecords, setPreviousRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD REPORT DATA
  // ============================================================

  const loadReportData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        packetsResponse,
        statisticsResponse,
        workloadResponse,
        overdueResponse,
        previousResponse,
      ] = await Promise.all([
        hodApi.getDepartmentPackets(departmentId),
        hodApi.getDepartmentStatistics(departmentId),
        hodApi.getWorkload(departmentId),
        hodApi.getOverduePackets(departmentId),
        hodApi.getPreviousRecords(departmentId),
      ]);

      setPackets(
        Array.isArray(packetsResponse.data) ? packetsResponse.data : [],
      );

      setStatistics(statisticsResponse.data || null);

      setWorkload(
        Array.isArray(workloadResponse.data) ? workloadResponse.data : [],
      );

      setOverduePackets(
        Array.isArray(overdueResponse.data) ? overdueResponse.data : [],
      );

      setPreviousRecords(
        Array.isArray(previousResponse.data) ? previousResponse.data : [],
      );
    } catch (err) {
      console.error("Failed to load HOD reports:", err);

      setError(
        err.response?.data?.message || "Unable to load department report data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [departmentId]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getValue = (object, keys, fallback = null) => {
    if (!object) return fallback;

    for (const key of keys) {
      if (object[key] !== undefined && object[key] !== null) {
        return object[key];
      }
    }

    return fallback;
  };

  const normalizeStatus = (status) => {
    if (!status) return "";

    return String(status)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  // ============================================================
  // FILTER PACKETS BY ACADEMIC CYCLE
  // ============================================================

  const filteredPackets = useMemo(() => {
    if (academicCycle === "all") {
      return packets;
    }

    return packets.filter((packet) => {
      const cycle =
        getValue(packet, [
          "academicCycle",
          "cycle",
          "cycleName",
          "academicCycleName",
        ]) || "";

      return (
        String(cycle).toLowerCase() === String(academicCycle).toLowerCase()
      );
    });
  }, [packets, academicCycle]);

  // ============================================================
  // CALCULATE STATISTICS
  // ============================================================

  const reportStatistics = useMemo(() => {
    // Use backend statistics where possible.
    const backendTotal = getValue(statistics, [
      "totalPackets",
      "totalAssignedPackets",
      "total",
      "assignedPackets",
    ]);

    const backendCompleted = getValue(statistics, [
      "completedPackets",
      "completed",
      "completedCount",
    ]);

    const backendInProgress = getValue(statistics, [
      "inProgressPackets",
      "inProgress",
      "inProgressCount",
    ]);

    const backendOverdue = getValue(statistics, [
      "overduePackets",
      "overdue",
      "overdueCount",
    ]);

    // If backend returns values, use them.
    if (
      backendTotal !== null ||
      backendCompleted !== null ||
      backendInProgress !== null ||
      backendOverdue !== null
    ) {
      const total = Number(backendTotal) || filteredPackets.length;

      const completed = Number(backendCompleted) || 0;

      const inProgress = Number(backendInProgress) || 0;

      const overdue = Number(backendOverdue) || overduePackets.length;

      return {
        total,
        completed,
        inProgress,
        overdue,
      };
    }

    // Fallback calculation from packet list.
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    filteredPackets.forEach((packet) => {
      const status = normalizeStatus(
        getValue(packet, ["status", "packetStatus"]),
      );

      if (status === "COMPLETED" || status === "COMPLETE") {
        completed++;
      } else if (status === "OVERDUE") {
        overdue++;
      } else {
        inProgress++;
      }
    });

    return {
      total: filteredPackets.length,
      completed,
      inProgress,
      overdue,
    };
  }, [statistics, filteredPackets, overduePackets]);

  const total = reportStatistics.total;

  const completedPercentage =
    total > 0 ? ((reportStatistics.completed / total) * 100).toFixed(1) : "0.0";

  const inProgressPercentage =
    total > 0
      ? ((reportStatistics.inProgress / total) * 100).toFixed(1)
      : "0.0";

  const overduePercentage =
    total > 0 ? ((reportStatistics.overdue / total) * 100).toFixed(1) : "0.0";

  // ============================================================
  // GET LECTURER NAME
  // ============================================================

  const getLecturerName = (item) => {
    return (
      getValue(item, [
        "lecturerName",
        "name",
        "fullName",
        "lecturer",
        "userName",
      ]) || "Unknown Lecturer"
    );
  };

  // ============================================================
  // GET WORKLOAD VALUE
  // ============================================================

  const getWorkloadValue = (item) => {
    const value = getValue(item, [
      "totalPackets",
      "assignedPackets",
      "packetCount",
      "totalAssigned",
      "workload",
      "count",
    ]);

    return Number(value) || 0;
  };

  const maxWorkload = Math.max(...workload.map(getWorkloadValue), 1);

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const handleExportExcel = () => {
    const rows = [];

    rows.push(["Department Report", "", "", ""]);

    rows.push(["Department", departmentId, "", ""]);

    rows.push([
      "Academic Cycle",
      academicCycle === "all" ? "All Cycles" : academicCycle,
      "",
      "",
    ]);

    rows.push([]);

    rows.push(["Summary", "Count", "Percentage"]);

    rows.push(["Total Assigned Packets", reportStatistics.total, "100%"]);

    rows.push([
      "Completed Packets",
      reportStatistics.completed,
      `${completedPercentage}%`,
    ]);

    rows.push([
      "In Progress / Moderation",
      reportStatistics.inProgress,
      `${inProgressPercentage}%`,
    ]);

    rows.push([
      "Overdue Packets",
      reportStatistics.overdue,
      `${overduePercentage}%`,
    ]);

    rows.push([]);

    rows.push(["Lecturer Workload", "", ""]);

    rows.push(["Lecturer", "Assigned Packets", "Workload %"]);

    workload.forEach((item) => {
      const count = getWorkloadValue(item);

      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

      rows.push([getLecturerName(item), count, `${percentage}%`]);
    });

    rows.push([]);

    rows.push(["Overdue Packets", "", ""]);

    rows.push(["Packet ID", "Course", "Status"]);

    overduePackets.forEach((packet) => {
      rows.push([
        getValue(packet, ["packetId", "id"]) || "",
        getValue(packet, ["courseName", "course", "courseTitle"]) || "",
        getValue(packet, ["status", "packetStatus"]) || "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value =
              cell === null || cell === undefined ? "" : String(cell);

            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `HOD_Department_Report_${departmentId}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // EXPORT PDF
  // ============================================================

  const handleExportPdf = () => {
    window.print();
  };

  // ============================================================
  // REPORT TYPE DATA
  // ============================================================

  const reportDescription = {
    progress: "Department packet completion and progress overview.",
    delay: "Identify overdue packets and department bottlenecks.",
    workload: "Compare packet distribution among lecturers.",
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-600 mx-auto mb-3"
            size={40}
          />

          <p className="text-gray-600">Loading department reports...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-3" size={40} />

          <h2 className="text-lg font-semibold text-gray-800">
            Unable to load reports
          </h2>

          <p className="text-sm text-gray-500 mt-2">{error}</p>

          <button
            onClick={() => loadReportData()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen print:bg-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Reports & Analytics
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Generate and analyze department performance, workload and packet
            progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadReportData(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 shadow-sm"
          >
            <Download size={16} />
            Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* ======================================================
          PRINT HEADER
      ====================================================== */}

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">Department Report</h1>

        <p className="text-sm">Department: {departmentId}</p>

        <p className="text-sm">
          Academic Cycle:{" "}
          {academicCycle === "all" ? "All Cycles" : academicCycle}
        </p>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center print:hidden">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="progress">Progress Report</option>

            <option value="delay">Delay & Bottleneck Report</option>

            <option value="workload">Workload Distribution Report</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Academic Cycle
          </label>

          <select
            value={academicCycle}
            onChange={(e) => setAcademicCycle(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Cycles</option>

            <option value="2026/2027 Sem 1">2026/2027 Sem 1</option>

            <option value="2025/2026 Sem 2">2025/2026 Sem 2</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-500 self-end">
          {reportDescription[reportType]}
        </div>
      </div>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Assigned</p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                {reportStatistics.total}
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Completed */}

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>

              <p className="text-3xl font-bold text-green-600 mt-1">
                {reportStatistics.completed}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {completedPercentage}%
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* In Progress */}

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>

              <p className="text-3xl font-bold text-amber-600 mt-1">
                {reportStatistics.inProgress}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {inProgressPercentage}%
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        {/* Overdue */}

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>

              <p className="text-3xl font-bold text-red-600 mt-1">
                {reportStatistics.overdue}
              </p>

              <p className="text-xs text-gray-400 mt-1">{overduePercentage}%</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SUMMARY + WORKLOAD
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SUMMARY */}

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Summary Statistics
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">
                Total Assigned Packets
              </span>

              <span className="font-bold">{reportStatistics.total}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600 text-sm">Completed Packets</span>

              <span className="font-bold text-green-600">
                {reportStatistics.completed} ({completedPercentage}%)
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span className="text-gray-600 text-sm">
                In Progress / Moderation
              </span>

              <span className="font-bold text-amber-600">
                {reportStatistics.inProgress} ({inProgressPercentage}%)
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-600 text-sm">Overdue Packets</span>

              <span className="font-bold text-red-600">
                {reportStatistics.overdue} ({overduePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* WORKLOAD */}

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Lecturer Workload
              </h2>

              <p className="text-xs text-gray-500">
                Current packet distribution
              </p>
            </div>

            <Users size={22} className="text-blue-600" />
          </div>

          {workload.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No workload data available.
            </div>
          ) : (
            <div className="space-y-4">
              {workload.map((item, index) => {
                const value = getWorkloadValue(item);

                const width = (value / maxWorkload) * 100;

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {getLecturerName(item)}
                      </span>

                      <span className="text-sm font-bold text-gray-800">
                        {value}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          WORKLOAD BAR CHART
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-blue-600" size={20} />

          <h2 className="text-lg font-semibold text-gray-800">
            Lecturer Workload Distribution
          </h2>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Number of packets currently assigned to each lecturer.
        </p>

        {workload.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No lecturer workload data available.
          </div>
        ) : (
          <div className="space-y-5">
            {workload.map((item, index) => {
              const value = getWorkloadValue(item);

              const percentage =
                maxWorkload > 0 ? (value / maxWorkload) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      {getLecturerName(item)}
                    </span>

                    <span className="font-semibold text-gray-900">
                      {value} packets
                    </span>
                  </div>

                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                      style={{
                        width: `${Math.max(percentage, value > 0 ? 5 : 0)}%`,
                      }}
                    >
                      {value > 0 && (
                        <span className="text-xs font-bold text-white">
                          {value}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================
          OVERDUE SECTION
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              Overdue Packets
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Packets currently identified as overdue.
            </p>
          </div>

          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold">
            {overduePackets.length}
          </span>
        </div>

        {overduePackets.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />

            <p className="text-sm text-gray-500">No overdue packets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-3 text-gray-500 font-semibold">
                    Packet
                  </th>

                  <th className="py-3 px-3 text-gray-500 font-semibold">
                    Course
                  </th>

                  <th className="py-3 px-3 text-gray-500 font-semibold">
                    Lecturer
                  </th>

                  <th className="py-3 px-3 text-gray-500 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {overduePackets.slice(0, 10).map((packet, index) => {
                  const packetId = getValue(packet, ["packetId", "id"]) || "-";

                  const course =
                    getValue(packet, ["courseName", "courseTitle", "course"]) ||
                    "-";

                  const lecturer =
                    getValue(packet, [
                      "lecturerName",
                      "lecturer",
                      "assignedLecturer",
                    ]) || "-";

                  const status =
                    getValue(packet, ["status", "packetStatus"]) || "OVERDUE";

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 font-semibold text-gray-800">
                        {packetId}
                      </td>

                      <td className="py-3 px-3 text-gray-600">{course}</td>

                      <td className="py-3 px-3 text-gray-600">{lecturer}</td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold">
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================
          PREVIOUS RECORDS
      ====================================================== */}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="text-gray-600" size={20} />

          <h2 className="text-lg font-semibold text-gray-800">
            Previous Cycle Records
          </h2>
        </div>

        <p className="text-xs text-gray-500 mb-5">
          Historical department packet records.
        </p>

        {previousRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No previous records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-3 text-gray-500">Packet</th>

                  <th className="py-3 px-3 text-gray-500">Course</th>

                  <th className="py-3 px-3 text-gray-500">Status</th>
                </tr>
              </thead>

              <tbody>
                {previousRecords.slice(0, 10).map((packet, index) => {
                  const packetId = getValue(packet, ["packetId", "id"]) || "-";

                  const course =
                    getValue(packet, ["courseName", "courseTitle", "course"]) ||
                    "-";

                  const status =
                    getValue(packet, ["status", "packetStatus"]) || "-";

                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-3 font-medium">{packetId}</td>

                      <td className="py-3 px-3 text-gray-600">{course}</td>

                      <td className="py-3 px-3">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================
          PRINT CSS
      ====================================================== */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            .shadow-sm {
              box-shadow: none !important;
            }

            .border {
              border-color: #ddd !important;
            }

            @page {
              margin: 15mm;
            }
          }
        `}
      </style>
    </div>
  );
}
