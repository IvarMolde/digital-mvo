# IKT-plan for Molde voksenopplæringssenter

Nettside for lærere som samler alle målformuleringer om digitale ferdigheter.
På startsiden velger læreren område:

- **Norsk og samfunnskunnskap** – overordnet del og læreplanene i norsk og samfunnsfag for voksne innvandrere
- **FOV** (forberedende opplæring for voksne) – grunnmodul, matematikk, naturfag, engelsk, norsk og samfunnsfag

Læreren velger så fag → kapittel/modul → mål og får opp tre kort (nivå 1–3) med
nivåbeskrivelse og et konkret klasseromseksempel. Hvert mål og hvert fag kan lastes ned som Word-fil.
**Hjem**-knappen øverst til høyre fører alltid tilbake til startsiden.

**Alle mål** viser alle målene i området på én side. Her kan læreren søke (også i nivåer og
eksempler, og med toleranse for skrivefeil), filtrere på fag, sortere (best treff, læreplanens
rekkefølge eller alfabetisk), gruppere (etter fag, kapittel eller ingen) og velge visning
(liste, kort eller tabell). Listen som vises, kan lastes ned som **avkryssingsliste** i Word,
med en avkrysningsboks per nivå og plass til dato/merknad. Avkryssingslisten for hele området
finnes også på startsiden og i toppfeltet.

## Kom i gang

```bash
npm install
npm run dev        # åpner på http://localhost:5173
```

## Redigere innholdet

Alt innhold ligger i **`public/data/digitale-ferdigheter.xlsx`**. Ett ark per fag
(arknavnet blir menyvalget). Ark som begynner med **«FOV – »** (f.eks. «FOV – Matematikk»)
hører til FOV og vises som «Matematikk». Alle andre ark hører til norsk og samfunnskunnskap.
Kolonnene gjenkjennes på overskriften, ikke plassering:

| Overskrift | Påkrevd |
|---|---|
| Nr. | ja |
| Dokument | nei |
| Kapittel / avsnitt | ja – f.eks. «Kap. 6 – A1 skrive». Teksten før « – » blir gruppe i menyen |
| Målformulering (kortversjon) | ja |
| Sidehenvisning | nei – brukes til å sortere kapitlene. Uten sidetall brukes rekkefølgen i arket |
| Nivå 1 / Nivå 2 / Nivå 3 | ja |
| Eksempel nivå 1 / 2 / 3 | nei |

Lagre regnearket og last siden på nytt – endringene vises straks, uten ny bygging.
Rader med manglende påkrevde felt vises ikke, og siden viser en melding om hvilke rader det gjelder.

`npm run lag-datafil` lager datafilen på nytt fra originalen
`kilder/Digitale ferdigheter versjon.xlsx` og `scripts/eksempler.json`.
Mappen `kilder/` inneholder også læreplanen i PDF.
**Obs:** Dette overskriver endringer gjort direkte i datafilen.

## Publisere

```bash
npm run build
```

Innholdet i `dist/` er en statisk nettside som kan legges på en hvilken som helst webserver
(f.eks. Azure Static Web Apps, GitHub Pages eller skolens webserver). Excel-filen ligger i
`dist/data/` og kan byttes ut direkte på serveren.
