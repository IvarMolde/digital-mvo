import type { Chapter, Goal, Subject } from '../types';

/** Menyfarge. Varm skala er språknivå. Nøytral er dokumentets egen inndeling. */
export type MenuTone = 'neutral' | 'fora1' | 'a1' | 'a2' | 'b1' | 'b2';

export interface MenuItem {
  id: string;
  label: string;
  /** Liten henvisning til læreplanen, f.eks. «Kap. 6» eller «2.1». */
  henvisning?: string;
  chapter: Chapter;
}

export interface MenuSection {
  id: string;
  label: string;
  tone: MenuTone;
  items: MenuItem[];
}

export interface SubjectMenu {
  sections: MenuSection[];
  /** Norsk bruker språknivå som navigasjon, og skal forklare de to fargesystemene. */
  viserSpraanivaa: boolean;
  /** Samfunnsfag: temaet er menyvalget. Kapittelnummeret er bare en henvisning. */
  direkteTema: boolean;
}

export interface Placement {
  section: MenuSection;
  item: MenuItem;
}

export interface SearchHit {
  goal: Goal;
  section: MenuSection;
  item: MenuItem;
}

const SKILLS = ['lytte', 'lese', 'skrive', 'muntlig'] as const;
const CEFR = ['a1', 'a2', 'b1', 'b2'] as const;
const FOR_A1 = ['lese- og skriveforberedende', 'grunnleggende lesing', 'grunnleggende skriving'] as const;

interface Draft {
  sectionId: string;
  sectionLabel: string;
  tone: MenuTone;
  sectionOrder: number;
  itemOrder: number;
  seq: number;
  item: MenuItem;
}

