import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
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
    creator: 'Digital plan – Voksenopplæringen',
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
  s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'digital-plan';

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
