import React, { useEffect, useState } from 'react';
import { lecturerApi } from '../../services/api';
import PacketDetailModal from '../../components/PacketDetailModal';
import { History, Eye, Search } from 'lucide-react';

export default function LecturerPreviousRecordsPage({ lecturerId = 'LEC001' }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPacketId, setSelectedPacketId] = useState(null);

  useEffect(() => {
    lecturerApi.getPreviousPackets(lecturerId)
      .then((res) => setPackets(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [lecturerId]);

  const filtered = packets.filter(p => 
    p.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-slate-400 text-xs">Loading previous archives...</div>;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Previous Academic Packets</h1>
          <p className="text-sm text-slate-500">Access historical semester exam records and completed archives</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search archive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-brand-600" />
          <h2 className="font-bold text-slate-800">Archive Records</h2>
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((packet) => (
              <div key={packet.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {packet.courseCode}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1">{packet.courseName}</h3>
                  <p className="text-slate-400">Academic Cycle: <span className="text-slate-600">{packet.academicCycle || 'Past Semester'}</span></p>
                </div>

                <button onClick={() => setSelectedPacketId(packet.id)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-10">No previous records found.</p>
          )}
        </div>
      </div>

      {selectedPacketId && (
        <PacketDetailModal packetId={selectedPacketId} onClose={() => setSelectedPacketId(null)} />
      )}
    </div>
  );
}