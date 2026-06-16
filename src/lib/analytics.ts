import type { Procedure } from "./procedures-data";
import type { DbfRow } from "./dbf-parser";

// Match a single record to a procedure rule.
// Logic:
//  - If procedure has SIGTAP codes list → match by PRD_PA in list
//  - Otherwise if it has grupo/subgrupo → match by code prefix (positions 1-2 = grupo, 3-4 = subgrupo, 5-6 = forma)
//  - If procedure has CBO list → also require PRD_CBO in list
//  - Note: "DESCONTADO PTx" rules are informative; user adjusts manually in the UI.
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
  produced: number; // sum of PRD_QT_A (approved)
  presented: number; // sum of PRD_QT_P
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

// 60-month queue projection.
// queue: current backlog; monthlyIntake: new patients/month; capacity: monthly hospital throughput
// Returns array of {month, queue, served, backlog}
export function projectQueue(opts: {
  initialQueue: number;
  monthlyIntake: number;
  capacity: number;
  months?: number;
}) {
  const months = opts.months ?? 60;
  const out: { month: number; queue: number; served: number; intake: number }[] = [];
  let q = opts.initialQueue;
  for (let m = 1; m <= months; m++) {
    q += opts.monthlyIntake;
    const served = Math.min(q, opts.capacity);
    q -= served;
    out.push({ month: m, queue: q, served, intake: opts.monthlyIntake });
  }
  return out;
}

// Time-to-zero queue (months); -1 if never
export function monthsToZero(initialQueue: number, monthlyIntake: number, capacity: number) {
  if (capacity <= monthlyIntake) return -1;
  return Math.ceil(initialQueue / (capacity - monthlyIntake));
}
