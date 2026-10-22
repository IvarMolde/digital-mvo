import { useCallback, useEffect, useState } from 'react';

/**
 * Enkel ruting i adressefeltet (#/område/fag/kapittel/mål), slik at lærere kan dele
 * lenker til et bestemt mål og bruke tilbake-knappen i nettleseren.
 * Tom rute (#/) er startsiden der læreren velger område.
 */
export interface Route {
  omrade?: string;
  /** Fag-id, eller «alle» for listen over alle mål i området. */
  fag?: string;
  kapittel?: string;
  maal?: string;
}

export const ALL_GOALS = 'alle';

const SEGMENT = /^[a-z0-9-]{1,80}$/;

function parse(hash: string): Route {
  const [omrade, fag, kapittel, maal] = hash
    .replace(/^#\/?/, '')
    .split('/')
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return '';
      }
    })
    .filter((s) => SEGMENT.test(s));
  return { omrade, fag, kapittel, maal };
}

export function toHash(route: Route): string {
  return '#/' + [route.omrade, route.fag, route.kapittel, route.maal].filter(Boolean).map((s) => encodeURIComponent(s!)).join('/');
}

export function useHashRoute(): [Route, (r: Route, options?: { replace?: boolean; keepScroll?: boolean }) => void] {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((r: Route, options: { replace?: boolean; keepScroll?: boolean } = {}) => {
    const hash = toHash(r);
    if (hash !== window.location.hash) {
      if (options.replace) {
        window.history.replaceState(null, '', hash);
        setRoute(parse(hash));
      } else {
        window.location.hash = hash;
      }
    }
    if (!options.keepScroll) window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate];
}
