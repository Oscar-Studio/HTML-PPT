import { useEffect, useRef, useState } from 'react';
import type { Presentation, Slide, Card } from '../types';
import { getTheme } from '../lib/themes';
import { CardRendererInteractive } from './CardRenderer';
import { SLIDE_W, SLIDE_H } from '../lib/factory';
import { useStageScale } from '../hooks/useStageScale';

interface CanvasProps {
  presentation: Presentation;
  slide: Slide;
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onUpdateCard: (cardId: string, patch: Partial<Card>) => void;
}

type DragMode = 'idle' | 'move' | 'resize' | 'rotate';

interface DragState {
  mode: DragMode;
  cardId: string;
  startX: number;
  startY: number;
  startCard: { x: number; y: number; w: number; h: number; rotate: number };
  scale: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function CanvasStage({ presentation, slide, selectedCardId, onSelectCard, onUpdateCard }: CanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const theme = getTheme(presentation.themeId);
  const scale = useStageScale();
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-card-id]')) return;
      onSelectCard(null);
    }
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener('mousedown', onDown);
    return () => el.removeEventListener('mousedown', onDown);
  }, [onSelectCard]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedCardId) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const step = e.shiftKey ? 20 : 4;
      const move: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const dir = move[e.key];
      if (dir) {
        e.preventDefault();
        const card = slide.cards.find((c) => c.id === selectedCardId);
        if (!card) return;
        onUpdateCard(card.id, { x: Math.max(0, card.x + dir[0]), y: Math.max(0, card.y + dir[1]) });
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const store = (window as any).__editor;
        store?.getState().deleteCard(selectedCardId);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCardId, slide.cards, onUpdateCard]);

  // Refresh selectedEl after refs commit
  useEffect(() => {
    if (!selectedCardId) {
      setSelectedEl(null);
      return;
    }
    const id = requestAnimationFrame(() => {
      const el = cardRefs.current.get(selectedCardId);
      if (el) setSelectedEl(el);
    });
    return () => cancelAnimationFrame(id);
  }, [selectedCardId, slide.cards.length, presentation.updatedAt]);

  // Custom drag implementation
  function startDrag(mode: DragMode, e: React.PointerEvent) {
    if (!selected) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      cardId: selected.id,
      startX: e.clientX,
      startY: e.clientY,
      startCard: { x: selected.x, y: selected.y, w: selected.w, h: selected.h, rotate: selected.rotate ?? 0 },
      scale,
    };
    setTick((n) => n + 1);
  }

  function onPointerMove(e: React.PointerEvent) {
    const st = dragRef.current;
    if (!st) return;
    const dx = (e.clientX - st.startX) / st.scale;
    const dy = (e.clientY - st.startY) / st.scale;
    if (st.mode === 'move') {
      onUpdateCard(st.cardId, {
        x: clamp(Math.round(st.startCard.x + dx), 0, SLIDE_W - st.startCard.w),
        y: clamp(Math.round(st.startCard.y + dy), 0, SLIDE_H - st.startCard.h),
      });
    } else if (st.mode === 'resize') {
      const newW = clamp(Math.round(st.startCard.w + dx), 60, SLIDE_W - st.startCard.x);
      const newH = clamp(Math.round(st.startCard.h + dy), 40, SLIDE_H - st.startCard.y);
      onUpdateCard(st.cardId, { w: newW, h: newH });
    } else if (st.mode === 'rotate') {
      const cx = st.startCard.x + st.startCard.w / 2;
      const cy = st.startCard.y + st.startCard.h / 2;
      const sx = st.startX - cx * st.scale;
      const sy = st.startY - cy * st.scale;
      const ex = e.clientX - cx * st.scale;
      const ey = e.clientY - cy * st.scale;
      const startAng = Math.atan2(sy, sx);
      const endAng = Math.atan2(ey, ex);
      const deg = st.startCard.rotate + ((endAng - startAng) * 180) / Math.PI;
      onUpdateCard(st.cardId, { rotate: Math.round(deg * 10) / 10 });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current) return;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    dragRef.current = null;
    setTick((n) => n + 1);
  }

  const selected = slide.cards.find((c) => c.id === selectedCardId) ?? null;

  const handles = selected ? (
    <SelectionOverlay
      card={selected}
      scale={scale}
      onMoveDown={(e) => startDrag('move', e)}
      onResizeDown={(e) => startDrag('resize', e)}
      onRotateDown={(e) => startDrag('rotate', e)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  ) : null;

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: SLIDE_W,
          height: SLIDE_H,
          background: presentation.background.value,
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          flexShrink: 0,
        }}
      >
        {slide.cards
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((card) => (
            <CardRendererInteractive
              key={card.id}
              card={card}
              theme={theme}
              selected={card.id === selectedCardId}
              onSelect={() => onSelectCard(card.id)}
              registerRef={(el) => {
                if (el) cardRefs.current.set(card.id, el);
                else cardRefs.current.delete(card.id);
              }}
            />
          ))}
        {handles}
      </div>
    </div>
  );
}

function SelectionOverlay({
  card,
  scale,
  onMoveDown,
  onResizeDown,
  onRotateDown,
  onPointerMove,
  onPointerUp,
}: {
  card: Card;
  scale: number;
  onMoveDown: (e: React.PointerEvent) => void;
  onResizeDown: (e: React.PointerEvent) => void;
  onRotateDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}) {
  // Hit area should be at least 24 CSS pixels so it's clickable after canvas scale-down.
  const visualSize = 10;
  const hitSize = Math.max(24, visualSize / scale);
  const half = hitSize / 2;
  const handles = [
    { pos: 'nw', x: card.x - half, y: card.y - half, cursor: 'nwse-resize' },
    { pos: 'ne', x: card.x + card.w - half, y: card.y - half, cursor: 'nesw-resize' },
    { pos: 'sw', x: card.x - half, y: card.y + card.h - half, cursor: 'nesw-resize' },
    { pos: 'se', x: card.x + card.w - half, y: card.y + card.h - half, cursor: 'nwse-resize' },
  ];
  return (
    <>
      <div
        onPointerDown={onMoveDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute',
          left: card.x,
          top: card.y,
          width: card.w,
          height: card.h,
          zIndex: 99999,
          outline: '2px solid #00c9ff',
          outlineOffset: 0,
          cursor: 'move',
          boxSizing: 'border-box',
        }}
      />
      {handles.map((h) => (
        <div
          key={h.pos}
          onPointerDown={onResizeDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: 'absolute',
            left: h.x,
            top: h.y,
            width: hitSize,
            height: hitSize,
            zIndex: 100000,
            cursor: h.cursor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: visualSize,
              height: visualSize,
              background: '#fff',
              border: '2px solid #00c9ff',
              borderRadius: 2,
              pointerEvents: 'none',
            }}
          />
        </div>
      ))}
      <div
        onPointerDown={onRotateDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'absolute',
          left: card.x + card.w / 2 - 20,
          top: card.y - 40,
          width: 40,
          height: 24,
          background: '#00c9ff',
          color: '#fff',
          borderRadius: 4,
          zIndex: 100000,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold',
        }}
        title="拖动旋转"
      >
        ↻
      </div>
      <div
        style={{
          position: 'absolute',
          left: card.x + card.w / 2 - 1,
          top: card.y - 16,
          width: 2,
          height: 16,
          background: '#00c9ff',
          zIndex: 99998,
        }}
      />
    </>
  );
}