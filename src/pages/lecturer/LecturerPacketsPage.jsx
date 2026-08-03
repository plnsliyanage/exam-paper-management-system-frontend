import React, { useEffect, useState } from 'react';
import { lecturerApi } from '../../services/api';
import PacketDetailModal from '../../components/PacketDetailModal';
import MarkingEntryModal from '../../components/MarkingEntryModal';
import { FileText, Search, Eye, Edit3, Check, Filter } from 'lucide-react';

export default function LecturerPacketsPage({ lecturerId = 'LEC001' }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [selectedPacketId, setSelectedPacketId] = useState(null);
  const [markingPacket, setMarkingPacket] = useState(null);

  const loadPackets = async () => {
    setLoading(true);
    try {
      const res = await lecturerApi.getPackets(lecturerId);
      setPackets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackets();
  }, [lecturerId]);

  const handleCompleteTask = async (packetId) => {
    try {
      await lecturerApi.completeTask(packetId);
      loadPackets();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPackets = packets.filter((p) => {
    const matchesSearch = p.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assigned Exam Packets</h1>
          <p className="text-sm text-slate-500">Manage and filter all your current academic semester packets</p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search course code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-slate-600 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="PREPARATION">Preparation</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PRINTING">Printing</option>
            <option value="MARKING">Marking</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" /> Filtered Packets List
          </h2>
          <span className="text-slate-400 font-semibold">{filteredPackets.length} Records Found</span>
        </div>

        <div className="space-y-3">
          {filteredPackets.length > 0 ? (
            filteredPackets.map((packet) => (
              <div key={packet.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {packet.courseCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-[11px]">
                      {packet.status || 'PREPARATION'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{packet.courseName}</h3>
                  <p className="text-slate-400">Department: <span className="text-slate-600">{packet.department || 'N/A'}</span> | Deadline: {packet.deadline || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedPacketId(packet.id)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition" title="View Details">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setMarkingPacket(packet)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Log Scripts">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleCompleteTask(packet.id)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-slate-800">
                    <Check className="w-3 h-3" /> Complete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-10">No packets match your criteria.</p>
          )}
        </div>
      </div>

      {selectedPacketId && (
        <PacketDetailModal packetId={selectedPacketId} onClose={() => setSelectedPacketId(null)} onStatusUpdated={loadPackets} />
      )}
      {markingPacket && (
        <MarkingEntryModal packet={markingPacket} onClose={() => setMarkingPacket(null)} onSuccess={loadPackets} />
      )}
    </div>
  );
}