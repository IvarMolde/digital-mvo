export const ACTIVITY_HEADING = 'Forslag til aktivitet i klasserommet';

export interface ActivityParts {
  forbered: string;
  gjor: string;
  seEtter: string;
}

/** Leser de tre leddene læreren skal kjenne igjen. Eldre fri tekst returnerer null. */
export function parseActivity(raw: string): ActivityParts | null {
  const text = raw.trim();
  if (!text) return null;
  const forbered = text.match(/(?:^|\n)Forbered:\s*([\s\S]*?)(?=\nGjør:|\nSe etter:|$)/i)?.[1]?.trim();
  const gjor = text.match(/(?:^|\n)Gjør:\s*([\s\S]*?)(?=\nSe etter:|$)/i)?.[1]?.trim();
  const seEtter = text.match(/(?:^|\n)Se etter:\s*([\s\S]*)$/i)?.[1]?.trim();
  if (!forbered || !gjor || !seEtter) return null;
  return { forbered, gjor, seEtter };
}
