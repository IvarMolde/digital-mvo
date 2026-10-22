import {
  AlignmentType,
  BorderStyle,
  CheckBox,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
} from 'docx';
import { ACTIVITY_HEADING, parseActivity } from '../data/activity';
import { LEVEL_LABELS, type Goal, type Level, type Subject } from '../types';

// Samme nivåfarger som i appen (se styles.css).
const LEVEL_COLORS = { 1: 'DCEFE9', 2: 'DCE8F5', 3: 'E7E1F3' } as const;
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: 'C9CFD6' };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };

const text = (value: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: value, ...opts })] });

function activityLines(raw: string): Paragraph[] {
  const parts = parseActivity(raw);
  const heading = text(ACTIVITY_HEADING, { bold: true, size: 18, color: '5B6470' });
  if (!parts) return [heading, text(raw || 'Forslag er ikke lagt inn ennå.', { size: 20, italics: !raw })];
  return [
    heading,
    text(`Forbered: ${parts.forbered}`, { size: 20 }),
    text(`Gjør: ${parts.gjor}`, { size: 20 }),
    text(`Se etter: ${parts.seEtter}`, { size: 20 }),
  ];
}

function levelCell(level: Level): TableCell {
  return new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: LEVEL_COLORS[level.nummer], color: 'auto' },
        spacing: { after: 120 },
        children: [new TextRun({ text: `Nivå ${level.nummer} – ${LEVEL_LABELS[level.nummer]}`, bold: true, size: 24 })],
      }),
      text('Målet på dette nivået', { bold: true, size: 18, color: '5B6470' }),
      text(level.beskrivelse, { size: 20 }),
      new Paragraph({ spacing: { before: 160 }, children: [] }),
      ...activityLines(level.eksempel),
    ],
  });
}

/** Byggekloss som brukes både for ett mål og for et helt fag. */
function goalBlock(goal: Goal, subjectName: string): FileChild[] {
  const meta = [subjectName, goal.kapittel, goal.side].filter(Boolean).join('  ·  ');
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, text: `${goal.nr}. ${goal.maal}` }),
    text(meta, { size: 18, color: '5B6470' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ cantSplit: false, children: goal.nivaer.map(levelCell) })],
    }),
  ];
}

function buildDocument(title: string, subtitle: string, children: FileChild[]): Document {
  return new Document({
    creator: 'IKT-plan – Molde voksenopplæringssenter',
    title,
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 900, bottom: 900, left: 900, right: 900 },
          },
        },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, text: title }),
          new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: subtitle, color: '5B6470' })] }),
          ...children,
        ],
      },
    ],
  });
}

const safeFileName = (s: string) =>
  s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'ikt-plan';

async function download(doc: Document, fileName: string): Promise<void> {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(fileName)}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportGoal(goal: Goal, subject: Subject): Promise<void> {
  const doc = buildDocument('Digitale ferdigheter', `${subject.navn} – mål ${goal.nr}`, goalBlock(goal, subject.navn));
  await download(doc, `${subject.navn} mål ${goal.nr} – digitale ferdigheter`);
}

export async function exportSubject(subject: Subject): Promise<void> {
  const children = subject.kapitler.flatMap((kap, i) => [
    new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: i > 0, spacing: { before: 360 }, text: kap.tittel }),
    ...kap.maal.flatMap((g) => goalBlock(g, subject.navn)),
  ]);
  const antall = subject.kapitler.reduce((n, k) => n + k.maal.length, 0);
  const doc = buildDocument(`Digitale ferdigheter – ${subject.navn}`, `${antall} mål fordelt på ${subject.kapitler.length} kapitler`, children);
  await download(doc, `${subject.navn} – digitale ferdigheter`);
}

export interface ChecklistGroup {
  tittel: string;
  maal: { nr: string; maal: string; sted: string }[];
}

// A4 stående: 11906 twips bredt minus marger. Summen av kolonnene er 10106.
const CHECKLIST_COLUMNS = [620, 5036, 800, 800, 800, 2050];
const HEADER_FILL = 'E8EFF7';

function checklistCell(children: Paragraph[], width: number, fill?: string): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: CELL_BORDERS,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    children,
  });
}

const centered = (children: (TextRun | CheckBox)[]) => new Paragraph({ alignment: AlignmentType.CENTER, children });

function checklistTable(group: ChecklistGroup): Table {
  const header = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: ['Nr.', 'Målformulering', 'Nivå 1', 'Nivå 2', 'Nivå 3', 'Dato / merknad'].map((label, i) =>
      checklistCell(
        [i >= 2 && i <= 4 ? centered([new TextRun({ text: label, bold: true, size: 18 })]) : text(label, { bold: true, size: 18 })],
        CHECKLIST_COLUMNS[i]!,
        HEADER_FILL,
      ),
    ),
  });
  const rows = group.maal.map(
    (m) =>
      new TableRow({
        cantSplit: true,
        children: [
          checklistCell([text(m.nr, { size: 18, color: '5B6470' })], CHECKLIST_COLUMNS[0]!),
          checklistCell(
            [
              new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: m.maal, size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: m.sted, size: 16, color: '5B6470' })] }),
            ],
            CHECKLIST_COLUMNS[1]!,
          ),
          ...[2, 3, 4].map((i) => checklistCell([centered([new CheckBox({ checked: false })])], CHECKLIST_COLUMNS[i]!)),
          checklistCell([new Paragraph({ children: [] })], CHECKLIST_COLUMNS[5]!),
        ],
      }),
  );
  return new Table({
    width: { size: CHECKLIST_COLUMNS.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: CHECKLIST_COLUMNS,
    layout: TableLayoutType.FIXED,
    rows: [header, ...rows],
  });
}

/** Avkryssingsliste: alle målene som vises, med en avkrysningsboks per nivå. */
export async function exportChecklist(tittel: string, undertittel: string, groups: ChecklistGroup[]): Promise<void> {
  const antall = groups.reduce((n, g) => n + g.maal.length, 0);
  const dato = new Date().toLocaleDateString('nb-NO');
  const doc = new Document({
    creator: 'IKT-plan – Molde voksenopplæringssenter',
    title: tittel,
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [
      {
        properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, text: tittel }),
          text(`${undertittel} · ${antall} mål · laget ${dato}`, { size: 20, color: '5B6470' }),
          new Paragraph({
            spacing: { before: 200, after: 120 },
            children: [new TextRun({ text: 'Lærer: ______________________    Gruppe: ______________    Skoleår: __________', size: 20 })],
          }),
          text('Kryss av for nivået deltakerne har jobbet på, og skriv dato eller en kort merknad.', { size: 18, italics: true, color: '5B6470' }),
          ...groups.flatMap((group) => [
            ...(group.tittel
              ? [new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 320, after: 120 }, text: group.tittel })]
              : [new Paragraph({ spacing: { after: 120 }, children: [] })]),
            checklistTable(group),
          ]),
        ],
      },
    ],
  });
  await download(doc, tittel);
}
