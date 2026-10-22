import type { Area } from '../data/areas';
import { groupResults, searchCatalog, sortResults, type GoalEntry, type ResultGroup } from '../data/search';

/** Lager avkryssingslisten for gruppene som vises. Word-biblioteket lastes først når den trengs. */
export async function downloadChecklist(area: Area, groups: ResultGroup[], omfang: string): Promise<void> {
  const { exportChecklist } = await import('./docxExport');
  await exportChecklist(
    `Avkryssingsliste – ${area.kortnavn}`,
    omfang,
    groups.map((group) => ({
      tittel: group.label,
      maal: group.results.map(({ entry }) => ({
        nr: entry.goal.nr,
        maal: entry.goal.maal,
        // Fagnavnet står allerede i overskriften når listen er gruppert etter fag eller kapittel.
        sted: [group.label ? null : entry.fag.navn, entry.sted, entry.goal.side].filter(Boolean).join(' · '),
      })),
    })),
  );
}

/** Hele området i læreplanens rekkefølge, gruppert etter fag. */
export function downloadFullChecklist(area: Area, catalog: GoalEntry[]): Promise<void> {
  const groups = groupResults(sortResults(searchCatalog(catalog, ''), 'laereplan'), 'fag');
  return downloadChecklist(area, groups, `Alle mål i ${area.navn.toLowerCase()}`);
}
