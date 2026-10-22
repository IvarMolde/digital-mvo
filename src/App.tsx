import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllGoals } from './components/AllGoals';
import { ChapterView } from './components/ChapterView';
import { DownloadButton } from './components/DownloadButton';
import { GoalView } from './components/GoalView';
import { ChecklistIcon, HomeIcon } from './components/Icons';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { SubjectOverview } from './components/SubjectOverview';
import { findArea, type Area } from './data/areas';
import { buildMenu, findPlacement, findSection } from './data/menu';
import { buildCatalog } from './data/search';
import { ALL_GOALS, useHashRoute, type Route } from './hooks/useHashRoute';
import { useListOptions } from './hooks/useListOptions';
import { usePlan } from './hooks/usePlan';
import { downloadFullChecklist } from './services/checklist';
import type { Plan } from './types';

const SITE_TITLE = 'IKT-plan for Molde voksenopplæringssenter';

export function App() {
  const state = usePlan();
  const [route, navigate] = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const area = findArea(route.omrade);
  const plan = state.status === 'ready' ? state.plan : undefined;
  const subjects = useMemo(() => (plan && area ? plan.fag.filter((f) => f.omrade === area.id) : []), [plan, area]);
  const catalog = useMemo(() => buildCatalog(subjects), [subjects]);

  const goHome = () => {
    setMenuOpen(false);
    navigate({});
  };

  // Eldre lenker (#/norsk/kapittel/mål) hadde ikke område. Finn området ut fra faget.
  useEffect(() => {
    if (!plan || !route.omrade || area) return;
    const fag = plan.fag.find((f) => f.id === route.omrade);
    navigate(fag ? { omrade: fag.omrade, fag: fag.id, kapittel: route.fag, maal: route.kapittel } : {}, { replace: true });
  }, [plan, route, area, navigate]);

  useEffect(() => {
    if (!area) document.title = SITE_TITLE;
  }, [area]);

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''}`}>
      <header className="topbar">
        <a className="brand" href="#/" onClick={(event) => (event.preventDefault(), goHome())}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">
            <strong>{SITE_TITLE}</strong>
            <span>{area ? area.navn : 'Digitale ferdigheter i opplæringen'}</span>
          </span>
        </a>
        {plan && area && (
          <div className="topbar-actions">
            <DownloadButton
              label="Avkryssingsliste"
              variant="secondary"
              icon={<ChecklistIcon />}
              title={`Word-fil med alle mål i ${area.navn.toLowerCase()}`}
              onDownload={() => downloadFullChecklist(area, catalog)}
            />
            <button type="button" className="btn btn-home" onClick={goHome} title="Tilbake til startsiden">
              <HomeIcon />
              <span className="btn-label">Hjem</span>
            </button>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="meny"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? 'Lukk meny' : 'Meny'}
            </button>
          </div>
        )}
      </header>

      {state.status === 'loading' && <p className="status">Laster planen …</p>}
      {state.status === 'error' && (
        <div className="status status-error" role="alert">
          <strong>Planen kunne ikke vises.</strong>
          <p>{state.message} Kontakt den som har ansvar for planen.</p>
        </div>
      )}
      {plan && !area && <LandingPage plan={plan} onSelectArea={(id) => navigate({ omrade: id })} />}
      {plan && area && subjects.length === 0 && (
        <div className="status status-error" role="alert">
          <strong>Det er ingen mål for {area.navn.toLowerCase()} i datafilen ennå.</strong>
          <p>
            <button type="button" className="btn btn-secondary" onClick={goHome}>
              Til startsiden
            </button>
          </p>
        </div>
      )}
      {plan && area && subjects.length > 0 && (
        <PlanView
          key={area.id}
          plan={plan}
          area={area}
          route={route}
          navigate={navigate}
          catalog={catalog}
          closeMenu={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

interface PlanViewProps {
  plan: Plan;
  area: Area;
  route: Route;
  navigate: (r: Route, options?: { replace?: boolean; keepScroll?: boolean }) => void;
  catalog: ReturnType<typeof buildCatalog>;
  closeMenu: () => void;
}

function PlanView({ plan, area, route, navigate, catalog, closeMenu }: PlanViewProps) {
  const [options, setOptions] = useListOptions();
  const subjects = useMemo(() => plan.fag.filter((f) => f.omrade === area.id), [plan, area.id]);

  // Komponentene under kjenner ikke området. Det legges til her.
  const go = useCallback(
    (next: Route) => {
      navigate({ ...next, omrade: area.id });
      closeMenu();
    },
    [navigate, area.id, closeMenu],
  );

  const visAlle = route.fag === ALL_GOALS;
  const fag = visAlle ? undefined : (subjects.find((f) => f.id === route.fag) ?? subjects[0]!);
  const menu = useMemo(() => (fag ? buildMenu(fag) : undefined), [fag]);
  const kapittel = fag?.kapitler.find((k) => k.id === route.kapittel);
  const section = menu && !kapittel ? findSection(menu, route.kapittel ?? '') : undefined;
  const placement = menu && kapittel ? findPlacement(menu, kapittel.id) : undefined;
  const goal = kapittel?.maal.find((g) => g.nr === route.maal);
  const aktivBolk = placement?.section.id ?? section?.id;

  useEffect(() => {
    document.title = [
      visAlle ? 'Alle mål' : undefined,
      goal && `Mål ${goal.nr}`,
      placement?.item.label,
      placement?.section.label ?? section?.label,
      fag?.navn,
      area.kortnavn,
      'IKT-plan',
    ]
      .filter(Boolean)
      .join(' – ');
  }, [visAlle, fag, goal, placement, section, area]);

  const showAll = (patch: Partial<typeof options> = {}) => {
    setOptions(patch);
    go({ fag: ALL_GOALS });
  };

  // Søket i menyen fører til listen over alle mål. Menyen blir stående åpen mens læreren skriver.
  const onSearch = (query: string) => {
    setOptions({ query });
    if (!visAlle) navigate({ omrade: area.id, fag: ALL_GOALS }, { keepScroll: true });
  };

  return (
    <div className="layout">
      <Sidebar
        fag={subjects}
        aktivtFag={fag}
        menu={menu}
        aktivtKapittel={kapittel?.id}
        aktivBolk={aktivBolk}
        visAlle={visAlle}
        query={options.query}
        onSearch={onSearch}
        onShowAll={() => showAll()}
        navigate={go}
      />
      <main className="content" id="innhold">
        {plan.hoppetOver.length > 0 && (
          <details className="notice">
            <summary>{plan.hoppetOver.length} rader i regnearket ble ikke vist fordi de mangler innhold.</summary>
            <ul>
              {plan.hoppetOver.map((s) => (
                <li key={`${s.ark}-${s.rad}`}>
                  {s.ark}, rad {s.rad}: {s.grunn}
                </li>
              ))}
            </ul>
          </details>
        )}
        {visAlle || !fag || !menu ? (
          <AllGoals area={area} fag={subjects} catalog={catalog} options={options} setOptions={setOptions} navigate={go} />
        ) : kapittel && goal ? (
          <GoalView fag={fag} kapittel={kapittel} goal={goal} placement={placement} navigate={go} />
        ) : kapittel ? (
          <ChapterView fag={fag} kapittel={kapittel} placement={placement} navigate={go} />
        ) : (
          <SubjectOverview
            fag={fag}
            menu={menu}
            section={section}
            navigate={go}
            onShowList={() => showAll({ fagId: fag.id, query: '' })}
          />
        )}
      </main>
    </div>
  );
}
