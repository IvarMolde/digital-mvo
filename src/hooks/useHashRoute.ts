import { useCallback, useEffect, useState } from 'react';

/**
 * Enkel ruting i adressefeltet (#/fag/kapittel/mål), slik at lærere kan dele
 * lenker til et bestemt mål og bruke tilbake-knappen i nettleseren.
 */
export interface Route {
  fag?: string;
  kapittel?: string;
  maal?: string;
}

const SEGMENT = /^[a-z0-9-]{1,80}$/;

function parse(hash: string): Route {
  const [fag, kapittel, maal] = hash
    .replace(/^#\/?/, '')
    .split('/')
    .map((s) => decodeURIComponent(s))
    .filter((s) => SEGMENT.test(s));
  return { fag, kapittel, maal };
}

export function toHash(route: Route): string {
  return '#/' + [route.fag, route.kapittel, route.maal].filter(Boolean).map((s) => encodeURIComponent(s!)).join('/');
}

export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((r: Route) => {
    const hash = toHash(r);
    if (hash !== window.location.hash) window.location.hash = hash;
    window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate];
}
