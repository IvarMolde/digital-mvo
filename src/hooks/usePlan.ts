import { useEffect, useState } from 'react';
import { loadPlan, PlanLoadError } from '../data/loadPlan';
import type { Plan } from '../types';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; plan: Plan };

export function usePlan(): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const plan = await loadPlan(controller.signal);
        setState({ status: 'ready', plan });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setState({
          status: 'error',
          message: err instanceof PlanLoadError ? err.message : 'Noe gikk galt under lasting av planen.',
        });
      }
    })();
    return () => controller.abort();
  }, []);

  return state;
}
