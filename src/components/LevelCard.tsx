import { ACTIVITY_HEADING, parseActivity } from '../data/activity';
import { LEVEL_LABELS, type Level } from '../types';

export function LevelCard({ level }: { level: Level }) {
  const parts = parseActivity(level.eksempel);

  return (
    <article className={`level-card level-${level.nummer}`} aria-labelledby={`nivaa-${level.nummer}`}>
      <header className="level-head">
        <span className="level-badge" aria-hidden="true">
          {level.nummer}
        </span>
        <div>
          <h3 id={`nivaa-${level.nummer}`}>Nivå {level.nummer}</h3>
          <p className="level-sub">{LEVEL_LABELS[level.nummer]}</p>
        </div>
      </header>

      <section className="level-section">
        <h4>Målet på dette nivået</h4>
        <p>{level.beskrivelse}</p>
      </section>

      <section className="level-section example">
        <h4>{ACTIVITY_HEADING}</h4>
        {parts ? (
          <dl className="activity">
            <div>
              <dt>Forbered</dt>
              <dd>{parts.forbered}</dd>
            </div>
            <div>
              <dt>Gjør</dt>
              <dd>{parts.gjor}</dd>
            </div>
            <div>
              <dt>Se etter</dt>
              <dd>{parts.seEtter}</dd>
            </div>
          </dl>
        ) : level.eksempel ? (
          <p>{level.eksempel}</p>
        ) : (
          <p className="muted">Forslag er ikke lagt inn ennå.</p>
        )}
      </section>
    </article>
  );
}
