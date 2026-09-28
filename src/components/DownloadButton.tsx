import { useAsyncAction } from '../hooks/useAsyncAction';

interface Props {
  label: string;
  onDownload: () => Promise<void>;
  variant?: 'primary' | 'secondary';
}

export function DownloadButton({ label, onDownload, variant = 'primary' }: Props) {
  const { run, busy, error } = useAsyncAction(onDownload, 'Kunne ikke lage Word-filen. Prøv igjen.');

  return (
    <span className="download">
      <button type="button" className={`btn btn-${variant}`} onClick={() => void run()} disabled={busy}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {busy ? 'Lager fil …' : label}
      </button>
      {error && (
        <span role="alert" className="download-error">
          {error}
        </span>
      )}
    </span>
  );
}
