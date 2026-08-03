import React, { useEffect, useState } from 'react';
import { arApi } from '../../services/api';
import { Search, Filter, Eye, Edit3, UserCheck, X } from 'lucide-react';

export default function ArPacketsPage({ arUserId = 'AR001' }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'details', 'status', 'assign'
  
  // Form states for modals
  const [newStatus, setNewStatus] = useState('');
  const [assignedLecturer, setAssignedLecturer] = useState('');
  const [assignedModerator, setAssignedModerator] = useState('');

  const fetchPackets = () => {
    setLoading(true);
    arApi.getAllPackets({ search: searchTerm, department: departmentFilter, cycle: cycleFilter, status: statusFilter })
      .then((res) => setPackets(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPackets();
  }, [departmentFilter, cycleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPackets();
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await arApi.updateStatus(selectedPacket.id, newStatus, arUserId);
      alert('Packet status updated successfully!');
      setModalMode(null);
      fetchPackets();
    } catch (err) {
      alert('Failed to update packet status.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await arApi.assignUser(selectedPacket.id, { lecturerId: assignedLecturer, moderatorId: assignedModerator }, arUserId);
      alert('Assignments updated successfully!');
      setModalMode(null);
      fetchPackets();
    } catch (err) {
      alert('Failed to assign users.');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Packet Management</h1>
          <p className="text-sm text-slate-500">Monitor, search, filter, and override faculty exam packets</p>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by course code, name, department, or lecturer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Filters:</span>
          </div>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All Departments</option>
            <option value="CS">Computer Science</option>
            <option value="MTH">Mathematics</option>
            <option value="PHY">Physics</option>
          </select>

          <select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All Cycles</option>
            <option value="Mid">Mid-Semester</option>
            <option value="End">End-Semester</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_HOD">Pending HOD</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
      </div>

      {/* Packets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <th className="p-4 font-semibold">Course Code & Name</th>
              <th className="p-4 font-semibold">Department</th>
              <th className="p-4 font-semibold">Lecturer</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="p-6 text-center text-slate-400">Loading packets...</td></tr>
            ) : packets.length > 0 ? (
              packets.map((pkt) => (
                <tr key={pkt.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-medium text-slate-900">{pkt.courseCode} - {pkt.courseName}</td>
                  <td className="p-4 text-slate-600">{pkt.department}</td>
                  <td className="p-4 text-slate-600">{pkt.lecturerName || 'Unassigned'}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 text-[10px]">
                      {pkt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => { setSelectedPacket(pkt); setModalMode('details'); }}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded" title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setSelectedPacket(pkt); setNewStatus(pkt.status); setModalMode('status'); }}
                      className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 rounded" title="Update Status"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setSelectedPacket(pkt); setModalMode('assign'); }}
                      className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded" title="Assign / Reassign"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-6 text-center text-slate-400">No exam packets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals for Details, Status Update, and Assignments */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4 relative text-xs">
            <button onClick={() => setModalMode(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            {modalMode === 'details' && selectedPacket && (
              <>
                <h2 className="text-base font-bold text-slate-900 border-b pb-2">Packet Full Details</h2>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Course:</strong> {selectedPacket.courseCode} - {selectedPacket.courseName}</p>
                  <p><strong>Department:</strong> {selectedPacket.department}</p>
                  <p><strong>Cycle:</strong> {selectedPacket.cycle}</p>
                  <p><strong>Current Status:</strong> {selectedPacket.status}</p>
                  <p><strong>Assigned Lecturer:</strong> {selectedPacket.lecturerName || 'None'}</p>
                  <p><strong>Assigned Moderator:</strong> {selectedPacket.moderatorName || 'None'}</p>
                  <p><strong>Last Updated:</strong> {selectedPacket.updatedAt || 'N/A'}</p>
                </div>
              </>
            )}

            {modalMode === 'status' && selectedPacket && (
              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-2">Update Packet Status</h2>
                <div>
                  <label className="block font-semibold mb-1">New Status</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border rounded p-2"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_HOD">Pending HOD</option>
                    <option value="PENDING_AR">Pending AR</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white font-semibold rounded-lg">Save Status</button>
              </form>
            )}

            {modalMode === 'assign' && selectedPacket && (
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b pb-2">Assign / Reassign Staff</h2>
                <div>
                  <label className="block font-semibold mb-1">Lecturer Username / ID</label>
                  <input 
                    type="text" 
                    value={assignedLecturer}
                    onChange={(e) => setAssignedLecturer(e.target.value)}
                    placeholder="e.g. lecturer_02"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Moderator Username / ID</label>
                  <input 
                    type="text" 
                    value={assignedModerator}
                    onChange={(e) => setAssignedModerator(e.target.value)}
                    placeholder="e.g. moderator_01"
                    className="w-full border rounded p-2"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg">Confirm Assignment</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}