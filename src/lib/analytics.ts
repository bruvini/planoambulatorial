import type { Procedure } from "./procedures-data";
import type { DbfRow } from "./dbf-parser";

export function rowMatchesProcedure(row: DbfRow, p: Procedure): boolean {
  const pa = String(row.PRD_PA ?? "").padStart(10, "0");
  const cbo = String(row.PRD_CBO ?? "").trim();

  let codeMatch = false;
  if (p.sigtap.length > 0) {
    codeMatch = p.sigtap.includes(pa);
  } else if (p.grupo) {
    if (pa.slice(0, 2) !== p.grupo) codeMatch = false;
    else if (p.subgrupo && pa.slice(2, 4) !== p.subgrupo) codeMatch = false;
    else if (p.formaOrg && pa.slice(4, 6) !== p.formaOrg) codeMatch = false;
    else codeMatch = true;
  }
  if (!codeMatch) return false;

  if (p.cbo.length > 0 && !p.cbo.includes(cbo)) return false;
  return true;
}

export type ProductionRow = {
  procedureId: string;
  produced: number;
  presented: number;
  valueApproved: number;
  records: number;
};

export function aggregateProduction(
  procedures: Procedure[],
  rows: DbfRow[],
): Map<string, ProductionRow> {
  const map = new Map<string, ProductionRow>();
  for (const p of procedures)
    map.set(p.id, { procedureId: p.id, produced: 0, presented: 0, valueApproved: 0, records: 0 });
  for (const r of rows) {
    for (const p of procedures) {
      if (!rowMatchesProcedure(r, p)) continue;
      const m = map.get(p.id)!;
      m.produced += Number(r.PRD_QT_A ?? 0);
      m.presented += Number(r.PRD_QT_P ?? 0);
      m.valueApproved += Number(r.PRD_VL_A ?? 0);
      m.records += 1;
    }
  }
  return map;
}

/**
 * Projeção da fila ao longo de N meses, considerando entrada (novos pedidos)
 * e saída total mensal (capacidade proposta + saídas externas históricas, p.ex.
 * transferências, abandono, óbito). A saída efetiva nunca passa do tamanho da
 * fila disponível no mês.
 */
export function projectQueue(opts: {
  initialQueue: number;
  monthlyIntake: number;
  monthlyExits?: number; // vazão "outra" — independente da meta proposta
  capacity: number;       // meta proposta hospital + regulação
  months?: number;
}) {
  const months = opts.months ?? 60;
  const exits = opts.monthlyExits ?? 0;
  const out: {
    month: number;
    queue: number;
    served: number;     // atendidos pela meta proposta
    otherExits: number; // demais saídas (transferência, abandono, óbito…)
    intake: number;
  }[] = [];
  let q = opts.initialQueue;
  for (let m = 1; m <= months; m++) {
    q += opts.monthlyIntake;
    const served = Math.min(q, opts.capacity);
    q -= served;
    const otherExits = Math.min(q, exits);
    q -= otherExits;
    out.push({ month: m, queue: q, served, otherExits, intake: opts.monthlyIntake });
  }
  return out;
}

export function monthsToZero(initialQueue: number, monthlyIntake: number, totalOutflow: number) {
  if (totalOutflow <= monthlyIntake) return -1;
  return Math.ceil(initialQueue / (totalOutflow - monthlyIntake));
}
