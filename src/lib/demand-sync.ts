import { supabase } from "@/integrations/supabase/client";
import type { DemandEntry } from "./store";

const TABLE = "demand_entries" as const;

type Row = {
  procedure_id: string;
  fila_atual: number;
  entrada_mensal: number;
  saida_mensal: number;
  capacidade_mensal: number;
  meta_proposta_hospital: number;
  meta_proposta_regulacao: number;
  items: unknown;
  updated_at?: string;
};

const toRow = (d: DemandEntry): Row => ({
  procedure_id: d.procedureId,
  fila_atual: d.filaAtual,
  entrada_mensal: d.entradaMensal,
  saida_mensal: d.saidaMensal,
  capacidade_mensal: d.capacidadeMensal,
  meta_proposta_hospital: d.metaPropostaHospital,
  meta_proposta_regulacao: d.metaPropostaRegulacao,
  items: d.items ?? [],
});

const fromRow = (r: Row): DemandEntry => ({
  procedureId: r.procedure_id,
  filaAtual: Number(r.fila_atual) || 0,
  entradaMensal: Number(r.entrada_mensal) || 0,
  saidaMensal: Number(r.saida_mensal) || 0,
  capacidadeMensal: Number(r.capacidade_mensal) || 0,
  metaPropostaHospital: Number(r.meta_proposta_hospital) || 0,
  metaPropostaRegulacao: Number(r.meta_proposta_regulacao) || 0,
  items: Array.isArray(r.items) ? (r.items as DemandEntry["items"]) : [],
});

export async function saveDemandToCloud(demand: Record<string, DemandEntry>) {
  const rows = Object.values(demand).map(toRow);
  // Upsert em lote
  const { error } = await (supabase as any)
    .from(TABLE)
    .upsert(rows, { onConflict: "procedure_id" });
  if (error) throw error;
  return rows.length;
}

export async function loadDemandFromCloud(): Promise<Record<string, DemandEntry>> {
  const { data, error } = await (supabase as any).from(TABLE).select("*");
  if (error) throw error;
  const out: Record<string, DemandEntry> = {};
  for (const r of (data ?? []) as Row[]) out[r.procedure_id] = fromRow(r);
  return out;
}
