import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PROCEDURES, type Procedure } from "./procedures-data";

export type DbfUpload = {
  id: string; // uuid
  fileName: string;
  competencia: string; // AAAAMM extracted from PRD_CMP majority
  recordCount: number;
  uploadedAt: string;
  // Aggregated produced per procedure id (computed at upload time so we don't re-parse)
  production: Record<string, { produced: number; presented: number; valueApproved: number; records: number }>;
};

export type DemandEntry = {
  procedureId: string;
  filaAtual: number;       // current waiting-list size
  entradaMensal: number;   // new patients/month
  capacidadeMensal: number; // declared hospital monthly capacity
  metaPropostaHospital: number; // user-proposed PS-AMB monthly target
  metaPropostaRegulacao: number; // user-proposed REGSMS monthly target
};

type Store = {
  procedures: Procedure[];
  uploads: DbfUpload[];
  selectedUploadIds: string[]; // which to include in analysis (default all)
  demand: Record<string, DemandEntry>;
  // actions
  setProcedures: (p: Procedure[]) => void;
  updateProcedure: (id: string, patch: Partial<Procedure>) => void;
  resetProcedures: () => void;
  addUpload: (u: DbfUpload) => void;
  removeUpload: (id: string) => void;
  toggleUpload: (id: string) => void;
  setDemand: (id: string, patch: Partial<DemandEntry>) => void;
  initDemandFromProcedure: (id: string) => void;
  clearAll: () => void;
};

const defaultDemand = (p: Procedure): DemandEntry => ({
  procedureId: p.id,
  filaAtual: 0,
  entradaMensal: 0,
  capacidadeMensal: p.metaTotal,
  metaPropostaHospital: p.metaHospital,
  metaPropostaRegulacao: p.metaRegulacao,
});

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      procedures: PROCEDURES,
      uploads: [],
      selectedUploadIds: [],
      demand: Object.fromEntries(PROCEDURES.map((p) => [p.id, defaultDemand(p)])),
      setProcedures: (p) => set({ procedures: p }),
      updateProcedure: (id, patch) =>
        set({
          procedures: get().procedures.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      resetProcedures: () =>
        set({
          procedures: PROCEDURES,
          demand: Object.fromEntries(PROCEDURES.map((p) => [p.id, defaultDemand(p)])),
        }),
      addUpload: (u) =>
        set({ uploads: [...get().uploads, u], selectedUploadIds: [...get().selectedUploadIds, u.id] }),
      removeUpload: (id) =>
        set({
          uploads: get().uploads.filter((u) => u.id !== id),
          selectedUploadIds: get().selectedUploadIds.filter((x) => x !== id),
        }),
      toggleUpload: (id) =>
        set({
          selectedUploadIds: get().selectedUploadIds.includes(id)
            ? get().selectedUploadIds.filter((x) => x !== id)
            : [...get().selectedUploadIds, id],
        }),
      setDemand: (id, patch) =>
        set({
          demand: {
            ...get().demand,
            [id]: { ...(get().demand[id] ?? defaultDemand(get().procedures.find((p) => p.id === id)!)), ...patch },
          },
        }),
      initDemandFromProcedure: (id) => {
        const p = get().procedures.find((x) => x.id === id);
        if (!p) return;
        set({ demand: { ...get().demand, [id]: defaultDemand(p) } });
      },
      clearAll: () =>
        set({
          procedures: PROCEDURES,
          uploads: [],
          selectedUploadIds: [],
          demand: Object.fromEntries(PROCEDURES.map((p) => [p.id, defaultDemand(p)])),
        }),
    }),
    { name: "hmsj-conv-ambulatorio-v1" },
  ),
);

// Helper: aggregated production across selected uploads, per procedure
export function selectAggregatedProduction(state: Store) {
  const map: Record<string, { produced: number; presented: number; valueApproved: number; months: number }> = {};
  for (const p of state.procedures) map[p.id] = { produced: 0, presented: 0, valueApproved: 0, months: 0 };
  const selected = state.uploads.filter((u) => state.selectedUploadIds.includes(u.id));
  for (const u of selected) {
    for (const p of state.procedures) {
      const v = u.production[p.id];
      if (!v) continue;
      map[p.id].produced += v.produced;
      map[p.id].presented += v.presented;
      map[p.id].valueApproved += v.valueApproved;
    }
  }
  const monthsCount = new Set(selected.map((u) => u.competencia)).size || 1;
  for (const id in map) map[id].months = monthsCount;
  return map;
}