function subjectKind(subject: Subject): 'norsk' | 'overordnet' | 'samfunn' | 'other' {
  const name = subject.navn.toLowerCase();
  if (name.startsWith('norsk')) return 'norsk';
  if (name.startsWith('overordnet')) return 'overordnet';
  if (name.startsWith('samfunn')) return 'samfunn';
  return 'other';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function itemFor(chapter: Chapter, label: string, henvisning?: string): MenuItem {
  return { id: chapter.id, label, henvisning, chapter };
}

/** Norsk: lærerens bolker først, deretter spor før A1 og språknivå med fast ferdighetsrekkefølge. */
function classifyNorsk(chapter: Chapter, index: number): Draft {
  const under = chapter.under.toLowerCase();
  const skill = under.match(/^(a1|a2|b1|b2)\s+(lytte|lese|skrive|muntlig)\b/);
  if (skill) {
    const level = skill[1] as (typeof CEFR)[number];
    const ferdighet = skill[2] as (typeof SKILLS)[number];
    return {
      sectionId: level,
      sectionLabel: level.toUpperCase(),
      tone: level,
      sectionOrder: 2 + CEFR.indexOf(level),
      itemOrder: SKILLS.indexOf(ferdighet),
      seq: index,
      item: itemFor(chapter, capitalize(ferdighet), chapter.hoved),
    };
  }

  const before = FOR_A1.findIndex((name) => under.startsWith(name));
  const isChapterSix = chapter.hoved.toLowerCase().startsWith('kap. 6') || chapter.hoved === '6';
  if (isChapterSix) {
    return {
      sectionId: 'for-a1',
      sectionLabel: 'Før A1',
      tone: 'fora1',
      sectionOrder: 1,
      itemOrder: before >= 0 ? before : 50 + index,
      seq: index,
      item: itemFor(chapter, chapter.under || chapter.tittel, chapter.hoved),
    };
  }

  return {
    sectionId: 'om-opplaeringen',
    sectionLabel: 'Om opplæringen',
    tone: 'neutral',
    sectionOrder: 0,
    itemOrder: index,
    seq: index,
    item: itemFor(chapter, chapter.under || chapter.tittel, chapter.hoved || undefined),
  };
}

function versionRank(hoved: string): number {
  return hoved.split('.').reduce((sum, part, i) => sum + (Number(part) || 0) / 100 ** i, 0);
}

/** Overordnet del følger del 1, 2 og 3. Nummeret foran bindestreken blir henvisning. */
function classifyOverordnet(chapter: Chapter, index: number): Draft {
  const del = chapter.hoved.match(/^(\d+)/)?.[1] ?? '0';
  return {
    sectionId: `del-${del}`,
    sectionLabel: `Del ${del}`,
    tone: 'neutral',
    sectionOrder: Number(del),
    itemOrder: versionRank(chapter.hoved),
    seq: index,
    item: itemFor(chapter, chapter.under || chapter.tittel, chapter.hoved || undefined),
  };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Samfunnsfag: hvert tema er et eget menyvalg. Kapittelnummeret følger med som henvisning. */
function classifySamfunn(chapter: Chapter, index: number): Draft {
  const tema = chapter.under || chapter.tittel;
  return {
    sectionId: chapter.id,
    sectionLabel: tema,
    tone: 'neutral',
    sectionOrder: index,
    itemOrder: 0,
    seq: index,
    item: itemFor(chapter, tema, chapter.hoved || undefined),
  };
}

/** Andre dokumenter: kapitlet er bolken, temaet er leddet. */
function classifyByChapter(chapter: Chapter, index: number): Draft {
  const hoved = chapter.hoved || chapter.tittel;
  const number = hoved.match(/(\d+)/);
  return {
    sectionId: slug(hoved) || `bolk-${index}`,
    sectionLabel: hoved,
    tone: 'neutral',
    sectionOrder: number ? Number(number[1]) : 1000 + index,
    itemOrder: index,
    seq: index,
    item: itemFor(chapter, chapter.under || chapter.tittel),
  };
}

export function buildMenu(subject: Subject): SubjectMenu {
  const kind = subjectKind(subject);
  const classify =
    kind === 'norsk' ? classifyNorsk : kind === 'overordnet' ? classifyOverordnet : kind === 'samfunn' ? classifySamfunn : classifyByChapter;
  const buckets = new Map<string, { draft: Draft; rows: Draft[] }>();

  subject.kapitler.forEach((chapter, index) => {
    const draft = classify(chapter, index);
    const bucket = buckets.get(draft.sectionId);
    if (bucket) bucket.rows.push(draft);
    else buckets.set(draft.sectionId, { draft, rows: [draft] });
  });

  const sections = [...buckets.values()]
    .sort((a, b) => a.draft.sectionOrder - b.draft.sectionOrder)
    .map(({ draft, rows }) => ({
      id: draft.sectionId,
      label: draft.sectionLabel,
      tone: draft.tone,
      items: [...rows]
        .sort((a, b) => a.itemOrder - b.itemOrder || a.seq - b.seq)
        .map((row) => row.item),
    }));

  return { sections, viserSpraanivaa: kind === 'norsk', direkteTema: kind === 'samfunn' };
}

export function findPlacement(menu: SubjectMenu, chapterId: string): Placement | undefined {
  for (const section of menu.sections) {
    const item = section.items.find((entry) => entry.id === chapterId);
    if (item) return { section, item };
  }
  return undefined;
}

export function findSection(menu: SubjectMenu, sectionId: string): MenuSection | undefined {
  return menu.sections.find((section) => section.id === sectionId);
}

export function countGoals(section: MenuSection): number {
  return section.items.reduce((sum, item) => sum + item.chapter.maal.length, 0);
}

/** Søker i målformulering, kapittel, sidetall og menynavn i det aktive dokumentet. */
export function searchGoals(menu: SubjectMenu, query: string): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const hits: SearchHit[] = [];
  for (const section of menu.sections) {
    for (const item of section.items) {
      for (const goal of item.chapter.maal) {
        const haystack = [goal.maal, goal.kapittel, goal.side, goal.nr, item.label, section.label, item.henvisning]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (haystack.includes(needle)) hits.push({ goal, section, item });
      }
    }
  }
  return hits;
}
