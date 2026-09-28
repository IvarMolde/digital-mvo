import { useCallback } from 'react';
import type { Route } from '../hooks/useHashRoute';
import type { Chapter, Goal, Subject } from '../types';
import { Breadcrumb } from './Breadcrumb';
import { DownloadButton } from './DownloadButton';
import { LevelCard } from './LevelCard';

interface Props {
  fag: Subject;
  kapittel: Chapter;
  goal: Goal;
  navigate: (r: Route) => void;
}

export function GoalView({ fag, kapittel, goal, navigate }: Props) {
  const index = kapittel.maal.findIndex((g) => g.id === goal.id);
  const prev = kapittel.maal[index - 1];
  const next = kapittel.maal[index + 1];
  const go = (g: Goal) => navigate({ fag: fag.id, kapittel: kapittel.id, maal: g.nr });
  const onDownload = useCallback(async () => (await import('../services/docxExport')).exportGoal(goal, fag), [goal, fag]);

  return (
    <div className="goal-view">
      <Breadcrumb
        items={[
          { label: fag.navn, onClick: () => navigate({ fag: fag.id }) },
          { label: kapittel.tittel, onClick: () => navigate({ fag: fag.id, kapittel: kapittel.id }) },
          { label: `Mål ${goal.nr}` },
        ]}
      />

      <header className="goal-header">
        <div>
          <p className="eyebrow">
            Mål {goal.nr} · {kapittel.tittel}
            {goal.side && ` · ${goal.side}`}
          </p>
          <h1>{goal.maal}</h1>
        </div>
        <DownloadButton label="Last ned som Word" onDownload={onDownload} />
      </header>

      <div className="level-grid">
        {goal.nivaer.map((level) => (
          <LevelCard key={level.nummer} level={level} />
        ))}
      </div>

      <nav className="pager" aria-label="Bla mellom mål i kapittelet">
        {prev ? (
          <button type="button" className="btn btn-ghost" onClick={() => go(prev)}>
            ← Mål {prev.nr}
          </button>
        ) : (
          <span />
        )}
        <span className="pager-pos">
          {index + 1} av {kapittel.maal.length} i kapittelet
        </span>
        {next ? (
          <button type="button" className="btn btn-ghost" onClick={() => go(next)}>
            Mål {next.nr} →
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
