# Digital plan – digitale ferdigheter i voksenopplæringen

Nettside for lærere som samler alle målformuleringer om digitale ferdigheter fra
overordnet del, læreplanen i norsk og læreplanen i samfunnsfag for voksne innvandrere.
Læreren velger dokument → kapittel → mål og får opp tre kort (nivå 1–3) med
nivåbeskrivelse og et konkret klasseromseksempel. Hvert mål og hvert fag kan lastes ned som Word-fil.

## Kom i gang

```bash
npm install
npm run dev        # åpner på http://localhost:5173
```

## Redigere innholdet

Alt innhold ligger i **`public/data/digitale-ferdigheter.xlsx`**. Ett ark per dokument
(arknavnet blir menyvalget). Kolonnene gjenkjennes på overskriften, ikke plassering:

| Overskrift | Påkrevd |
|---|---|
| Nr. | ja |
| Dokument | nei |
| Kapittel / avsnitt | ja – f.eks. «Kap. 6 – A1 skrive». Teksten før « – » blir gruppe i menyen |
| Målformulering (kortversjon) | ja |
| Sidehenvisning | nei – brukes til å sortere kapitlene |
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
