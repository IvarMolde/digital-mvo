import { useEffect, useState } from 'react';
import { searchGoals, type SubjectMenu } from '../data/menu';
import type { Route } from '../hooks/useHashRoute';
import type { Subject } from '../types';
import { CurriculumMenu } from './CurriculumMenu';

interface Props {
  fag: Subject[];
  aktivtFag: Subject;
  menu: SubjectMenu;
  aktivtKapittel?: string;
  aktivBolk?: string;
  navigate: (r: Route) => void;
}

export function Sidebar({ fag, aktivtFag, menu, aktivtKapittel, aktivBolk, navigate }: Props) {
  const [query, setQuery] = useState('');
  // undefined følger ruten, null er lukket, ellers er den bolken åpnet av læreren.
  const [override, setOverride] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setOverride(undefined);
    setQuery('');
  }, [aktivtFag.id, aktivtKapittel, aktivBolk]);

  const openSectionId = override === undefined ? aktivBolk : override;
  const hits = searchGoals(menu, query);

  const toggle = (sectionId: string) => {
    const isOpen = openSectionId === sectionId;
    const onSectionPage = aktivBolk === sectionId && !aktivtKapittel;
    if (isOpen && onSectionPage) {
      setOverride(null);
      return;
    }
    setOverride(sectionId);
    navigate({ fag: aktivtFag.id, kapittel: sectionId });
  };

  return (
    <nav className="sidebar" id="meny" aria-label="Fag og kapitler">
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
        className={`chapter-link overview-link ${!aktivtKapittel && !aktivBolk ? 'active' : ''}`}
        onClick={() => navigate({ fag: aktivtFag.id })}
      >
        Oversikt over {aktivtFag.navn.toLowerCase()}
      </button>

      <label className="menu-search-label" htmlFor="sok">
        Søk i {aktivtFag.navn.toLowerCase()}
      </label>
      <input
        id="sok"
        type="search"
        className="menu-search"
        value={query}
        placeholder="Søk i mål, kapittel eller side"
        onChange={(event) => setQuery(event.target.value)}
      />

      {query.trim() ? (
        <div className="search-results" aria-live="polite">
          {hits.length === 0 ? (
            <p className="search-empty">Ingen mål passer søket.</p>
          ) : (
            <ul>
              {hits.map((hit) => (
                <li key={hit.goal.id}>
                  <button
                    type="button"
                    className={`search-hit tone-${hit.section.tone}`}
                    onClick={() => navigate({ fag: aktivtFag.id, kapittel: hit.item.id, maal: hit.goal.nr })}
                  >
                    <span className="tone-swatch" aria-hidden="true" />
                    <span>
                      <span className="search-hit-where">
                        Mål {hit.goal.nr} · {hit.section.label} · {hit.item.label}
                        {hit.goal.side ? ` · ${hit.goal.side}` : ''}
                      </span>
                      <span className="search-hit-text">{hit.goal.maal}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <CurriculumMenu
          menu={menu}
          variant="sidebar"
          activeChapterId={aktivtKapittel}
          activeSectionId={aktivBolk}
          openSectionId={openSectionId}
          onToggleSection={toggle}
          onSelectChapter={(chapterId) => navigate({ fag: aktivtFag.id, kapittel: chapterId })}
        />
      )}
    </nav>
  );
}
