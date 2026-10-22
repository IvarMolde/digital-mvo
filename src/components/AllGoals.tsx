import { useMemo } from 'react';
import type { Area } from '../data/areas';
import {
  FIELD_LABELS,
  GROUP_LABELS,
  SORT_LABELS,
  VIEW_LABELS,
  groupResults,
  parseQuery,
  searchCatalog,
  sortResults,
  type GoalEntry,
  type GroupKey,
  type SearchResult,
  type SortKey,
  type ViewKey,
} from '../data/search';
import type { Route } from '../hooks/useHashRoute';
import type { ListOptions } from '../hooks/useListOptions';
import { downloadChecklist } from '../services/checklist';
import type { Subject } from '../types';
import { DownloadButton } from './DownloadButton';
import { Highlight } from './Highlight';
import { ChecklistIcon, SearchIcon } from './Icons';

interface Props {
  area: Area;
  fag: Subject[];
  catalog: GoalEntry[];
  options: ListOptions;
  setOptions: (patch: Partial<ListOptions>) => void;
  navigate: (r: Route) => void;
}

const SUGGESTIONS = ['e-post', 'personvern', 'kildekritikk', 'regneark', 'skjema', 'presentasjon', 'nettvett', 'passord', 'kart'];

export function AllGoals({ area, fag, catalog, options, setOptions, navigate }: Props) {
  const { query, fagId, sort, group, view } = options;
  const tokens = useMemo(() => parseQuery(query), [query]);
  const searching = tokens.length > 0;
  // «Best treff først» er standard ved søk. Uten søk brukes læreplanens rekkefølge i stedet.
  const effectiveSort: SortKey = sort === 'relevans' && !searching ? 'laereplan' : sort;
  const valgtFag = fag.find((f) => f.id === fagId);

  const groups = useMemo(() => {
    const scoped = valgtFag ? catalog.filter((e) => e.fag.id === valgtFag.id) : catalog;
    return groupResults(sortResults(searchCatalog(scoped, query), effectiveSort), group);
  }, [catalog, valgtFag, query, effectiveSort, group]);

  // Forslagene vises bare når de faktisk gir treff i dette området.
  const forslag = useMemo(() => SUGGESTIONS.filter((s) => searchCatalog(catalog, s).length > 0).slice(0, 6), [catalog]);

  const antall = groups.reduce((n, g) => n + g.results.length, 0);
  const totalt = valgtFag ? catalog.filter((e) => e.fag.id === valgtFag.id).length : catalog.length;
  const filtrert = searching || !!valgtFag;

  const omfang = [
    valgtFag ? valgtFag.navn : `Alle fag i ${area.navn.toLowerCase()}`,
    searching ? `søk: «${query.trim()}»` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const open = (entry: GoalEntry) =>
    navigate({ fag: entry.fag.id, kapittel: entry.kapittel.id, maal: entry.goal.nr });

  return (
    <div className="all-goals">
      <header className="page-header with-action">
        <div>
          <p className="eyebrow">{area.navn}</p>
          <h1>Alle mål</h1>
          <p className="lead">Søk, filtrer og sorter målene. Listen du ser, kan lastes ned som avkryssingsliste.</p>
        </div>
        <DownloadButton
          label="Last ned avkryssingsliste"
          variant="primary"
          icon={<ChecklistIcon />}
          title="Word-fil med alle målene som vises, med avkrysning for nivå 1–3"
          onDownload={() => downloadChecklist(area, groups, omfang)}
        />
      </header>

      <section className="toolbar" aria-label="Søk og visning">
        <div className="search-field big">
          <SearchIcon size={22} />
          <label htmlFor="sok-alle" className="visually-hidden">
            Søk etter mål
          </label>
          <input
            id="sok-alle"
            type="search"
            value={query}
            autoComplete="off"
            placeholder="Søk etter mål, tema eller ord – også i nivåer og eksempler"
            onChange={(event) => setOptions({ query: event.target.value })}
          />
        </div>

        <div className="toolbar-row">
          <label className="control">
            <span>Fag</span>
            <select value={valgtFag?.id ?? ''} onChange={(event) => setOptions({ fagId: event.target.value })}>
              <option value="">Alle fag</option>
              {fag.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.navn}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            <span>Sorter</span>
            <select value={effectiveSort} onChange={(event) => setOptions({ sort: event.target.value as SortKey })}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <option key={key} value={key} disabled={key === 'relevans' && !searching}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </label>

          <label className="control">
            <span>Grupper</span>
            <select value={group} onChange={(event) => setOptions({ group: event.target.value as GroupKey })}>
              {(Object.keys(GROUP_LABELS) as GroupKey[]).map((key) => (
                <option key={key} value={key}>
                  {GROUP_LABELS[key]}
                </option>
              ))}
            </select>
          </label>

          <div className="control">
            <span id="visning-label">Visning</span>
            <div className="segmented" role="radiogroup" aria-labelledby="visning-label">
              {(Object.keys(VIEW_LABELS) as ViewKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={view === key}
                  className={view === key ? 'active' : ''}
                  onClick={() => setOptions({ view: key })}
                >
                  {VIEW_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="result-bar" aria-live="polite">
          <span>
            {filtrert ? (
              <>
                Viser <strong>{antall}</strong> av {totalt} mål
              </>
            ) : (
              <>
                <strong>{antall}</strong> mål
              </>
            )}
          </span>
          {filtrert && (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setOptions({ query: '', fagId: '' })}>
              Nullstill søk og filter
            </button>
          )}
        </div>
      </section>

      {antall === 0 ? (
        <div className="empty-state">
          <p>
            <strong>Ingen mål passer søket.</strong> Prøv et kortere ord, eller søk i alle fag.
          </p>
          <p className="suggestions">
            Prøv for eksempel:{' '}
            {forslag.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => setOptions({ query: s, fagId: '' })}>
                {s}
              </button>
            ))}
          </p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.id} className="result-group" aria-label={g.label || 'Mål'}>
            {g.label && (
              <h2 className="result-group-title">
                {g.label}
                <span className="count">{g.results.length}</span>
              </h2>
            )}
            {view === 'tabell' ? (
              <GoalTable results={g.results} tokens={tokens} visFag={group !== 'fag'} onOpen={open} />
            ) : (
              <ul className={view === 'kort' ? 'result-cards' : 'result-list'}>
                {g.results.map((r) => (
                  <li key={r.entry.goal.id}>
                    <ResultItem result={r} tokens={tokens} visFag={group !== 'fag'} visKapittel={group !== 'kapittel'} onOpen={open} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}

function meta(entry: GoalEntry, visFag: boolean, visKapittel: boolean): string {
  return [visFag ? entry.fag.navn : null, visKapittel ? entry.sted : null, entry.goal.side].filter(Boolean).join(' · ');
}

function TreffIn({ result }: { result: SearchResult }) {
  // Vis hvor treffet er når det ikke står i selve målformuleringen.
  const andre = result.treff.filter((t) => t !== 'maal');
  if (!andre.length || result.treff.includes('maal')) return null;
  return <span className="hit-where">Treff i {andre.map((t) => FIELD_LABELS[t]).join(', ')}</span>;
}

function ResultItem({
  result,
  tokens,
  visFag,
  visKapittel,
  onOpen,
}: {
  result: SearchResult;
  tokens: string[];
  visFag: boolean;
  visKapittel: boolean;
  onOpen: (entry: GoalEntry) => void;
}) {
  const { entry } = result;
  const info = meta(entry, visFag, visKapittel);
  return (
    <button type="button" className={`result-item tone-${entry.tone}`} onClick={() => onOpen(entry)}>
      <span className="goal-nr">{entry.goal.nr}</span>
      <span className="result-body">
        {info && <span className="result-meta">{info}</span>}
        <span className="result-text">
          <Highlight text={entry.goal.maal} tokens={tokens} />
        </span>
        <TreffIn result={result} />
      </span>
      <span className="goal-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}

function GoalTable({
  results,
  tokens,
  visFag,
  onOpen,
}: {
  results: SearchResult[];
  tokens: string[];
  visFag: boolean;
  onOpen: (entry: GoalEntry) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="goal-table">
        <thead>
          <tr>
            <th scope="col">Nr.</th>
            {visFag && <th scope="col">Fag</th>}
            <th scope="col">Kapittel / modul</th>
            <th scope="col">Målformulering</th>
            <th scope="col" className="lvl-1">Nivå 1</th>
            <th scope="col" className="lvl-2">Nivå 2</th>
            <th scope="col" className="lvl-3">Nivå 3</th>
          </tr>
        </thead>
        <tbody>
          {results.map(({ entry }) => (
            <tr key={entry.goal.id}>
              <td>{entry.goal.nr}</td>
              {visFag && <td>{entry.fag.navn}</td>}
              <td>{entry.sted}</td>
              <td>
                <button type="button" className="table-link" onClick={() => onOpen(entry)}>
                  <Highlight text={entry.goal.maal} tokens={tokens} />
                </button>
              </td>
              {entry.goal.nivaer.map((n) => (
                <td key={n.nummer} className="lvl-text">
                  <Highlight text={n.beskrivelse} tokens={tokens} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
