import { useCallback, useState } from 'react';
import type { GroupKey, SortKey, ViewKey } from '../data/search';

export interface ListOptions {
  query: string;
  /** Fag-id, eller tom streng for alle fag i området. */
  fagId: string;
  sort: SortKey;
  group: GroupKey;
  view: ViewKey;
}

const STORAGE_KEY = 'ikt-plan:listevisning';
const SORTS: SortKey[] = ['laereplan', 'alfabetisk', 'relevans'];
const GROUPS: GroupKey[] = ['fag', 'kapittel', 'ingen'];
const VIEWS: ViewKey[] = ['liste', 'kort', 'tabell'];

// Sortering, gruppering og visning huskes i nettleseren. Søk og fagfilter gjør ikke det.
function readSaved(): Pick<ListOptions, 'sort' | 'group' | 'view'> {
  const fallback = { sort: 'relevans' as SortKey, group: 'fag' as GroupKey, view: 'liste' as ViewKey };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<ListOptions>;
    return {
      sort: SORTS.includes(saved.sort!) ? saved.sort! : fallback.sort,
      group: GROUPS.includes(saved.group!) ? saved.group! : fallback.group,
      view: VIEWS.includes(saved.view!) ? saved.view! : fallback.view,
    };
  } catch {
    return fallback;
  }
}

export function useListOptions(): [ListOptions, (patch: Partial<ListOptions>) => void] {
  const [options, setOptions] = useState<ListOptions>(() => ({ query: '', fagId: '', ...readSaved() }));

  const update = useCallback((patch: Partial<ListOptions>) => {
    setOptions((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sort: next.sort, group: next.group, view: next.view }));
      } catch {
        // Lagring er bare en bekvemmelighet.
      }
      return next;
    });
  }, []);

  return [options, update];
}
