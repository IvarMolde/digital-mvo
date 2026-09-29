import { useCallback } from 'react';
import { countGoals, type MenuSection, type SubjectMenu } from '../data/menu';
import type { Route } from '../hooks/useHashRoute';
import { LEVEL_LABELS, type LevelNumber, type Subject } from '../types';
import { CurriculumMenu } from './CurriculumMenu';
import { DownloadButton } from './DownloadButton';

interface Props {
  fag: Subject;
  menu: SubjectMenu;
  section?: MenuSection;
  navigate: (r: Route) => void;
}

const LEVEL_TEXT: Record<LevelNumber, string> = {
  1: 'Deltakeren gjør oppgaven sammen med læreren, med modell og tett veiledning.',
  2: 'Deltakeren gjør oppgaven i kjente situasjoner, med noe støtte ved behov.',
  3: 'Deltakeren gjør oppgaven på egen hånd og overfører den til nye situasjoner.',
};

export function SubjectOverview({ fag, menu, section, navigate }: Props) {
  const antall = section ? countGoals(section) : fag.kapitler.reduce((n, k) => n + k.maal.length, 0);
  const onDownload = useCallback(async () => (await import('../services/docxExport')).exportSubject(fag), [fag]);
  const shown: SubjectMenu = section
    ? { sections: [section], viserSpraanivaa: menu.viserSpraanivaa, direkteTema: false }
    : menu;

  return (
    <div>
      <header className="page-header with-action">
        <div>
          <p className="eyebrow">Digitale ferdigheter</p>
          <h1>{section ? section.label : fag.navn}</h1>
          <p className="lead">
            {section
              ? `${antall} mål. Velg et ledd for å se målformuleringene.`
              : menu.direkteTema
                ? `${antall} mål. Velg et tema for å se målformuleringene.`
                : `${antall} mål. Velg en bolk, og deretter et ledd, for å se målformuleringene.`}
          </p>
        </div>
        {!section && (
          <DownloadButton label={`Last ned ${fag.navn.toLowerCase()} (Word)`} onDownload={onDownload} variant="secondary" />
        )}
      </header>

      {menu.viserSpraanivaa && (
        <p className="color-key">Fargen i menyen er språknivå. Fargen på kortene er hvor selvstendig deltakeren jobber.</p>
      )}

      {!section && (
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
      )}

      <CurriculumMenu
        menu={shown}
        variant="overview"
        activeSectionId={section?.id}
        onToggleSection={() => undefined}
        onSelectChapter={(chapterId) => navigate({ fag: fag.id, kapittel: chapterId })}
      />
    </div>
  );
}
