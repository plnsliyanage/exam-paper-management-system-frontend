import React, { useState } from "react";
import { lecturerApi } from "../services/api";
import { X, CheckCircle } from "lucide-react";

export default function MarkingEntryModal({
  packet,
  lecturerId = "U1",
  onClose,
  onSuccess,
}) {
  const [scriptCount, setScriptCount] = useState(
    packet?.totalScripts || packet?.scriptsCount || "",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await lecturerApi.addMarkingScripts({
        packetId: packet.packetId || packet.id,
        totalScripts: Number(scriptCount),
        lecturerId: lecturerId,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to log marking scripts", err);
      alert(
        err.response?.data?.message ||
          "Failed to save script count. Please ensure Lecturer ID is available.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Log Total Answer Scripts
            </h2>
            <p className="text-xs text-slate-500">
              {packet.courseCode} - {packet.courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Total Number of Scripts to Mark
            </label>
            <input
              type="number"
              min="1"
              required
              value={scriptCount}
              onChange={(e) => setScriptCount(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? "Saving..." : "Save Total Scripts"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
