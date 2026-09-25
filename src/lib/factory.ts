import type { CardType, Card, CardData, Slide, Presentation } from '../types';
import { nanoid } from 'nanoid';

export const SLIDE_W = 1920;
export const SLIDE_H = 1080;

export const SCHEMA_VERSION = 1;

export const newId = (prefix = 'c') => `${prefix}_${nanoid(8)}`;

export const now = () => Date.now();

export function createSlide(overrides: Partial<Slide> = {}): Slide {
  return {
    id: newId('s'),
    order: 0,
    cards: [],
    ...overrides,
  };
}

export function defaultCardData(type: CardType): CardData {
  switch (type) {
    case 'title':
      return { eyebrow: '副标题', title: '主标题', subtitle: '在这里描述本页内容', align: 'center' };
    case 'text':
      return { icon: 'star', heading: '卡片标题', body: '点击右侧属性面板编辑内容。' };
    case 'list':
      return { icon: 'check', heading: '要点列表', items: ['第一点', '第二点', '第三点'] };
    case 'image':
      return { src: '', alt: '图片', fit: 'contain', caption: '' };
    case 'timeline':
      return {
        items: [
          { icon: 'rocket', title: '起点', body: '起点说明。' },
          { icon: 'chart-line', title: '发展', body: '过程说明。' },
          { icon: 'trophy', title: '成果', body: '结果说明。' },
        ],
      };
    case 'resources':
      return {
        items: [
          { icon: 'book', title: '文档', desc: '查看详细文档', href: 'https://example.com' },
          { icon: 'laptop', title: '在线工具', desc: '使用在线工具', href: 'https://example.com' },
        ],
      };
    case 'divider':
      return { text: '分节', thickness: 2, color: 'rgba(255,255,255,0.4)' };
  }
}

export function defaultCardStyle(type: CardType) {
  switch (type) {
    case 'title':
      return {
        textAlign: 'center' as const,
        color: '#ffffff',
      };
    case 'divider':
      return {};
    default:
      return {
        color: '#ffffff',
        borderRadius: 16,
        padding: 24,
        background: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      };
  }
}

export function createCard(type: CardType, partial: Partial<Card> = {}): Card {
  const defaults: Record<CardType, { x: number; y: number; w: number; h: number }> = {
    title: { x: 120, y: 360, w: 1680, h: 360 },
    text: { x: 200, y: 280, w: 600, h: 320 },
    list: { x: 200, y: 280, w: 600, h: 380 },
    image: { x: 360, y: 220, w: 1200, h: 640 },
    timeline: { x: 160, y: 220, w: 1600, h: 640 },
    resources: { x: 160, y: 220, w: 1600, h: 480 },
    divider: { x: 360, y: 520, w: 1200, h: 40 },
  };
  const d = defaults[type];
  const base: Card = {
    id: newId(),
    type,
    x: d.x,
    y: d.y,
    w: d.w,
    h: d.h,
    zIndex: 1,
    rotate: 0,
    style: defaultCardStyle(type),
    data: defaultCardData(type),
  };
  return { ...base, ...partial, id: base.id };
}

export function createPresentation(title = '未命名作品', themeId = 'classic-blue'): Presentation {
  const slide = createSlide();
  slide.cards = [
    createCard('title', { zIndex: 1 }),
  ];
  return {
    id: newId('p'),
    title,
    themeId,
    width: SLIDE_W,
    height: SLIDE_H,
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1a2a6c, #2c3e50, #4a235a)' },
    slides: [slide],
    createdAt: now(),
    updatedAt: now(),
    schemaVersion: SCHEMA_VERSION,
  };
}

export const DEFAULT_BACKGROUNDS: { name: string; value: string; type: 'solid' | 'gradient' }[] = [
  { name: '深海蓝紫', type: 'gradient', value: 'linear-gradient(135deg, #1a2a6c, #2c3e50, #4a235a)' },
  { name: '极光', type: 'gradient', value: 'linear-gradient(135deg, #00c9ff, #92fe9d)' },
  { name: '日落', type: 'gradient', value: 'linear-gradient(135deg, #ff6e7f, #bfe9ff)' },
  { name: '森林', type: 'gradient', value: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { name: '暗夜', type: 'gradient', value: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { name: '纯黑', type: 'solid', value: '#000000' },
  { name: '深灰', type: 'solid', value: '#1a1a1a' },
  { name: '米白', type: 'solid', value: '#f8f4ec' },
];

export function clonePresentation(p: Presentation, newTitle?: string): Presentation {
  const cloned: Presentation = JSON.parse(JSON.stringify(p));
  cloned.id = newId('p');
  cloned.title = newTitle ?? `${p.title} 副本`;
  cloned.createdAt = now();
  cloned.updatedAt = now();
  cloned.slides.forEach((s) => {
    s.id = newId('s');
    s.cards.forEach((c) => {
      c.id = newId();
    });
  });
  return cloned;
}

export function reorderSlides(slides: Slide[], from: number, to: number): Slide[] {
  const next = slides.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((s, i) => ({ ...s, order: i }));
}

export function ensureDefaults(p: Presentation): Presentation {
  const fallbackBg = { type: 'gradient' as const, value: 'linear-gradient(135deg, #1a2a6c, #2c3e50, #4a235a)' };
  return {
    ...p,
    width: p.width || SLIDE_W,
    height: p.height || SLIDE_H,
    schemaVersion: SCHEMA_VERSION,
    background: p.background ?? fallbackBg,
    slides: p.slides.map((s) => {
      const { background: _legacy, ...rest } = s as Slide & { background?: unknown };
      return rest;
    }),
  };
}