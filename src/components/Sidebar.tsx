import { useEffect, useMemo, useState } from 'react';
import { groupChapters, type ChapterGroup } from '../data/groupChapters';
import type { Route } from '../hooks/useHashRoute';
import type { Chapter, Subject } from '../types';

interface Props {
  fag: Subject[];
  aktivtFag: Subject;
  aktivtKapittel?: string;
  navigate: (r: Route) => void;
}

export function Sidebar({ fag, aktivtFag, aktivtKapittel, navigate }: Props) {
  const groups = useMemo(() => groupChapters(aktivtFag.kapitler), [aktivtFag]);
  const [open, setOpen] = useState<Set<string>>(new Set());

  // Gruppen med valgt kapittel åpnes automatisk; andre forblir lukket for å holde menyen kort.
  useEffect(() => {
    const active = groups.find((g) => g.kapitler.some((k) => k.id === aktivtKapittel));
    if (active) setOpen((prev) => (prev.has(active.hoved) ? prev : new Set(prev).add(active.hoved)));
  }, [groups, aktivtKapittel]);

  const toggle = (hoved: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(hoved)) next.delete(hoved);
      else next.add(hoved);
      return next;
    });

  const link = (kap: Chapter, nested: boolean) => (
    <button
      type="button"
      className={`chapter-link ${kap.id === aktivtKapittel ? 'active' : ''} ${nested ? 'nested' : ''}`}
      aria-current={kap.id === aktivtKapittel ? 'page' : undefined}
      onClick={() => navigate({ fag: aktivtFag.id, kapittel: kap.id })}
    >
      <span className="chapter-name">
        {!nested && kap.hoved && <span className="chapter-num">{kap.hoved}</span>}
        {kap.under}
      </span>
      <span className="count" aria-label={`${kap.maal.length} mål`}>
        {kap.maal.length}
      </span>
    </button>
  );

  const renderGroup = (g: ChapterGroup) => {
    if (g.kapitler.length === 1) return link(g.kapitler[0]!, false);
    const isOpen = open.has(g.hoved);
    const panelId = `gruppe-${g.kapitler[0]!.id}`;
    return (
      <>
        <button type="button" className="chapter-group" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(g.hoved)}>
          <span className="chevron" aria-hidden="true">
            ›
          </span>
          <span className="chapter-group-name">{g.hoved}</span>
          <span className="count">{g.antallMaal}</span>
        </button>
        {isOpen && (
          <ul id={panelId}>
            {g.kapitler.map((kap) => (
              <li key={kap.id}>{link(kap, true)}</li>
            ))}
          </ul>
        )}
      </>
    );
  };

  return (
    <nav className="sidebar" aria-label="Fag og kapitler">
      <div className="subject-tabs" role="tablist" aria-label="Velg dokument">
        {fag.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={f.id === aktivtFag.id}
            className="subject-tab"
            onClick={() => navigate({ fag: f.id })}
          >
            {f.navn}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`chapter-link overview-link ${!aktivtKapittel ? 'active' : ''}`}
        onClick={() => navigate({ fag: aktivtFag.id })}
      >
        Oversikt over {aktivtFag.navn.toLowerCase()}
      </button>

      <ul className="chapter-list">
        {groups.map((g) => (
          <li key={g.hoved + g.kapitler[0]!.id}>{renderGroup(g)}</li>
        ))}
      </ul>
    </nav>
  );
}
