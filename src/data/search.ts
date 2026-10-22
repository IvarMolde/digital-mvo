import type { Chapter, Goal, Subject } from '../types';
import { buildMenu, type MenuTone } from './menu';

/** Ett mål med alt som trengs for å søke, sortere og vise det i listevisningen. */
export interface GoalEntry {
  goal: Goal;
  fag: Subject;
  kapittel: Chapter;
  /** Der målet ligger i menyen, f.eks. «A1 · Skrive» eller «Modul 2». */
  sted: string;
  henvisning?: string;
  tone: MenuTone;
  /** Plassering i læreplanen på tvers av fagene i området. */
  order: number;
  fields: IndexedField[];
}

export type FieldName = 'maal' | 'sted' | 'fag' | 'nivaa' | 'eksempel' | 'side' | 'nr';

interface IndexedField {
  name: FieldName;
  text: string;
  words: string[];
}

export interface SearchResult {
  entry: GoalEntry;
  score: number;
  /** Feltene som ga treff, i vektrekkefølge. */
  treff: FieldName[];
}

export const FIELD_LABELS: Record<FieldName, string> = {
  maal: 'målformuleringen',
  sted: 'kapittel/modul',
  fag: 'fag',
  nivaa: 'nivåbeskrivelse',
  eksempel: 'klasseromseksempel',
  side: 'sidetall',
  nr: 'målnummer',
};

// Treff i selve målformuleringen teller mest, treff i eksemplene minst.
const WEIGHTS: Record<FieldName, number> = {
  maal: 10,
  nr: 8,
  sted: 6,
  fag: 4,
  nivaa: 3,
  side: 2,
  eksempel: 1.5,
};

const STOPWORDS = new Set([
  'og', 'i', 'på', 'til', 'med', 'for', 'av', 'en', 'et', 'ei', 'å', 'som', 'det', 'de', 'den', 'om', 'er', 'eller', 'fra', 'mål',
]);

// Lengste endelse først. Stammen må ha minst fire tegn igjen.
const SUFFIXES = ['ene', 'ane', 'ers', 'ens', 'ets', 'er', 'en', 'et', 'ar', 'e', 'a', 's'];

const WORD = /[\p{L}\p{N}]+/gu;

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[éèêë]/g, 'e')
    .replace(/[áàâ]/g, 'a')
    .replace(/[óòô]/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'ø')
    .replace(/ä/g, 'æ');
}

const words = (value: string) => normalize(value).match(WORD) ?? [];

function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) return word.slice(0, -suffix.length);
  }
  return word;
}

/** Tokenene i et søk. Småord tas bort så lenge det er noe annet igjen. */
export function parseQuery(query: string): string[] {
  const all = words(query);
  const meaningful = all.filter((w) => !STOPWORDS.has(w));
  return [...new Set((meaningful.length ? meaningful : all).map(stem))];
}

/** Editavstand med ombytting av to nabobokstaver, avbrutt så snart den blir større enn 1. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length && a[i] === b[j + 1] && a[i + 1] === b[j]) {
      i += 2;
      j += 2;
    } else if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Hvor godt ett søkeord treffer ett ord i teksten (0 = ikke treff). */
export function matchWord(token: string, word: string): number {
  if (/^\d+$/.test(token)) return token === word ? 1 : 0;
  if (word.startsWith(token)) return 1;
  // Sammensatte ord: «verktøy» skal finne «søkeverktøy».
  if (token.length >= 4 && word.includes(token)) return 0.7;
  // Skrivefeil: «regnaerk» skal finne «regneark».
  if (token.length >= 5 && (withinOneEdit(token, word.slice(0, token.length)) || withinOneEdit(token, word))) return 0.5;
  return 0;
}

function field(name: FieldName, ...parts: (string | undefined)[]): IndexedField {
  const text = parts.filter(Boolean).join(' ');
  return { name, text: normalize(text), words: words(text) };
}

