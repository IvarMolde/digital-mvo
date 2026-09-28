import readXlsxFile, { type CellValue, type Sheet } from 'read-excel-file/browser';
import { COLUMN_MATCHERS, GoalRowSchema, REQUIRED_COLUMNS, type GoalRow, type GoalRowField } from './schema';
import type { Chapter, Goal, Plan, SkippedRow, Subject } from '../types';

export const DATA_URL = `${import.meta.env.BASE_URL}data/digitale-ferdigheter.xlsx`;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export class PlanLoadError extends Error {}

const normalize = (s: unknown) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function pageNumber(side: string): number {
  const match = side.match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
}

function findColumns(header: readonly (CellValue | null)[]): Partial<Record<GoalRowField, number>> {
  const titles = header.map(normalize);
  const result: Partial<Record<GoalRowField, number>> = {};
  // Lengste treff først, så «eksempel nivå 1» ikke fanges opp av «nivå 1».
  const fields = (Object.keys(COLUMN_MATCHERS) as GoalRowField[]).sort(
    (a, b) => COLUMN_MATCHERS[b].length - COLUMN_MATCHERS[a].length,
  );
  const taken = new Set<number>();
  for (const field of fields) {
    const key = COLUMN_MATCHERS[field];
    const idx = titles.findIndex((t, i) => !taken.has(i) && t.startsWith(key));
    if (idx >= 0) {
      result[field] = idx;
      taken.add(idx);
    }
  }
  return result;
}

function splitChapter(kapittel: string): { hoved: string; under: string } {
  const [hoved, ...rest] = kapittel.split(/\s+[–-]\s+/);
  return rest.length ? { hoved: hoved!.trim(), under: rest.join(' – ').trim() } : { hoved: '', under: kapittel };
}

function toGoal(row: GoalRow, subjectId: string): Goal {
  return {
    id: `${subjectId}-${row.nr}`,
    nr: row.nr,
    dokument: row.dokument,
    kapittel: row.kapittel,
    maal: row.maal,
    side: row.side,
    nivaer: [
      { nummer: 1, beskrivelse: row.nivaa1, eksempel: row.eksempel1 },
      { nummer: 2, beskrivelse: row.nivaa2, eksempel: row.eksempel2 },
      { nummer: 3, beskrivelse: row.nivaa3, eksempel: row.eksempel3 },
    ],
  };
}

function buildSubject(sheet: Sheet, skipped: SkippedRow[]): Subject | null {
  const [header, ...rows] = sheet.data;
  if (!header) return null;

  const columns = findColumns(header);
  const missing = REQUIRED_COLUMNS.filter((c) => columns[c] === undefined);
  if (missing.length) {
    skipped.push({ ark: sheet.sheet, rad: 1, grunn: `Mangler kolonner: ${missing.map((m) => COLUMN_MATCHERS[m]).join(', ')}` });
    return null;
  }

  const subjectId = slugify(sheet.sheet);
  const goals: Goal[] = [];

  rows.forEach((cells, i) => {
    if (cells.every((c) => c === null || String(c).trim() === '')) return;
    const raw = Object.fromEntries(
      (Object.keys(columns) as GoalRowField[]).map((field) => [field, cells[columns[field]!]]),
    );
    const parsed = GoalRowSchema.safeParse(raw);
    if (!parsed.success) {
      skipped.push({ ark: sheet.sheet, rad: i + 2, grunn: parsed.error.issues.map((x) => x.message).join('; ') });
      return;
    }
    goals.push(toGoal(parsed.data, subjectId));
  });

  const byChapter = new Map<string, Goal[]>();
  for (const goal of goals) {
    const list = byChapter.get(goal.kapittel) ?? [];
    list.push(goal);
    byChapter.set(goal.kapittel, list);
  }

  // Kapitlene sorteres etter sidetall, slik at rekkefølgen følger læreplanen.
  const kapitler: Chapter[] = [...byChapter.entries()]
    .map(([tittel, maal]) => {
      const sorted = [...maal].sort((a, b) => pageNumber(a.side) - pageNumber(b.side) || Number(a.nr) - Number(b.nr));
      return { id: slugify(tittel), tittel, ...splitChapter(tittel), maal: sorted };
    })
    .sort((a, b) => pageNumber(a.maal[0]!.side) - pageNumber(b.maal[0]!.side));

  return { id: subjectId, navn: sheet.sheet, kapitler };
}

export async function loadPlan(signal?: AbortSignal): Promise<Plan> {
  let buffer: ArrayBuffer;
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache', signal });
    if (!res.ok) throw new PlanLoadError(`HTTP ${res.status}`);
    buffer = await res.arrayBuffer();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new PlanLoadError('Fant ikke datafilen.');
  }
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_FILE_BYTES) {
    throw new PlanLoadError('Datafilen er tom eller for stor.');
  }

  let sheets: Sheet[];
  try {
    sheets = await readXlsxFile(buffer);
  } catch {
    throw new PlanLoadError('Datafilen kunne ikke leses som et Excel-regneark.');
  }

  const hoppetOver: SkippedRow[] = [];
  const fag = sheets.map((s) => buildSubject(s, hoppetOver)).filter((s): s is Subject => s !== null && s.kapitler.length > 0);
  if (!fag.length) throw new PlanLoadError('Datafilen inneholder ingen gyldige mål.');
  return { fag, hoppetOver };
}
