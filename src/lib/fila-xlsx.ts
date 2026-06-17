import * as XLSX from "xlsx";
import type { Procedure } from "./procedures-data";
import type { DemandEntry, DemandItem } from "./store";

type RawRow = {
  item: string;
  proc: string;
  fila: number;
  entrada: number;
  saida: number;
};

const num = (v: unknown): number => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(",", ".").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

// Extrai o ID "1.2", "1.10", "1.51"… do início da string "Item da Lista".
function extractId(itemLabel: string): string | null {
  const m = itemLabel.match(/^\s*(\d+\.\d+)\b/);
  return m ? m[1] : null;
}

export type FilaImportResult = {
  matched: Record<string, Partial<DemandEntry>>;
  unmatched: { item: string; reason: string }[];
};

export function parseFilaXlsx(buffer: ArrayBuffer, procedures: Procedure[]): FilaImportResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  const procIds = new Set(procedures.map((p) => p.id));

  // Aceita variações dos nomes de coluna (com/sem quebra de linha).
  const pickKey = (row: Record<string, unknown>, patterns: RegExp[]) => {
    for (const k of Object.keys(row)) for (const p of patterns) if (p.test(k)) return k;
    return null;
  };

  const rows: RawRow[] = [];
  for (const r of json) {
    const kItem = pickKey(r, [/item.*lista/i]);
    const kProc = pickKey(r, [/procedimento.*fila/i]);
    const kFila = pickKey(r, [/volume.*fila/i]);
    const kEnt = pickKey(r, [/entradas?/i]);
    const kSai = pickKey(r, [/sa(í|i)das?/i]);
    if (!kItem) continue;
    const itemLabel = String(r[kItem] ?? "").trim();
    if (!itemLabel || /^total/i.test(itemLabel)) continue;
    rows.push({
      item: itemLabel,
      proc: kProc ? String(r[kProc] ?? "").trim() : "",
      fila: kFila ? num(r[kFila]) : 0,
      entrada: kEnt ? num(r[kEnt]) : 0,
      saida: kSai ? num(r[kSai]) : 0,
    });
  }

  // Agrupa por procedureId.
  const grouped = new Map<string, RawRow[]>();
  const unmatched: { item: string; reason: string }[] = [];
  for (const r of rows) {
    const id = extractId(r.item);
    if (!id) { unmatched.push({ item: r.item, reason: "Sem ID numérico no início" }); continue; }
    if (!procIds.has(id)) { unmatched.push({ item: r.item, reason: `ID ${id} não consta na lista de 55 procedimentos` }); continue; }
    const cur = grouped.get(id) ?? [];
    cur.push(r);
    grouped.set(id, cur);
  }

  const matched: Record<string, Partial<DemandEntry>> = {};
  for (const [id, list] of grouped) {
    const items: DemandItem[] = list.map((r) => ({
      nome: r.proc,
      fila: r.fila,
      entrada: r.entrada,
      saida: r.saida,
    }));
    matched[id] = {
      filaAtual: items.reduce((a, x) => a + x.fila, 0),
      entradaMensal: items.reduce((a, x) => a + x.entrada, 0),
      saidaMensal: items.reduce((a, x) => a + x.saida, 0),
      items,
    };
  }

  return { matched, unmatched };
}
