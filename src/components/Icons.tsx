// Enkle strekikoner. Fargen følger teksten (currentColor).
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const HomeIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5h5v-5.5h3v5.5h5V10" />
  </svg>
);

export const ChecklistIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <rect x="3.5" y="4" width="5" height="5" rx="1" />
    <path d="m4.8 6.6 1.2 1.1 1.9-2.2" />
    <rect x="3.5" y="14" width="5" height="5" rx="1" />
    <path d="M12 6.5h8.5M12 16.5h8.5" />
  </svg>
);

export const ListIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
    <circle cx="4.5" cy="6.5" r="1" />
    <circle cx="4.5" cy="12" r="1" />
    <circle cx="4.5" cy="17.5" r="1" />
  </svg>
);

export const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5.5 5.5" />
  </svg>
);

export const ArrowIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

/** Norsk og samfunnskunnskap: snakkeboble med bok. */
export const LanguageIcon = ({ size = 40 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={1.5}>
    <path d="M4 5.5h16v10H11l-4.5 3.5v-3.5H4z" />
    <path d="M8 9h8M8 12h5" />
  </svg>
);

/** FOV: fag og moduler, stablede bøker. */
export const ModulesIcon = ({ size = 40 }: { size?: number }) => (
  <svg {...base} width={size} height={size} strokeWidth={1.5}>
    <path d="M4 19.5h16" />
    <rect x="5" y="6" width="3.5" height="13.5" rx="0.6" />
    <rect x="9.5" y="4" width="3.5" height="15.5" rx="0.6" />
    <path d="m14.6 7.2 3.3-.9 3 12.4-3.3.8z" />
  </svg>
);
