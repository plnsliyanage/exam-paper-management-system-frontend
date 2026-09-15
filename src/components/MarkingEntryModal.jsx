import React, { useState, useEffect } from "react";
import { lecturerApi } from "../services/api";
import { X, CheckCircle, CheckCheck, AlertCircle } from "lucide-react";

export default function MarkingEntryModal({
  packet,
  lecturerId,
  onClose,
  onSuccess,
}) {
  const initialTotal = Number(packet?.numberOfCopies || packet?.totalScripts || 50);
  const initialMarked = Number(packet?.markedScripts || 0);

  const [totalScripts, setTotalScripts] = useState(initialTotal);
  const [markedScripts, setMarkedScripts] = useState(initialMarked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (packet?.numberOfCopies || packet?.totalScripts) {
      setTotalScripts(Number(packet.numberOfCopies || packet.totalScripts));
    }
    if (packet?.markedScripts !== undefined) {
      setMarkedScripts(Number(packet.markedScripts));
    }
  }, [packet]);

  const effectiveTotal = Math.max(1, Number(totalScripts) || 1);
  const effectiveMarked = Math.max(0, Math.min(effectiveTotal, Number(markedScripts) || 0));
  const remaining = Math.max(0, effectiveTotal - effectiveMarked);
  const percentage = Math.round((effectiveMarked / effectiveTotal) * 100);

  const handleIncrement = (amount) => {
    setError("");
    setMarkedScripts((prev) => Math.min(effectiveTotal, Math.max(0, (Number(prev) || 0) + amount)));
  };

  const handleSetAll = () => {
    setError("");
    setMarkedScripts(effectiveTotal);
  };

  const handleMarkedChange = (val) => {
    setError("");
    const num = val === "" ? "" : parseInt(val, 10);
    if (val === "") {
      setMarkedScripts("");
      return;
    }
    if (isNaN(num)) return;
    if (num < 0) {
      setError("Marked scripts cannot be negative");
      return;
    }
    if (num > effectiveTotal) {
      setError(`Marked scripts cannot exceed total copies (${effectiveTotal})`);
    }
    setMarkedScripts(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalMarked = Number(markedScripts) || 0;
    if (finalMarked < 0 || finalMarked > effectiveTotal) {
      setError(`Please enter a valid marked count between 0 and ${effectiveTotal}`);
      return;
    }

    setLoading(true);

    try {
      const pId = packet.packetId || packet.id;
      const cleanId = typeof pId === "string" && pId.includes("-") ? parseInt(pId.split("-")[2], 10) : pId;

      await lecturerApi.addMarkingScripts({
        packetId: String(cleanId),
        totalScripts: Number(effectiveTotal),
        markedScripts: Number(finalMarked),
        lecturerId: lecturerId || packet.lecturerUsername || packet.lecturerName || "lecturer",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update marking scripts", err);
      setError(
        err.response?.data?.message ||
          "Failed to update marking progress. Please check permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-50 via-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c4dff]/10 text-[#7c4dff] flex items-center justify-center font-bold text-base">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#7c4dff] uppercase tracking-wider bg-purple-100/60 px-2 py-0.5 rounded">
                  Paper Marking Stage
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {packet.packetId || `PKT-${packet.id}`}
                </span>
              </div>
              <h2 className="font-bold text-slate-900 text-sm mt-0.5">
                {packet.courseCode} - {packet.courseName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Visual Progress Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Marking Progress
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {effectiveMarked}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    / {effectiveTotal} Copies
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${percentage === 100 ? "text-emerald-600" : "text-[#7c4dff]"}`}>
                  {percentage}%
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {remaining === 0 ? "🎉 Completed" : `${remaining} left to mark`}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentage === 100
                    ? "bg-emerald-500"
                    : percentage > 50
                    ? "bg-gradient-to-r from-[#7c4dff] to-indigo-500"
                    : "bg-[#7c4dff]"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Total Script Copies
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={totalScripts}
                  onChange={(e) => setTotalScripts(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff] font-semibold text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Total number of printed answer packets
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Copies Marked So Far
              </label>
              <input
                type="number"
                min="0"
                max={effectiveTotal}
                required
                value={markedScripts}
                onChange={(e) => handleMarkedChange(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#7c4dff]/40 rounded-xl outline-none focus:ring-2 focus:ring-[#7c4dff] font-bold text-slate-900 text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enter current count completed
              </span>
            </div>
          </div>

          {/* Quick Increment Chips */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Increment
            </span>
            <div className="flex flex-wrap gap-2">
              {[+1, +5, +10, +25].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleIncrement(inc)}
                  disabled={effectiveMarked + inc > effectiveTotal}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition cursor-pointer text-xs"
                >
                  +{inc}
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetAll}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold transition cursor-pointer text-xs ml-auto flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> All Done ({effectiveTotal})
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#7c4dff] text-white rounded-xl font-bold hover:bg-[#6c3de8] transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#7c4dff]/20 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? "Updating..." : "Save Marking Progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
