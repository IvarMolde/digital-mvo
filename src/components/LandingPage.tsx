import { useState } from 'react';

export type Category = 'norsk-samfunn' | 'fov' | null;

interface LandingPageProps {
  onSelectCategory: (category: Category) => void;
}

export function LandingPage({ onSelectCategory }: LandingPageProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (category: Category) => {
    setIsTransitioning(true);
    setTimeout(() => {
      onSelectCategory(category);
    }, 300);
  };

  return (
    <div className={`landing-page ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="landing-content">
        <div className="landing-header">
          <h1>Digital plan</h1>
          <p className="landing-subtitle">Digitale ferdigheter i voksenopplæringen</p>
          <p className="landing-description">Velg ditt undervisningsområde:</p>
        </div>

        <div className="landing-cards">
          <button
            className="landing-card norsk-samfunn"
            onClick={() => handleSelect('norsk-samfunn')}
            title="Læremål for norsk og samfunnsfag"
          >
            <div className="card-icon">📚</div>
            <div className="card-title">Underviser i norsk og samfunnsfag</div>
            <div className="card-description">Læreplan for voksne innvandrere</div>
            <div className="card-subjects">Norsk • Samfunnsfag • Overordnet del</div>
          </button>

          <button
            className="landing-card fov"
            onClick={() => handleSelect('fov')}
            title="Læremål for FOV"
          >
            <div className="card-icon">🎓</div>
            <div className="card-title">Underviser FOV</div>
            <div className="card-description">Forberedende opplæring for voksne</div>
            <div className="card-subjects">Grunnmodul • Matematikk • Naturfag • Engelsk • Norsk • Samfunnsfag</div>
          </button>
        </div>
      </div>
    </div>
  );
}
