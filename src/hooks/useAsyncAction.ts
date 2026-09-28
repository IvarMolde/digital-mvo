import { useCallback, useState } from 'react';

/** Kjører en asynkron handling med opptatt-status og brukervennlig feilmelding. */
export function useAsyncAction<A extends unknown[]>(action: (...args: A) => Promise<void>, errorMessage: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: A) => {
      setBusy(true);
      setError(null);
      try {
        await action(...args);
      } catch (err) {
        console.error(err);
        setError(errorMessage);
      } finally {
        setBusy(false);
      }
    },
    [action, errorMessage],
  );

  return { run, busy, error };
}
