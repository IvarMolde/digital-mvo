export type LevelNumber = 1 | 2 | 3;

export interface Level {
  nummer: LevelNumber;
  beskrivelse: string;
  eksempel: string;
}

export interface Goal {
  /** Unik nøkkel på tvers av fag, f.eks. "norsk-23". */
  id: string;
  nr: string;
  dokument: string;
  kapittel: string;
  maal: string;
  side: string;
  nivaer: [Level, Level, Level];
}

export interface Chapter {
  id: string;
  /** Første del av kapittelteksten, f.eks. "Kap. 6" eller "2.3". */
  hoved: string;
  /** Resten av kapittelteksten, f.eks. "A1 skrive". */
  under: string;
  tittel: string;
  maal: Goal[];
}

export interface Subject {
  id: string;
  navn: string;
  kapitler: Chapter[];
}

export interface SkippedRow {
  ark: string;
  rad: number;
  grunn: string;
}

export interface Plan {
  fag: Subject[];
  hoppetOver: SkippedRow[];
}

export const LEVEL_LABELS: Record<LevelNumber, string> = {
  1: 'Med støtte',
  2: 'Delvis selvstendig',
  3: 'Selvstendig',
};
