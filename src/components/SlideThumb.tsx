import type { Presentation } from '../types';
import { getTheme } from '../lib/themes';
import { CardRenderer } from './CardRenderer';
import { SLIDE_W, SLIDE_H } from '../lib/factory';

export function SlideThumb({ presentation, slideId }: { presentation: Presentation; slideId: string }) {
  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide) return null;
  const theme = getTheme(presentation.themeId);
  const scale = 160 / SLIDE_W;
  return (
    <div
      style={{
        width: 160,
        height: 90,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        background: presentation.background.value,
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {slide.cards
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((card) => (
            <CardRenderer key={card.id} card={card} theme={theme} />
          ))}
      </div>
    </div>
  );
}