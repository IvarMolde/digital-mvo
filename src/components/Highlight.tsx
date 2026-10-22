import { Fragment } from 'react';
import { matchWord, normalize } from '../data/search';

const PARTS = /([\p{L}\p{N}]+)/u;

/** Markerer ordene i teksten som treffer søket. */
export function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>;
  return (
    <>
      {text.split(PARTS).map((part, i) =>
        i % 2 === 1 && tokens.some((t) => matchWord(t, normalize(part)) > 0) ? (
          <mark key={i}>{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
