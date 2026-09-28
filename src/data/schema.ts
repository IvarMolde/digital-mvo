import { z } from 'zod';

const cellText = z.preprocess(
  (v) => (v === null || v === undefined ? '' : String(v)),
  z.string().trim(),
);

const requiredText = (felt: string) =>
  cellText.pipe(z.string().min(1, `«${felt}» mangler`).max(4000, `«${felt}» er for lang`));

export const GoalRowSchema = z.object({
  nr: requiredText('Nr.'),
  dokument: cellText,
  kapittel: requiredText('Kapittel / avsnitt'),
  maal: requiredText('Målformulering'),
  side: cellText,
  nivaa1: requiredText('Nivå 1'),
  nivaa2: requiredText('Nivå 2'),
  nivaa3: requiredText('Nivå 3'),
  eksempel1: cellText,
  eksempel2: cellText,
  eksempel3: cellText,
});

export type GoalRow = z.infer<typeof GoalRowSchema>;
export type GoalRowField = keyof GoalRow;

/**
 * Kolonnene finnes ut fra overskriftene (ikke plassering), slik at rekkefølgen
 * i regnearket kan endres uten at appen slutter å virke.
 */
export const COLUMN_MATCHERS: Record<GoalRowField, string> = {
  nr: 'nr',
  dokument: 'dokument',
  kapittel: 'kapittel',
  maal: 'målformulering',
  side: 'side',
  nivaa1: 'nivå 1',
  nivaa2: 'nivå 2',
  nivaa3: 'nivå 3',
  eksempel1: 'eksempel nivå 1',
  eksempel2: 'eksempel nivå 2',
  eksempel3: 'eksempel nivå 3',
};

export const REQUIRED_COLUMNS: GoalRowField[] = ['nr', 'kapittel', 'maal', 'nivaa1', 'nivaa2', 'nivaa3'];
