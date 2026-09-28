// Gjør hvert klasseromsforslag om til Forbered / Gjør / Se etter.
// Kjør på nytt bare mot originaltekst. Allerede utvidede forslag beholdes.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = resolve(dirname(fileURLToPath(import.meta.url)), 'eksempler.json');

const MATERIAL = [
  [/storskjerm/, 'storskjerm'],
  [/bildekort/, 'bildekort'],
  [/situasjonskort/, 'situasjonskort'],
  [/dilemmakort/, 'dilemmakort'],
  [/setningsstarter/, 'setningsstartere'],
  [/frasebank|frasene/, 'fraser'],
  [/læringsplattform|plattformen/, 'læringsplattformen'],
  [/sjekkliste/, 'sjekklisten'],
  [/ordbok|ordapp|bildeordbok/, 'ordboka'],
  [/e-post/, 'et e-posteksempel'],
  [/skjema/, 'skjemaet'],
  [/plakat/, 'plakaten'],
  [/video|klipp/, 'klippet'],
  [/lenke/, 'lenken'],
  [/nettside|nettsted/, 'nettsiden'],
  [/mobil/, 'mobilen'],
  [/\bbilder\b|\bbilde\b/, 'bilder'],
  [/\bkort\b/, 'kort'],
];

const FORBERED = {
  1: 'Vis hele oppgaven selv først, med én modell deltakerne kan følge.',
  2: 'La modellen ligge synlig, slik at deltakerne kan se på den når de trenger det.',
  3: 'Legg fram oppgaven uten å vise løsningen, så deltakerne kan velge arbeidsmåte selv.',
};

const GJØR = {
  1: 'Læreren viser hvert trinn og venter til deltakerne har gjort det samme.',
  2: 'Læreren hjelper bare når noen står fast.',
  3: 'Til slutt ber læreren deltakeren forklare hva hen gjorde, og prøve det samme i en ny situasjon.',
};

const SE_ETTER = {
  1: 'Se om deltakeren får det til når du har vist det først, og om hen bruker støtten som ligger framme.',
  2: 'Se om deltakeren kommer i gang i den kjente oppgaven og ber om hjelp når hen står fast.',
  3: 'Se om deltakeren gjennomfører uten modell og kan bruke det samme i en ny situasjon.',
};

function materials(text) {
  const found = [];
  for (const [pattern, label] of MATERIAL) {
    if (pattern.test(text) && !found.includes(label)) found.push(label);
  }
  const specificCard = found.some((label) => label.endsWith('kort') && label !== 'kort');
  const withoutGeneric = found.filter((label) => {
    if (specificCard && label === 'kort') return false;
    if (found.includes('bildekort') && label === 'bilder') return false;
    return true;
  });
  return withoutGeneric.slice(0, 3);
}

function joinList(items) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} og ${items.at(-1)}`;
}

function forbered(text, level) {
  const list = joinList(materials(text));
  const ready = list ? `Legg klar ${list} før økten.` : 'Gjør klart ett konkret eksempel før økten.';
  return `${ready} ${FORBERED[level]}`;
}

function gjor(text, level) {
  const clean = text.trim().replace(/\s+/g, ' ');
  const end = /[.!?…]$/.test(clean) ? '' : '.';
  return `${clean}${end} ${GJØR[level]}`;
}

function utvid(text, level) {
  if (text.trim().startsWith('Forbered:')) return text;
  return `Forbered: ${forbered(text, level)}\nGjør: ${gjor(text, level)}\nSe etter: ${SE_ETTER[level]}`;
}

const data = JSON.parse(await readFile(file, 'utf8'));
let antall = 0;
let lengst = 0;
for (const ark of Object.values(data)) {
  for (const tekster of Object.values(ark)) {
    if (!Array.isArray(tekster) || tekster.length !== 3) {
      throw new Error('Hvert mål skal ha tre forslag.');
    }
    tekster.forEach((tekst, i) => {
      const neste = utvid(tekst, i + 1);
      tekster[i] = neste;
      antall += 1;
      lengst = Math.max(lengst, neste.length);
    });
  }
}

await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Utvidet ${antall} forslag. Lengste tekst: ${lengst} tegn.`);
