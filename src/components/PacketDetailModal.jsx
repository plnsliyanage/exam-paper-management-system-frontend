import React, { useEffect, useState } from 'react';
import { lecturerApi } from '../services/api';
import { X, Clock, MessageSquare, History, Send, ShieldAlert } from 'lucide-react';

export default function PacketDetailModal({ packetId, onClose, onStatusUpdated }) {
  const [packet, setPacket] = useState(null);
  const [movements, setMovements] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const loadData = async () => {
    try {
      const [packRes, movRes, comRes] = await Promise.all([
        lecturerApi.getPacketDetails(packetId),
        lecturerApi.getMovementHistory(packetId),
        lecturerApi.getComments(packetId)
      ]);
      setPacket(packRes.data);
      setMovements(movRes.data || []);
      setComments(comRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [packetId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await lecturerApi.updateStatus(packetId, { status: newStatus });
      loadData();
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await lecturerApi.addComment({ packetId, comment: newComment, senderRole: 'LECTURER' });
      setNewComment('');
      const comRes = await lecturerApi.getComments(packetId);
      setComments(comRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-slate-500 text-xs">Loading packet details...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              {packet?.courseCode}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{packet?.courseName}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-5 gap-4 bg-slate-50/50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition ${activeTab === 'details' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Overview & Status
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition ${activeTab === 'history' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Movement History ({movements.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition ${activeTab === 'comments' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Comments & Feedback ({comments.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5">Department</span>
                  <span className="font-semibold text-slate-800">{packet?.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Current Holder</span>
                  <span className="font-semibold text-slate-800">{packet?.currentHolder || 'Me'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Deadline</span>
                  <span className="font-semibold text-rose-600">{packet?.deadline || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Current Status</span>
                  <span className="font-semibold text-brand-600">{packet?.status || 'PREPARATION'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Update Workflow Stage Status</label>
                <div className="flex flex-wrap gap-2">
                  {['PREPARATION', 'IN_REVIEW', 'PRINTING', 'MARKING', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                        packet?.status === st
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {movements.length > 0 ? (
                movements.map((mov, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{mov.action || 'Status Updated'}</p>
                      <p className="text-slate-400 text-[11px]">Moved by: {mov.performedBy || 'System'}</p>
                    </div>
                    <span className="text-[11px] text-slate-500">{mov.timestamp}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-6">No movement records found.</p>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4 flex flex-col h-full">
              <div className="space-y-3 flex-1 overflow-y-auto max-h-48">
                {comments.length > 0 ? (
                  comments.map((comm, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{comm.senderName || comm.senderRole}</span>
                        <span className="text-[10px] text-slate-400">{comm.timestamp}</span>
                      </div>
                      <p className="text-slate-600">{comm.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-6">No comments or feedback yet.</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Write a comment or feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl font-semibold flex items-center gap-1 hover:bg-brand-700 transition">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
