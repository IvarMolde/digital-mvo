import type { AreaId } from '../types';

export interface Area {
  id: AreaId;
  navn: string;
  /** Kort navn til toppfeltet og filnavn. */
  kortnavn: string;
  beskrivelse: string;
}

export const AREAS: Area[] = [
  {
    id: 'norsk-samfunn',
    navn: 'Norsk og samfunnskunnskap',
    kortnavn: 'Norsk og samfunnskunnskap',
    beskrivelse: 'Læreplanen i norsk og samfunnskunnskap for voksne innvandrere, med overordnet del.',
  },
  {
    id: 'fov',
    navn: 'Forberedende opplæring for voksne',
    kortnavn: 'FOV',
    beskrivelse: 'Grunnmodul, matematikk, naturfag, engelsk, norsk og samfunnsfag i FOV.',
  },
];

export const findArea = (id: string | undefined): Area | undefined => AREAS.find((a) => a.id === id);

// Ark som heter «FOV – Matematikk» hører til FOV og vises som «Matematikk».
const FOV_SHEET = /^FOV\s*[–-]\s*(.+)$/i;

export function areaForSheet(sheetName: string): { omrade: AreaId; navn: string } {
  const fov = sheetName.trim().match(FOV_SHEET);
  return fov ? { omrade: 'fov', navn: fov[1]!.trim() } : { omrade: 'norsk-samfunn', navn: sheetName.trim() };
}
