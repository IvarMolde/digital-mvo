import { useEffect, useState } from 'react';
import type { SubjectMenu } from '../data/menu';
import type { Route } from '../hooks/useHashRoute';
import type { Subject } from '../types';
import { CurriculumMenu } from './CurriculumMenu';
import { ListIcon, SearchIcon } from './Icons';

interface Props {
  fag: Subject[];
  /** Mangler når læreren er på siden med alle mål. */
  aktivtFag?: Subject;
  menu?: SubjectMenu;
  aktivtKapittel?: string;
  aktivBolk?: string;
  visAlle: boolean;
  query: string;
  onSearch: (query: string) => void;
  onShowAll: () => void;
  navigate: (r: Route) => void;
}

export function Sidebar({ fag, aktivtFag, menu, aktivtKapittel, aktivBolk, visAlle, query, onSearch, onShowAll, navigate }: Props) {
  // undefined følger ruten, null er lukket, ellers er den bolken åpnet av læreren.
  const [override, setOverride] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setOverride(undefined);
  }, [aktivtFag?.id, aktivtKapittel, aktivBolk]);

  const openSectionId = override === undefined ? aktivBolk : override;

  const toggle = (sectionId: string) => {
    if (!aktivtFag) return;
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
      <form
        role="search"
        className="sidebar-search"
        onSubmit={(event) => {
          event.preventDefault();
          onShowAll();
        }}
      >
        <label className="menu-search-label" htmlFor="sok-meny">
          Søk i alle mål
        </label>
        <div className="search-field">
          <SearchIcon />
          <input
            id="sok-meny"
            type="search"
            className="menu-search"
            value={query}
            placeholder="F.eks. regneark, kildekritikk"
            autoComplete="off"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      </form>

      <button type="button" className={`chapter-link all-goals-link ${visAlle ? 'active' : ''}`} onClick={onShowAll}>
        <span className="all-goals-label">
          <ListIcon />
          Alle mål – sorter og filtrer
        </span>
      </button>

      <p className="sidebar-heading">Fag</p>
      <div className="subject-tabs" role="tablist" aria-label="Velg fag">
        {fag.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={f.id === aktivtFag?.id}
            className="subject-tab"
            onClick={() => navigate({ fag: f.id })}
          >
            <span>{f.navn}</span>
            <span className="count">{f.kapitler.reduce((n, k) => n + k.maal.length, 0)}</span>
          </button>
        ))}
      </div>

      {aktivtFag && menu && (
        <>
          <button
            type="button"
            className={`chapter-link overview-link ${!aktivtKapittel && !aktivBolk ? 'active' : ''}`}
            onClick={() => navigate({ fag: aktivtFag.id })}
          >
            Oversikt over {aktivtFag.navn.toLowerCase()}
          </button>
          <CurriculumMenu
            menu={menu}
            variant="sidebar"
            activeChapterId={aktivtKapittel}
            activeSectionId={aktivBolk}
            openSectionId={openSectionId}
            onToggleSection={toggle}
            onSelectChapter={(chapterId) => navigate({ fag: aktivtFag.id, kapittel: chapterId })}
          />
        </>
      )}
    </nav>
  );
}
