import React, { useState, useEffect } from 'react';
import { X, Clock, User, ArrowRight, MessageSquare, Send, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { hodApi } from '../../services/api';

export default function HodPacketDetailModal({ packetId, onClose, onRefresh }) {
  const [packet, setPacket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packetId) return;
    setLoading(true);
    Promise.all([
      hodApi.getPacketDetails(packetId),
      hodApi.getComments(packetId)
    ])
      .then(([detailRes, commentRes]) => {
        setPacket(detailRes.data);
        setComments(commentRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [packetId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    hodApi.addComment({ packetId, text: newComment, author: 'HOD' })
      .then((res) => {
        setComments((prev) => [...prev, res.data || { id: Date.now(), author: 'HOD', text: newComment, createdAt: 'Just now' }]);
        setNewComment('');
      })
      .catch((err) => console.error(err));
  };

  if (!packetId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{packet?.courseCode || 'Packet Details'}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                packet?.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                packet?.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {packet?.status || 'In Progress'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{packet?.courseTitle} • Cycle: {packet?.academicCycle || '2026/S1'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading packet details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block mb-1">Current Holder</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> {packet?.currentHolder || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block mb-1">Lecturer / Moderator</span>
                <span className="font-bold text-slate-800">{packet?.lecturer} / {packet?.moderator || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block mb-1">Last Updated By</span>
                <span className="font-bold text-slate-800">{packet?.lastUpdatedUser || 'System'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block mb-1">Marking Progress</span>
                <span className="font-bold text-emerald-600">{packet?.completedScripts || 0} / {packet?.totalScripts || 0} Scripts</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Overall Completion</span>
                <span>{packet?.totalScripts ? Math.round((packet.completedScripts / packet.totalScripts) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-brand-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${packet?.totalScripts ? Math.min(100, (packet.completedScripts / packet.totalScripts) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Movement History / Timeline */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> Packet Movement History
              </h3>
              <div className="border-l-2 border-slate-200 pl-4 space-y-4 ml-2">
                {(packet?.movementHistory || [
                  { stage: 'Printing Completed', user: 'AR Printing Office', timestamp: '2026-07-28 09:30 AM' },
                  { stage: 'Dispatched to Lecturer', user: 'AR Office', timestamp: '2026-07-29 11:00 AM' },
                  { stage: 'Marking In Progress', user: packet?.lecturer, timestamp: '2026-08-01 02:15 PM' }
                ]).map((step, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-600 border-2 border-white" />
                    <span className="font-bold text-slate-800 block">{step.stage}</span>
                    <span className="text-slate-500">By: {step.user} • {step.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication & Comments Panel */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" /> Department Feedback & Communication History
              </h3>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {comments.length > 0 ? (
                  comments.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{c.author}</span>
                        <span className="text-slate-400 font-normal">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-600">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes or comments added yet.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Send feedback or internal comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}