import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PROCEDURES, type Procedure } from "./procedures-data";

export type DbfUpload = {
  id: string;
  fileName: string;
  competencia: string;
  recordCount: number;
  uploadedAt: string;
  production: Record<string, { produced: number; presented: number; valueApproved: number; records: number }>;
};

export type DemandItem = {
  nome: string;          // "Procedimento da Fila (ARE)"
  fila: number;
  entrada: number;
  saida: number;
};

export type DemandEntry = {
  procedureId: string;
  filaAtual: number;
  entradaMensal: number;
  saidaMensal: number;           // ← NOVO: média mensal de saídas (vazão atual)
  capacidadeMensal: number;
  metaPropostaHospital: number;
  metaPropostaRegulacao: number;
  items: DemandItem[];           // composição vinda da planilha (vários ARE por item da lista)
};

type Store = {
  procedures: Procedure[];
  uploads: DbfUpload[];
  selectedUploadIds: string[];
  demand: Record<string, DemandEntry>;
  setProcedures: (p: Procedure[]) => void;
  updateProcedure: (id: string, patch: Partial<Procedure>) => void;
  resetProcedures: () => void;
  addUpload: (u: DbfUpload) => void;
  removeUpload: (id: string) => void;
  toggleUpload: (id: string) => void;
  setDemand: (id: string, patch: Partial<DemandEntry>) => void;
  setDemandBulk: (entries: Record<string, Partial<DemandEntry>>) => void;
  initDemandFromProcedure: (id: string) => void;
  clearAll: () => void;
};

const defaultDemand = (p: Procedure): DemandEntry => ({
  procedureId: p.id,
  filaAtual: 0,
  entradaMensal: 0,
  saidaMensal: 0,
  capacidadeMensal: p.metaTotal,
  metaPropostaHospital: p.metaHospital,
  metaPropostaRegulacao: p.metaRegulacao,
  items: [],
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
        set({ procedures: get().procedures.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
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
      setDemand: (id, patch) => {
        const proc = get().procedures.find((p) => p.id === id);
        if (!proc) return;
        set({
          demand: {
            ...get().demand,
            [id]: { ...(get().demand[id] ?? defaultDemand(proc)), ...patch },
          },
        });
      },
      setDemandBulk: (entries) => {
        const cur = get().demand;
        const next = { ...cur };
        for (const [id, patch] of Object.entries(entries)) {
          const proc = get().procedures.find((p) => p.id === id);
          if (!proc) continue;
          next[id] = { ...(cur[id] ?? defaultDemand(proc)), ...patch };
        }
        set({ demand: next });
      },
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
