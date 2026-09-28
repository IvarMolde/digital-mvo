import type { Chapter } from '../types';

export interface ChapterGroup {
  hoved: string;
  kapitler: Chapter[];
  antallMaal: number;
}

/** Grupperer kapitler som deler hovednummer (f.eks. alle «Kap. 6»-avsnitt) under én overskrift. */
export function groupChapters(kapitler: Chapter[]): ChapterGroup[] {
  const groups: ChapterGroup[] = [];
  for (const kap of kapitler) {
    const last = groups[groups.length - 1];
    if (last && kap.hoved && last.hoved === kap.hoved) {
      last.kapitler.push(kap);
      last.antallMaal += kap.maal.length;
    } else {
      groups.push({ hoved: kap.hoved, kapitler: [kap], antallMaal: kap.maal.length });
    }
  }
  return groups;
}
