import React, { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, Send, User } from 'lucide-react';
import { hodApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HodPacketDetailModal({ packetId, onClose, onRefresh }) {
  const { getUsername } = useAuth();
  const username = getUsername() || "HOD";

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
        setComments(Array.isArray(commentRes.data) ? commentRes.data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [packetId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    hodApi.addComment({ packetId, userId: username, commentText: newComment })
      .then((res) => {
        setComments((prev) => [...prev, res.data || { commentId: String(Date.now()), userName: username, commentText: newComment, timestamp: new Date().toISOString() }]);
        setNewComment('');
      })
      .catch((err) => console.error(err));
  };

  if (!packetId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{packet?.courseCode || 'Packet Details'}</h2>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                packet?.status === 'Overdue' ? 'bg-rose-100 text-rose-700' :
                packet?.status === 'COMPLETED' || packet?.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {packet?.status || 'In Progress'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{packet?.courseName} • Cycle: {packet?.cycleId || '2026'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading packet details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 block mb-1 uppercase text-[10px] font-bold">Current Holder</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> {packet?.currentHolderName || 'Unassigned'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 block mb-1 uppercase text-[10px] font-bold">Department</span>
                <span className="font-bold text-slate-800">{packet?.departmentName || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 block mb-1 uppercase text-[10px] font-bold">Last Updated By</span>
                <span className="font-bold text-slate-800">{packet?.lastUpdatedUser || 'System'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-400 block mb-1 uppercase text-[10px] font-bold">Deadline</span>
                <span className="font-bold text-slate-800">{packet?.deadline || 'N/A'}</span>
              </div>
            </div>

            {/* Movement History */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider text-slate-400">
                <Clock className="w-4 h-4 text-[#7c4dff]" /> Packet Movement History
              </h3>
              <div className="border-l-2 border-slate-200 pl-4 space-y-3 ml-2">
                {packet?.movementHistory && packet.movementHistory.length > 0 ? (
                  packet.movementHistory.map((step, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#7c4dff] border-2 border-white" />
                      <span className="font-bold text-slate-800 block">{step.action || 'Movement'}</span>
                      <span className="text-slate-500 text-[11px]">
                        From: {step.fromUserName || 'System'} → To: {step.toUserName || 'N/A'} • {step.timestamp ? new Date(step.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-xs">No movements recorded yet.</p>
                )}
              </div>
            </div>

            {/* Comments Panel */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-slate-400">
                <MessageSquare className="w-4 h-4 text-[#7c4dff]" /> Department Feedback & Communication
              </h3>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {comments.length > 0 ? (
                  comments.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{c.userName || 'User'}</span>
                        <span className="text-slate-400 font-normal text-[10px]">
                          {c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{c.commentText}</p>
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
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#7c4dff]"
                />
                <button
                  type="submit"
                  className="bg-[#7c4dff] hover:bg-[#6c3de8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
