import { useEffect, useMemo, useState } from 'react';
import { ChapterView } from './components/ChapterView';
import { GoalView } from './components/GoalView';
import { Sidebar } from './components/Sidebar';
import { SubjectOverview } from './components/SubjectOverview';
import { buildMenu, findPlacement, findSection } from './data/menu';
import { useHashRoute, type Route } from './hooks/useHashRoute';
import { usePlan } from './hooks/usePlan';
import type { Plan } from './types';

export function App() {
  const state = usePlan();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`app ${menuOpen ? 'menu-open' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <strong>Digital plan</strong>
            <span>Digitale ferdigheter i voksenopplæringen</span>
          </div>
        </div>
        {state.status === 'ready' && (
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="meny"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Lukk meny' : 'Meny'}
          </button>
        )}
      </header>

      {state.status === 'loading' && <p className="status">Laster planen …</p>}
      {state.status === 'error' && (
        <div className="status status-error" role="alert">
          <strong>Planen kunne ikke vises.</strong>
          <p>{state.message} Kontakt den som har ansvar for planen.</p>
        </div>
      )}
      {state.status === 'ready' && <PlanView plan={state.plan} closeMenu={() => setMenuOpen(false)} />}
    </div>
  );
}

function PlanView({ plan, closeMenu }: { plan: Plan; closeMenu: () => void }) {
  const [route, navigate] = useHashRoute();
  const go = (next: Route) => {
    navigate(next);
    closeMenu();
  };

  const fag = plan.fag.find((f) => f.id === route.fag) ?? plan.fag[0]!;
  const menu = useMemo(() => buildMenu(fag), [fag]);
  const kapittel = fag.kapitler.find((k) => k.id === route.kapittel);
  const section = kapittel ? undefined : findSection(menu, route.kapittel ?? '');
  const placement = kapittel ? findPlacement(menu, kapittel.id) : undefined;
  const goal = kapittel?.maal.find((g) => g.nr === route.maal);
  const aktivBolk = placement?.section.id ?? section?.id;

  useEffect(() => {
    document.title = [goal && `Mål ${goal.nr}`, placement?.item.label, placement?.section.label ?? section?.label, fag.navn, 'Digital plan']
      .filter(Boolean)
      .join(' – ');
  }, [fag, kapittel, goal, placement, section]);

  return (
    <div className="layout">
      <Sidebar
        fag={plan.fag}
        aktivtFag={fag}
        menu={menu}
        aktivtKapittel={kapittel?.id}
        aktivBolk={aktivBolk}
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
        {kapittel && goal ? (
          <GoalView fag={fag} kapittel={kapittel} goal={goal} placement={placement} navigate={go} />
        ) : kapittel ? (
          <ChapterView fag={fag} kapittel={kapittel} placement={placement} navigate={go} />
        ) : (
          <SubjectOverview fag={fag} menu={menu} section={section} navigate={go} />
        )}
      </main>
    </div>
  );
}
