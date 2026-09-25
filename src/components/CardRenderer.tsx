import type { CSSProperties } from 'react';
import type { Card, Theme } from '../types';

function cardStyle(card: Card, theme: Theme): CSSProperties {
  const s = card.style ?? {};
  return {
    position: 'absolute',
    left: card.x,
    top: card.y,
    width: card.w,
    height: card.h,
    transform: card.rotate ? `rotate(${card.rotate}deg)` : undefined,
    zIndex: card.zIndex,
    color: s.color ?? theme.colors.text,
    background: s.background,
    border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor ?? theme.cardDefaults.border}` : undefined,
    borderRadius: s.borderRadius,
    padding: s.padding,
    textAlign: s.textAlign,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight as number | undefined,
    opacity: s.opacity,
    boxSizing: 'border-box',
    overflow: 'hidden',
    pointerEvents: 'none',
    fontFamily: theme.fonts.body,
  };
}

function icon(icon?: string) {
  if (!icon) return null;
  const cls = `fa-${icon}`;
  return <i className={`fa-solid ${cls}`} aria-hidden="true" />;
}

function TitleCard({ data }: { data: any }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, textAlign: data.align ?? 'center' }}>
      {data.eyebrow && <div style={{ fontSize: 24, letterSpacing: 4, opacity: 0.75 }}>{data.eyebrow}</div>}
      <h1 style={{ margin: 0, fontSize: 96, lineHeight: 1.1, background: 'linear-gradient(to right, #00c9ff, #92fe9d)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        {data.title}
      </h1>
      {data.subtitle && <p style={{ margin: 0, fontSize: 28, opacity: 0.85, lineHeight: 1.5 }}>{data.subtitle}</p>}
    </div>
  );
}

function TextCard({ data }: { data: any }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 36, color: '#92fe9d', display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon(data.icon)}
        <span>{data.heading}</span>
      </h3>
      <p style={{ margin: 0, fontSize: 22, lineHeight: 1.6, opacity: 0.9, whiteSpace: 'pre-wrap' }}>{data.body}</p>
    </div>
  );
}

function ListCard({ data }: { data: any }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 36, color: '#92fe9d', display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon(data.icon)}
        <span>{data.heading}</span>
      </h3>
      <ul style={{ margin: 0, paddingLeft: 24, fontSize: 22, lineHeight: 1.8 }}>
        {(data.items ?? []).map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ImageCard({ data }: { data: any }) {
  if (!data.src) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: 12, opacity: 0.6 }}>
        <span style={{ fontSize: 24 }}>🖼 点击右侧面板上传图片</span>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 8 }}>
        <img src={data.src} alt={data.alt ?? ''} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: data.fit ?? 'contain' }} />
      </div>
      {data.caption && <div style={{ textAlign: 'center', opacity: 0.7, fontSize: 18 }}>{data.caption}</div>}
    </div>
  );
}

function TimelineCard({ data }: { data: any }) {
  const items = data.items ?? [];
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 4, transform: 'translateX(-50%)', background: 'linear-gradient(to bottom, #00c9ff, #92fe9d)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', justifyContent: 'space-around' }}>
        {items.map((it: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
            <div style={{ flex: 1, padding: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#92fe9d', fontSize: 26 }}>{it.title}</h4>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, opacity: 0.85, whiteSpace: 'pre-wrap' }}>{it.body}</p>
            </div>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #00c9ff, #92fe9d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', flexShrink: 0 }}>
              {icon(it.icon) ?? <span>{i + 1}</span>}
            </div>
            <div style={{ flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourcesCard({ data }: { data: any }) {
  const items = data.items ?? [];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
      {items.map((it: any, i: number) => {
        const inner = (
          <div style={{ width: 240, padding: 24, background: 'rgba(255,255,255,0.08)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 36, color: '#00c9ff', marginBottom: 12 }}>{icon(it.icon) ?? <span>●</span>}</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 22 }}>{it.title}</h3>
            <p style={{ margin: 0, fontSize: 16, opacity: 0.7 }}>{it.desc}</p>
          </div>
        );
        return it.href ? (
          <a key={i} href={it.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            {inner}
          </a>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}
    </div>
  );
}

function DividerCard({ data }: { data: any }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ flex: 1, height: data.thickness ?? 2, background: data.color ?? 'rgba(255,255,255,0.4)' }} />
      {data.text && <span style={{ fontSize: 20, opacity: 0.7, letterSpacing: 2 }}>{data.text}</span>}
      {data.text && <div style={{ flex: 1, height: data.thickness ?? 2, background: data.color ?? 'rgba(255,255,255,0.4)' }} />}
    </div>
  );
}

export function CardRenderer({ card, theme }: { card: Card; theme: Theme }) {
  const style = cardStyle(card, theme);
  let inner: React.ReactNode;
  switch (card.type) {
    case 'title': inner = <TitleCard data={card.data} />; break;
    case 'text': inner = <TextCard data={card.data} />; break;
    case 'list': inner = <ListCard data={card.data} />; break;
    case 'image': inner = <ImageCard data={card.data} />; break;
    case 'timeline': inner = <TimelineCard data={card.data} />; break;
    case 'resources': inner = <ResourcesCard data={card.data} />; break;
    case 'divider': inner = <DividerCard data={card.data} />; break;
    default: inner = null;
  }
  return <div style={style}>{inner}</div>;
}

export function CardRendererInteractive({
  card,
  theme,
  selected,
  onSelect,
  registerRef,
}: {
  card: Card;
  theme: Theme;
  selected: boolean;
  onSelect: () => void;
  registerRef?: (el: HTMLElement | null) => void;
}) {
  const base = cardStyle(card, theme);
  const style: CSSProperties = {
    ...base,
    pointerEvents: 'auto',
    cursor: 'move',
    outline: selected ? '2px solid #00c9ff' : 'none',
    outlineOffset: 2,
    zIndex: selected ? 99999 : card.zIndex,
  };
  let inner: React.ReactNode;
  switch (card.type) {
    case 'title': inner = <TitleCard data={card.data} />; break;
    case 'text': inner = <TextCard data={card.data} />; break;
    case 'list': inner = <ListCard data={card.data} />; break;
    case 'image': inner = <ImageCard data={card.data} />; break;
    case 'timeline': inner = <TimelineCard data={card.data} />; break;
    case 'resources': inner = <ResourcesCard data={card.data} />; break;
    case 'divider': inner = <DividerCard data={card.data} />; break;
    default: inner = null;
  }
  return (
    <div
      ref={(el) => registerRef?.(el)}
      data-card-id={card.id}
      style={style}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>{inner}</div>
    </div>
  );
}