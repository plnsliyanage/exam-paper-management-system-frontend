import React from "react";

export default function HodWorkloadPage() {
  const staffWorkload = [
    {
      name: "Dr. Alice Smith",
      role: "Lecturer / Moderator",
      assignedPackets: 4,
      completedMarking: 3,
      pending: 1,
      workloadLevel: "Balanced",
    },
    {
      name: "Dr. Charlie Brown",
      role: "Lecturer",
      assignedPackets: 6,
      completedMarking: 2,
      pending: 4,
      workloadLevel: "High",
    },
    {
      name: "Prof. Diana Prince",
      role: "Lecturer",
      assignedPackets: 3,
      completedMarking: 3,
      pending: 0,
      workloadLevel: "Optimal",
    },
    {
      name: "Prof. Bob Jones",
      role: "Moderator",
      assignedPackets: 5,
      completedMarking: 4,
      pending: 1,
      workloadLevel: "Balanced",
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Lecturer & Moderator Workload & Performance
        </h1>
        <p className="text-sm text-gray-500">
          Monitor marking progress, compare workload distribution, and view
          staff statistics.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800 text-sm">
          Staff Workload & Marking Progress Distribution
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase bg-gray-50/50">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Packets</th>
                <th className="py-3 px-4">Marking Completed</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">Workload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {staffWorkload.map((staff, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {staff.name}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {staff.role}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-600">
                    {staff.assignedPackets}
                  </td>
                  <td className="py-3 px-4 text-green-600 font-medium">
                    {staff.completedMarking}
                  </td>
                  <td className="py-3 px-4 text-amber-600 font-medium">
                    {staff.pending}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        staff.workloadLevel === "High"
                          ? "bg-red-100 text-red-800"
                          : staff.workloadLevel === "Balanced"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {staff.workloadLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
