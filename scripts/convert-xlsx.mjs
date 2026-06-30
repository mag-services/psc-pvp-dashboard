/**
 * Pre-build step: converts public/data/ministries_pvp.xlsx → public/data/ministries_pvp.json
 * Run via `npm run convert` or automatically as part of `npm run build`.
 *
 * The xlsx file may contain many phantom empty columns (e.g. A1:XEZ5130).
 * We limit the sheet range to the first 7 columns (A:G) before parsing to
 * avoid the huge memory footprint caused by those stray cells.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { read, utils } from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsxPath = join(__dirname, '..', 'public', 'data', 'ministries_pvp.xlsx');
const jsonPath = join(__dirname, '..', 'public', 'data', 'ministries_pvp.json');

const EXPECTED_HEADERS = [
  'MINISTRY',
  'DEPARTMENT',
  'PRIORITY VACANT POSTS',
  'POST NUMBER',
  'SALARY SCALE',
  'ANNUAL SALARY',
  'RECRUITMENT STATUS',
];

const buf = readFileSync(xlsxPath);
const wb = read(buf, { type: 'buffer', sheetStubs: false });

const sheetName = wb.SheetNames.find((n) => n.trim().toLowerCase() === 'data');
if (!sheetName) {
  console.error(`Sheet "data" not found. Available: ${wb.SheetNames.join(', ')}`);
  process.exit(1);
}

const ws = wb.Sheets[sheetName];

// Clamp the sheet range to the first 7 columns to ignore phantom empty columns.
// The real data is always in columns A-G; anything beyond that is formatting artefacts.
if (ws['!ref']) {
  const range = utils.decode_range(ws['!ref']);
  range.e.c = Math.min(range.e.c, EXPECTED_HEADERS.length - 1); // 0-indexed: 6 = column G
  ws['!ref'] = utils.encode_range(range);
}

const rows = utils.sheet_to_json(ws, { raw: false, defval: '', blankrows: false });

// Keep only rows where MINISTRY is non-empty (normalised to uppercase).
function normalizeKey(k) {
  return String(k).trim().replace(/\s+/g, ' ').toUpperCase();
}

const filtered = rows
  .map((row) => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[normalizeKey(k)] = String(v ?? '').trim();
    }
    return out;
  })
  .filter((r) => (r['MINISTRY'] ?? '') !== '');

const jsonStr = JSON.stringify(filtered);
writeFileSync(jsonPath, jsonStr);
console.log(
  `convert-xlsx: ${filtered.length} rows, ${(jsonStr.length / 1024).toFixed(1)} KB → ${jsonPath}`,
);
