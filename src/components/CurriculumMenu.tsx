import { countGoals, type MenuSection, type SubjectMenu } from '../data/menu';

interface Props {
  menu: SubjectMenu;
  activeChapterId?: string;
  activeSectionId?: string;
  openSectionId?: string | null;
  onToggleSection: (sectionId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  variant: 'sidebar' | 'overview';
}

export function CurriculumMenu({
  menu,
  activeChapterId,
  activeSectionId,
  openSectionId,
  onToggleSection,
  onSelectChapter,
  variant,
}: Props) {
  if (variant === 'overview') {
    return (
      <div className="menu-overview">
        {menu.sections.map((section) => (
          <section key={section.id} className="chapter-section" aria-labelledby={`bolk-${section.id}`}>
            <SectionTitle section={section} id={`bolk-${section.id}`} />
            <ItemGrid section={section} activeChapterId={activeChapterId} onSelectChapter={onSelectChapter} />
          </section>
        ))}
      </div>
    );
  }

  return (
    <ul className="chapter-list">
      {menu.sections.map((section) => {
        const open = openSectionId === section.id;
        const panelId = `meny-${section.id}`;
        const current = activeSectionId === section.id;
        return (
          <li key={section.id}>
            <button
              type="button"
              className={`menu-bolk tone-${section.tone} ${current ? 'current' : ''}`}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggleSection(section.id)}
            >
              <span className="tone-swatch" aria-hidden="true" />
              <span className="chevron" aria-hidden="true">
                ›
              </span>
              <span className="chapter-group-name">{section.label}</span>
              <span className="count">{countGoals(section)}</span>
            </button>
            {open && (
              <ul id={panelId}>
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`chapter-link nested tone-${section.tone} ${item.id === activeChapterId ? 'active' : ''}`}
                      aria-current={item.id === activeChapterId ? 'page' : undefined}
                      onClick={() => onSelectChapter(item.id)}
                    >
                      <span className="chapter-name">
                        {item.henvisning && <span className="chapter-num">{item.henvisning}</span>}
                        {item.label}
                      </span>
                      <span className="count" aria-label={`${item.chapter.maal.length} mål`}>
                        {item.chapter.maal.length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SectionTitle({ section, id }: { section: MenuSection; id: string }) {
  return (
    <h2 id={id} className={`menu-bolk-title tone-${section.tone}`}>
      <span className="tone-swatch" aria-hidden="true" />
      {section.label}
      <span className="count">{countGoals(section)}</span>
    </h2>
  );
}

function ItemGrid({
  section,
  activeChapterId,
  onSelectChapter,
}: {
  section: MenuSection;
  activeChapterId?: string;
  onSelectChapter: (chapterId: string) => void;
}) {
  return (
    <ul className="chapter-grid">
      {section.items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={`chapter-card tone-${section.tone} ${item.id === activeChapterId ? 'active' : ''}`}
            aria-current={item.id === activeChapterId ? 'page' : undefined}
            onClick={() => onSelectChapter(item.id)}
          >
            {item.henvisning && <span className="chapter-num">{item.henvisning}</span>}
            <span className="chapter-card-title">{item.label}</span>
            <span className="chapter-card-count">{item.chapter.maal.length} mål</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
