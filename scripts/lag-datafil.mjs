// Lager datafilen appen leser (public/data/digitale-ferdigheter.xlsx) ved å kopiere
// originalregnearket og legge til kolonner for klasseromseksempler.
// Originalfilen endres ikke. Kjøres på nytt med: npm run lag-datafil
import ExcelJS from 'exceljs';
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const kilde = process.argv[2] ?? resolve(root, 'kilder', 'Digitale ferdigheter versjon.xlsx');
const mål = resolve(root, 'public', 'data', 'digitale-ferdigheter.xlsx');

const EKSEMPEL_KOLONNER = ['Eksempel nivå 1', 'Eksempel nivå 2', 'Eksempel nivå 3'];
const RETTELSER = { Perspektivmangfald: 'Perspektivmangfold' };

try {
  const eksempler = JSON.parse(await readFile(resolve(root, 'scripts', 'eksempler.json'), 'utf8'));
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(kilde);

  for (const ark of workbook.worksheets) {
    const arkEksempler = eksempler[ark.name];
    if (!arkEksempler) {
      console.warn(`Fant ingen eksempler for arket «${ark.name}» – hopper over.`);
      continue;
    }

    const header = ark.getRow(1);
    EKSEMPEL_KOLONNER.forEach((tittel, i) => {
      const celle = header.getCell(9 + i);
      celle.value = tittel;
      celle.style = { ...header.getCell(8).style };
      ark.getColumn(9 + i).width = 60;
    });

    let mangler = 0;
    ark.eachRow((rad, radNr) => {
      if (radNr === 1) return;
      const nr = String(rad.getCell(1).value ?? '').trim();
      if (!nr) return;

      for (let kol = 1; kol <= 8; kol++) {
        const celle = rad.getCell(kol);
        if (typeof celle.value === 'string') {
          for (const [fra, til] of Object.entries(RETTELSER)) {
            celle.value = celle.value.replaceAll(fra, til);
          }
        }
      }

      const tekster = arkEksempler[nr];
      if (!tekster) {
        mangler++;
        return;
      }
      tekster.forEach((tekst, i) => {
        const celle = rad.getCell(9 + i);
        celle.value = tekst;
        celle.alignment = { wrapText: true, vertical: 'top' };
      });
    });

    console.log(`${ark.name}: ${ark.rowCount - 1} rader${mangler ? `, ${mangler} uten eksempler` : ''}`);
  }

  await mkdir(dirname(mål), { recursive: true });
  await workbook.xlsx.writeFile(mål);
  console.log(`Skrev ${mål}`);
} catch (err) {
  console.error('Klarte ikke å lage datafilen:', err instanceof Error ? err.message : err);
  process.exit(1);
}
