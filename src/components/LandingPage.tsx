import { useMemo } from 'react';
import { AREAS, type Area } from '../data/areas';
import { buildCatalog } from '../data/search';
import { downloadFullChecklist } from '../services/checklist';
import type { AreaId, Plan } from '../types';
import { DownloadButton } from './DownloadButton';
import { ArrowIcon, LanguageIcon, ModulesIcon } from './Icons';

interface Props {
  plan: Plan;
  onSelectArea: (area: AreaId) => void;
}

const ICONS = { 'norsk-samfunn': LanguageIcon, fov: ModulesIcon } satisfies Record<AreaId, unknown>;

export function LandingPage({ plan, onSelectArea }: Props) {
  return (
    <main className="landing" id="innhold">
      <div className="landing-inner">
        <header className="landing-header">
          <p className="eyebrow">Digitale ferdigheter i opplæringen</p>
          <h1>Hvor underviser du?</h1>
          <p className="lead">
            Velg område for å se målformuleringene om digitale ferdigheter, med nivåbeskrivelser og forslag til
            aktiviteter i klasserommet.
          </p>
        </header>

        <div className="area-cards">
          {AREAS.map((area) => (
            <AreaCard key={area.id} area={area} plan={plan} onSelect={() => onSelectArea(area.id)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function AreaCard({ area, plan, onSelect }: { area: Area; plan: Plan; onSelect: () => void }) {
  const subjects = useMemo(() => plan.fag.filter((f) => f.omrade === area.id), [plan, area.id]);
  const catalog = useMemo(() => buildCatalog(subjects), [subjects]);
  const Icon = ICONS[area.id];

  return (
    <article className={`area-card area-${area.id}`}>
      <button type="button" className="area-card-main" onClick={onSelect} disabled={!subjects.length}>
        <span className="area-icon">
          <Icon />
        </span>
        <span className="area-kicker">{area.id === 'fov' ? 'FOV' : 'Voksne innvandrere'}</span>
        <span className="area-title">{area.navn}</span>
        <span className="area-text">{area.beskrivelse}</span>
        <span className="area-tags">
          {subjects.map((f) => (
            <span key={f.id} className="area-tag">
              {f.navn}
            </span>
          ))}
        </span>
        <span className="area-footer">
          <span className="area-count">
            {catalog.length} mål · {subjects.length} fag
          </span>
          <span className="area-cta">
            Åpne <ArrowIcon />
          </span>
        </span>
      </button>
      {catalog.length > 0 && (
        <div className="area-extra">
          <DownloadButton
            label="Last ned avkryssingsliste"
            variant="link"
            onDownload={() => downloadFullChecklist(area, catalog)}
          />
        </div>
      )}
    </article>
  );
}
