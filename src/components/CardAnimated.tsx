import { useEffect, useRef, useState } from 'react';
import type { Card, Theme } from '../types';
import { CardRenderer } from './CardRenderer';

export function CardAnimated({
  card,
  theme,
  delay = 0,
  stagger = 80,
  reset = true,
}: {
  card: Card;
  theme: Theme;
  delay?: number;
  stagger?: number;
  reset?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        } else if (reset) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reset]);

  return (
    <div
      ref={ref}
      data-animated
      data-visible={visible ? '1' : '0'}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity .8s ease ${delay + stagger}ms, transform .8s ease ${delay + stagger}ms`,
        willChange: 'opacity, transform',
      }}
    >
      <CardRenderer card={card} theme={theme} />
    </div>
  );
}