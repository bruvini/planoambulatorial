// Minimal browser-side dBase III/IV (.dbf) parser, tailored for SIA/SUS PA files.
// Reads only the fields we need; returns plain rows.

export type DbfField = { name: string; type: string; length: number; decimals: number; offset: number };
export type DbfRow = Record<string, string | number>;
export type DbfFile = { fields: DbfField[]; rows: DbfRow[]; recordCount: number; fileName: string };

const decoder = new TextDecoder("latin1");

function toAscii(buf: Uint8Array): string {
  // Trim NULs and spaces, decode as latin1 (SIA/SUS DBFs use cp850/latin1)
  let end = buf.length;
  while (end > 0 && (buf[end - 1] === 0x00 || buf[end - 1] === 0x20)) end--;
  let start = 0;
  while (start < end && buf[start] === 0x20) start++;
  return decoder.decode(buf.subarray(start, end));
}

export function parseDbf(buffer: ArrayBuffer, fileName = "file.dbf"): DbfFile {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const recordCount = view.getUint32(4, true);
  const headerSize = view.getUint16(8, true);
  const recordSize = view.getUint16(10, true);

  const fields: DbfField[] = [];
  let pos = 32;
  let offset = 1; // first byte of each record is deletion flag
  while (pos < headerSize - 1 && bytes[pos] !== 0x0d) {
    const name = toAscii(bytes.subarray(pos, pos + 11));
    const type = String.fromCharCode(bytes[pos + 11]);
    const length = bytes[pos + 16];
    const decimals = bytes[pos + 17];
    fields.push({ name, type, length, decimals, offset });
    offset += length;
    pos += 32;
  }

  const rows: DbfRow[] = [];
  let cursor = headerSize;
  for (let i = 0; i < recordCount; i++, cursor += recordSize) {
    if (bytes[cursor] === 0x2a) continue; // deleted
    const row: DbfRow = {};
    for (const f of fields) {
      const raw = bytes.subarray(cursor + f.offset, cursor + f.offset + f.length);
      const txt = toAscii(raw);
      if (f.type === "N" || f.type === "F") {
        const n = parseFloat(txt);
        row[f.name] = Number.isFinite(n) ? n : 0;
      } else {
        row[f.name] = txt;
      }
    }
    rows.push(row);
  }
  return { fields, rows, recordCount: rows.length, fileName };
}

export async function parseDbfFile(file: File): Promise<DbfFile> {
  const buf = await file.arrayBuffer();
  return parseDbf(buf, file.name);
}
