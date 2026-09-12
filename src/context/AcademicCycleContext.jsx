import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const AcademicCycleContext = createContext(null);

export function AcademicCycleProvider({ children }) {
  const [cycles, setCycles] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [selectedCycleId, setSelectedCycleId] = useState(() => {
    return localStorage.getItem("selectedCycleId") || "";
  });
  const [loadingCycles, setLoadingCycles] = useState(true);

  const fetchCycles = useCallback(async () => {
    setLoadingCycles(true);
    try {
      const res = await axiosInstance.get("/cycles");
      const list = Array.isArray(res.data) ? res.data : [];
      setCycles(list);

      const active = list.find((c) => c.status === "ACTIVE") || list[0] || null;
      setActiveCycle(active);

      // If no valid selected cycle in storage, default to active cycle
      const stored = localStorage.getItem("selectedCycleId");
      if (!stored || !list.some((c) => c.cycleId === stored)) {
        if (active) {
          setSelectedCycleId(active.cycleId);
          localStorage.setItem("selectedCycleId", active.cycleId);
        }
      }
    } catch (err) {
      console.error("Failed to load academic cycles:", err);
    } finally {
      setLoadingCycles(false);
    }
  }, []);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const selectCycle = (cycleId) => {
    setSelectedCycleId(cycleId);
    if (cycleId) {
      localStorage.setItem("selectedCycleId", cycleId);
    } else {
      localStorage.removeItem("selectedCycleId");
    }
  };

  const selectedCycle = cycles.find((c) => c.cycleId === selectedCycleId) || activeCycle;
  const isHistoricalView = Boolean(selectedCycle && selectedCycle.status !== "ACTIVE" && selectedCycleId !== "ALL");

  return (
    <AcademicCycleContext.Provider
      value={{
        cycles,
        activeCycle,
        selectedCycleId,
        selectedCycle,
        isHistoricalView,
        loadingCycles,
        selectCycle,
        refreshCycles: fetchCycles,
      }}
    >
      {children}
    </AcademicCycleContext.Provider>
  );
}

export function useAcademicCycle() {
  const context = useContext(AcademicCycleContext);
  if (!context) {
    throw new Error("useAcademicCycle must be used within an AcademicCycleProvider");
  }
  return context;
}
