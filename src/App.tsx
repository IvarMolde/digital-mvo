import { useEffect } from 'react';
import { ChapterView } from './components/ChapterView';
import { GoalView } from './components/GoalView';
import { Sidebar } from './components/Sidebar';
import { SubjectOverview } from './components/SubjectOverview';
import { useHashRoute } from './hooks/useHashRoute';
import { usePlan } from './hooks/usePlan';
import type { Plan } from './types';

export function App() {
  const state = usePlan();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <strong>Digital plan</strong>
            <span>Digitale ferdigheter i voksenopplæringen</span>
          </div>
        </div>
      </header>

      {state.status === 'loading' && <p className="status">Laster planen …</p>}
      {state.status === 'error' && (
        <div className="status status-error" role="alert">
          <strong>Planen kunne ikke vises.</strong>
          <p>{state.message} Kontakt den som har ansvar for planen.</p>
        </div>
      )}
      {state.status === 'ready' && <PlanView plan={state.plan} />}
    </div>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  const [route, navigate] = useHashRoute();
  const fag = plan.fag.find((f) => f.id === route.fag) ?? plan.fag[0]!;
  const kapittel = fag.kapitler.find((k) => k.id === route.kapittel);
  const goal = kapittel?.maal.find((g) => g.nr === route.maal);

  useEffect(() => {
    document.title = [goal && `Mål ${goal.nr}`, kapittel?.tittel, fag.navn, 'Digital plan'].filter(Boolean).join(' – ');
  }, [fag, kapittel, goal]);

  return (
    <div className="layout">
      <Sidebar fag={plan.fag} aktivtFag={fag} aktivtKapittel={kapittel?.id} navigate={navigate} />
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
          <GoalView fag={fag} kapittel={kapittel} goal={goal} navigate={navigate} />
        ) : kapittel ? (
          <ChapterView fag={fag} kapittel={kapittel} navigate={navigate} />
        ) : (
          <SubjectOverview fag={fag} navigate={navigate} />
        )}
      </main>
    </div>
  );
}
