import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const STAGE_COLORS = {
  Draft: { circle: "border-gray-300 text-gray-400", label: "text-gray-400" },
  Submitted: { circle: "border-blue-500 text-blue-500 bg-blue-50", label: "text-blue-500" },
  Moderation: { circle: "border-yellow-500 text-yellow-500 bg-yellow-50", label: "text-yellow-500" },
  Approved: { circle: "border-green-500 text-green-500 bg-green-50", label: "text-green-500" },
  Printing: { circle: "border-purple-500 text-purple-500 bg-purple-50", label: "text-purple-500" },
  Completed: { circle: "border-gray-800 text-gray-800 bg-gray-100", label: "text-gray-700" },
};

const STATUS_BADGE = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-blue-100 text-blue-700",
  UNDER_MODERATION: "bg-yellow-100 text-yellow-700",
  PRINTING_QUEUE: "bg-purple-100 text-purple-700",
  DRAFT: "bg-gray-100 text-gray-600",
  COMPLETED: "bg-teal-100 text-teal-700",
  DELAYED: "bg-red-100 text-red-600",
};

const STATUS_LABELS = {
  APPROVED: "Approved",
  PENDING: "Submitted",
  UNDER_MODERATION: "Moderation",
  PRINTING_QUEUE: "Printing",
  DRAFT: "Draft",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
};

export default function Workflow() {
  const [packets, setPackets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredPackets = packets.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.packetId.toLowerCase().includes(q) ||
      p.courseCode.toLowerCase().includes(q) ||
      p.courseName.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/workflow");
        setPackets(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      } catch (err) {
        setError("Failed to load workflow.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading workflow...</div>;
  if (error) return <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>;

  return (
    <div className="space-y-4">

      {/* Top — workflow stages diagram */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-6">Exam Paper Workflow</h2>
        <div className="flex items-start justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-px bg-gray-200 z-0 mx-10" />
          {(selected?.stages || []).map((stage, i) => {
            const colors = STAGE_COLORS[stage.stageName] || STAGE_COLORS.Draft;
            return (
              <div key={i} className="flex flex-col items-center z-10 flex-1">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold bg-white ${
                  stage.completed ? "border-gray-400 bg-gray-100 text-gray-500" :
                  stage.current ? colors.circle :
                  "border-gray-200 text-gray-300"
                }`}>
                  {i + 1}
                </div>
                <p className={`text-xs font-semibold mt-2 ${
                  stage.current ? colors.label :
                  stage.completed ? "text-gray-400" : "text-gray-300"
                }`}>
                  {stage.stageName}
                </p>
                <p className="text-xs text-gray-400 text-center mt-0.5 max-w-16">
                  {stage.actor}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom — active packets + detail */}
      <div className="flex gap-4 h-[calc(100vh-320px)]">

        {/* Left — packet list */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">

          {/* Header + search */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Active Packets</h3>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by ID or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none text-gray-600 w-full"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Packet list */}
          <div className="divide-y divide-gray-50">
            {filteredPackets.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm text-gray-400">No packets match "{search}"</p>
              </div>
            ) : (
              filteredPackets.map((p, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(p)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selected?.packetId === p.packetId ? "bg-blue-50 border-l-4 border-[#7c4dff]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-400">{p.packetId}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[p.status] || "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{p.courseCode}</p>
                  <p className="text-xs text-gray-400 mb-2">{p.courseName}</p>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-[#7c4dff] transition-all"
                      style={{ width: `${(p.currentStage / p.totalStages) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Stage {p.currentStage} of {p.totalStages}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — stage detail */}
        {selected && (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{selected.packetId}</p>
                <h2 className="text-xl font-bold text-gray-800">{selected.courseName}</h2>
                <p className="text-sm text-gray-400">{selected.courseCode}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_BADGE[selected.status] || "bg-gray-100"}`}>
                {STATUS_LABELS[selected.status] || selected.status}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-6">Stage Progress</h3>
              <div className="space-y-0">
                {selected.stages.map((stage, i) => {
                  const colors = STAGE_COLORS[stage.stageName] || STAGE_COLORS.Draft;
                  return (
                    <div key={i} className="flex gap-4">
                      {/* Circle + line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          stage.completed ? "border-gray-300 bg-gray-100" :
                          stage.current ? colors.circle :
                          "border-gray-200 bg-white"
                        }`}>
                          {stage.completed ? (
                            <span className="text-gray-400 text-xs">✓</span>
                          ) : stage.current ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-current" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                          )}
                        </div>
                        {i < selected.stages.length - 1 && (
                          <div className={`w-px flex-1 my-1 min-h-8 ${stage.completed ? "bg-gray-300" : "bg-gray-100"}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-6 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-semibold ${
                            stage.current ? colors.label :
                            stage.completed ? "text-gray-500" : "text-gray-300"
                          }`}>
                            {stage.stageName}
                          </p>
                          {stage.current && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{stage.actor}</p>

                        {/* Events */}
                        {stage.events.map((ev, j) => (
                          <div key={j} className="flex items-center justify-between py-1">
                            <p className="text-sm text-gray-600">{ev.message}</p>
                            <p className="text-xs text-gray-400 ml-4 whitespace-nowrap">{ev.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}