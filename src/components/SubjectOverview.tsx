import { useCallback, useMemo } from 'react';
import { groupChapters } from '../data/groupChapters';
import type { Route } from '../hooks/useHashRoute';
import { LEVEL_LABELS, type Chapter, type LevelNumber, type Subject } from '../types';
import { DownloadButton } from './DownloadButton';

interface Props {
  fag: Subject;
  navigate: (r: Route) => void;
}

const LEVEL_TEXT: Record<LevelNumber, string> = {
  1: 'Deltakeren gjør oppgaven sammen med læreren, med modell og tett veiledning.',
  2: 'Deltakeren gjør oppgaven i kjente situasjoner, med noe støtte ved behov.',
  3: 'Deltakeren gjør oppgaven på egen hånd og overfører den til nye situasjoner.',
};

export function SubjectOverview({ fag, navigate }: Props) {
  const antall = fag.kapitler.reduce((n, k) => n + k.maal.length, 0);
  const onDownload = useCallback(async () => (await import('../services/docxExport')).exportSubject(fag), [fag]);
  const sections = useMemo(() => toSections(fag.kapitler), [fag]);

  return (
    <div>
      <header className="page-header with-action">
        <div>
          <p className="eyebrow">Digitale ferdigheter</p>
          <h1>{fag.navn}</h1>
          <p className="lead">
            {antall} mål i {fag.kapitler.length} kapitler. Velg et kapittel for å se målformuleringene.
          </p>
        </div>
        <DownloadButton label={`Last ned ${fag.navn.toLowerCase()} (Word)`} onDownload={onDownload} variant="secondary" />
      </header>

      <section aria-labelledby="nivaaer" className="legend">
        <h2 id="nivaaer" className="visually-hidden">
          De tre nivåene
        </h2>
        {([1, 2, 3] as const).map((n) => (
          <div key={n} className={`legend-item level-${n}`}>
            <span className="level-badge">{n}</span>
            <div>
              <strong>{LEVEL_LABELS[n]}</strong>
              <p>{LEVEL_TEXT[n]}</p>
            </div>
          </div>
        ))}
      </section>

      {sections.map((s) => (
        <section key={s.key} className="chapter-section">
          {s.tittel && <h2 className="chapter-section-title">{s.tittel}</h2>}
          <ul className="chapter-grid">
            {s.kapitler.map((kap) => (
              <li key={kap.id}>
                <button type="button" className="chapter-card" onClick={() => navigate({ fag: fag.id, kapittel: kap.id })}>
                  {!s.tittel && kap.hoved && <span className="chapter-num">{kap.hoved}</span>}
                  <span className="chapter-card-title">{kap.under}</span>
                  <span className="chapter-card-count">{kap.maal.length} mål</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

interface Section {
  key: string;
  tittel?: string;
  kapitler: Chapter[];
}

/** Enkeltstående kapitler samles i ett rutenett; kapitler med underavsnitt får egen overskrift. */
function toSections(kapitler: Chapter[]): Section[] {
  const sections: Section[] = [];
  for (const g of groupChapters(kapitler)) {
    const last = sections[sections.length - 1];
    if (g.kapitler.length === 1 && last && !last.tittel) last.kapitler.push(g.kapitler[0]!);
    else if (g.kapitler.length === 1) sections.push({ key: g.kapitler[0]!.id, kapitler: [...g.kapitler] });
    else sections.push({ key: g.hoved, tittel: g.hoved, kapitler: g.kapitler });
  }
  return sections;
}
