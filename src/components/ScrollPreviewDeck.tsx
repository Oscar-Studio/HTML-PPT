import { useEffect } from 'react';
import type { Presentation, Slide } from '../types';
import { getTheme } from '../lib/themes';
import { CardAnimated } from './CardAnimated';
import { useStageScale } from '../hooks/useStageScale';

export function ScrollPreviewDeck({
  presentation,
  currentIndex,
  onChangeIndex,
}: {
  presentation: Presentation;
  currentIndex: number;
  onChangeIndex?: (i: number) => void;
}) {
  const theme = getTheme(presentation.themeId);
  const scale = useStageScale();

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-section-index]');
    const target = sections[currentIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIndex]);

  return (
    <div
      className="ppt-scroll-deck"
      style={{
        background: presentation.background.value,
        minHeight: '100vh',
      }}
    >
      {presentation.slides.map((slide, i) => (
        <ScrollSection
          key={slide.id}
          slide={slide}
          theme={theme}
          scale={scale}
          index={i}
          total={presentation.slides.length}
        />
      ))}
    </div>
  );
}

function ScrollSection({
  slide,
  theme,
  scale,
  index,
  total,
}: {
  slide: Slide;
  theme: ReturnType<typeof getTheme>;
  scale: number;
  index: number;
  total: number;
}) {
  const sorted = slide.cards.slice().sort((a, b) => a.zIndex - b.zIndex);
  const isHero = index === 0 && sorted.length <= 1;
  return (
    <section
      data-section-index={index}
      className="ppt-section"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <div
        className="ppt-stage"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {sorted.map((card, j) => (
          <CardAnimated key={card.id} card={card} theme={theme} delay={j * 60} stagger={0} />
        ))}
      </div>
      {!isHero && (
        <div
          style={{
            position: 'absolute',
            right: 24,
            top: 24,
            background: 'rgba(0,0,0,0.45)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 13,
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        >
          {index + 1} / {total}
        </div>
      )}
      {index < total - 1 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 18,
            transform: 'translateX(-50%)',
            color: '#00c9ff',
            fontSize: 24,
            opacity: 0.7,
            animation: 'ppt-bounce 1.5s infinite',
            pointerEvents: 'none',
          }}
        >
          <i className="fa-solid fa-chevron-down" aria-hidden="true" />
        </div>
      )}
    </section>
  );
}