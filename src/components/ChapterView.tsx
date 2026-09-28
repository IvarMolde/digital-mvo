import { useState } from 'react';
import type { Placement } from '../data/menu';
import type { Route } from '../hooks/useHashRoute';
import type { Chapter, Subject } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { LevelCard } from './LevelCard';

interface Props {
  fag: Subject;
  kapittel: Chapter;
  placement?: Placement;
  navigate: (r: Route) => void;
}

export function ChapterView({ fag, kapittel, placement, navigate }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const section = placement?.section;
  const item = placement?.item;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: fag.navn, onClick: () => navigate({ fag: fag.id }) },
          ...(section
            ? [{ label: section.label, onClick: () => navigate({ fag: fag.id, kapittel: section.id }) }]
            : []),
          { label: item?.label ?? kapittel.tittel },
        ]}
      />
      <header className="page-header">
        {section && (
          <p className={`cefr-badge tone-${section.tone}`}>
            <span className="tone-swatch" aria-hidden="true" />
            {section.label}
          </p>
        )}
        <h1>{item?.label ?? kapittel.tittel}</h1>
        <p className="lead">
          {item?.henvisning ? `${item.henvisning}. ` : ''}
          Åpne et mål for å se forslaget til aktivitet. Egen side kan deles og lastes ned som Word.
        </p>
      </header>

      <ul className="goal-list">
        {kapittel.maal.map((goal) => {
          const open = openId === goal.id;
          const panelId = `maal-${goal.id}`;
          return (
            <li key={goal.id} className={open ? 'goal-block open' : 'goal-block'}>
              <button
                type="button"
                className="goal-item"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : goal.id)}
              >
                <span className="goal-nr">{goal.nr}</span>
                <span className="goal-text">{goal.maal}</span>
                {goal.side && <span className="goal-page">{goal.side}</span>}
                <span className="goal-arrow" aria-hidden="true">
                  {open ? '▾' : '→'}
                </span>
              </button>
              {open && (
                <div id={panelId} className="goal-inline">
                  <div className="level-grid">
                    {goal.nivaer.map((level) => (
                      <LevelCard key={level.nummer} level={level} />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate({ fag: fag.id, kapittel: kapittel.id, maal: goal.nr })}
                  >
                    Åpne egen side
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