export function buildCatalog(subjects: Subject[]): GoalEntry[] {
  const catalog: GoalEntry[] = [];
  for (const fag of subjects) {
    for (const section of buildMenu(fag).sections) {
      for (const item of section.items) {
        const sted = section.label === item.label ? item.label : `${section.label} · ${item.label}`;
        for (const goal of item.chapter.maal) {
          catalog.push({
            goal,
            fag,
            kapittel: item.chapter,
            sted,
            henvisning: item.henvisning,
            tone: section.tone,
            order: catalog.length,
            fields: [
              field('maal', goal.maal),
              field('nr', goal.nr),
              field('sted', sted, item.henvisning, goal.kapittel),
              field('fag', fag.navn, goal.dokument),
              field('nivaa', ...goal.nivaer.map((n) => n.beskrivelse)),
              field('side', goal.side),
              field('eksempel', ...goal.nivaer.map((n) => n.eksempel)),
            ],
          });
        }
      }
    }
  }
  return catalog;
}

function scoreEntry(entry: GoalEntry, tokens: string[], phrase: string): SearchResult | null {
  let score = 0;
  const treff = new Set<FieldName>();
  for (const token of tokens) {
    let best = 0;
    for (const f of entry.fields) {
      let fieldBest = 0;
      for (const word of f.words) {
        fieldBest = Math.max(fieldBest, matchWord(token, word));
        if (fieldBest === 1) break;
      }
      if (fieldBest > 0) {
        treff.add(f.name);
        best = Math.max(best, fieldBest * WEIGHTS[f.name]);
      }
    }
    // Alle søkeordene må finnes et sted i målet.
    if (best === 0) return null;
    score += best;
  }
  if (tokens.length > 1 && entry.fields[0]!.text.includes(phrase)) score += 8;
  const order = Object.keys(WEIGHTS) as FieldName[];
  return { entry, score, treff: order.filter((name) => treff.has(name)) };
}

export function searchCatalog(catalog: GoalEntry[], query: string): SearchResult[] {
  const tokens = parseQuery(query);
  if (!tokens.length) return catalog.map((entry) => ({ entry, score: 0, treff: [] }));
  const phrase = normalize(query.trim());
  return catalog.flatMap((entry) => scoreEntry(entry, tokens, phrase) ?? []);
}

export type SortKey = 'laereplan' | 'alfabetisk' | 'relevans';
export type GroupKey = 'fag' | 'kapittel' | 'ingen';
export type ViewKey = 'liste' | 'kort' | 'tabell';

export const SORT_LABELS: Record<SortKey, string> = {
  relevans: 'Best treff først',
  laereplan: 'Læreplanens rekkefølge',
  alfabetisk: 'Alfabetisk (A–Å)',
};

export const GROUP_LABELS: Record<GroupKey, string> = {
  fag: 'Etter fag',
  kapittel: 'Etter kapittel/modul',
  ingen: 'Ingen gruppering',
};

export const VIEW_LABELS: Record<ViewKey, string> = {
  liste: 'Liste',
  kort: 'Kort',
  tabell: 'Tabell',
};

const collator = new Intl.Collator('nb');

export function sortResults(results: SearchResult[], sort: SortKey): SearchResult[] {
  const sorted = [...results];
  if (sort === 'alfabetisk') sorted.sort((a, b) => collator.compare(a.entry.goal.maal, b.entry.goal.maal));
  else if (sort === 'relevans') sorted.sort((a, b) => b.score - a.score || a.entry.order - b.entry.order);
  else sorted.sort((a, b) => a.entry.order - b.entry.order);
  return sorted;
}

export interface ResultGroup {
  id: string;
  label: string;
  results: SearchResult[];
}

/** Gruppene kommer i den rekkefølgen sorteringen gir dem. */
export function groupResults(results: SearchResult[], group: GroupKey): ResultGroup[] {
  if (group === 'ingen') return [{ id: 'alle', label: '', results }];
  const groups = new Map<string, ResultGroup>();
  for (const result of results) {
    const { fag, kapittel, sted } = result.entry;
    const id = group === 'fag' ? fag.id : `${fag.id}/${kapittel.id}`;
    const label = group === 'fag' ? fag.navn : `${fag.navn} · ${sted}`;
    const existing = groups.get(id);
    if (existing) existing.results.push(result);
    else groups.set(id, { id, label, results: [result] });
  }
  return [...groups.values()];
}
