import type { Route } from '../hooks/useHashRoute';
import type { Chapter, Subject } from '../types';
import { Breadcrumb } from './Breadcrumb';

interface Props {
  fag: Subject;
  kapittel: Chapter;
  navigate: (r: Route) => void;
}

export function ChapterView({ fag, kapittel, navigate }: Props) {
  return (
    <div>
      <Breadcrumb items={[{ label: fag.navn, onClick: () => navigate({ fag: fag.id }) }, { label: kapittel.tittel }]} />
      <header className="page-header">
        <p className="eyebrow">{fag.navn}</p>
        <h1>{kapittel.tittel}</h1>
        <p className="lead">Velg en målformulering for å se hva målet innebærer på de tre nivåene.</p>
      </header>

      <ul className="goal-list">
        {kapittel.maal.map((g) => (
          <li key={g.id}>
            <button
              type="button"
              className="goal-item"
              onClick={() => navigate({ fag: fag.id, kapittel: kapittel.id, maal: g.nr })}
            >
              <span className="goal-nr">{g.nr}</span>
              <span className="goal-text">{g.maal}</span>
              {g.side && <span className="goal-page">{g.side}</span>}
              <span className="goal-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
