import { create } from 'zustand';
import { produce } from 'immer';
import type { Card, CardData, CardType, Presentation, Slide, SlideBackground } from '../types';
import {
  createCard,
  createSlide,
  ensureDefaults,
  newId,
  reorderSlides,
  now,
} from '../lib/factory';

interface HistoryState {
  past: { label: string; inverse: unknown[] }[];
  future: { label: string; inverse: unknown[] }[];
}

interface EditorState {
  presentation: Presentation;
  selectedCardId: string | null;
  currentSlideId: string;
  history: HistoryState;
  hydrate: (p: Presentation) => void;
  setTitle: (title: string) => void;
  setTheme: (themeId: string) => void;
  addSlide: () => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  reorderSlides: (from: number, to: number) => void;
  setCurrentSlide: (id: string) => void;
  setPresentationBackground: (bg: SlideBackground) => void;
  addCard: (type: CardType, slideId?: string) => void;
  deleteCard: (cardId: string) => void;
  duplicateCard: (cardId: string) => void;
  bringForward: (cardId: string) => void;
  sendBackward: (cardId: string) => void;
  updateCard: (cardId: string, patch: Partial<Card>) => void;
  updateCardData: (cardId: string, patch: Partial<CardData>) => void;
  updateCardStyle: (cardId: string, patch: Partial<NonNullable<Card['style']>>) => void;
  selectCard: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  getCurrentSlide: () => Slide;
}

const HISTORY_LIMIT = 50;

function touch(p: Presentation) {
  p.updatedAt = now();
}

function findCard(p: Presentation, cardId: string): { slide: Slide; card: Card } | null {
  for (const s of p.slides) {
    const c = s.cards.find((c) => c.id === cardId);
    if (c) return { slide: s, card: c };
  }
  return null;
}

function pushEntry(state: EditorState, label: string, inverse: unknown[]): HistoryState {
  const past = [...state.history.past, { label, inverse }];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { past, future: [] };
}

export const useEditor = create<EditorState>((set, get) => ({
  presentation: ensureDefaults({
    id: newId('p'),
    title: '未命名作品',
    themeId: 'classic-blue',
    width: 1920,
    height: 1080,
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1a2a6c, #2c3e50, #4a235a)' },
    slides: [createSlide({ cards: [createCard('title')] })],
    createdAt: now(),
    updatedAt: now(),
    schemaVersion: 1,
  }),
  selectedCardId: null,
  currentSlideId: '',
  history: { past: [], future: [] },

  hydrate: (p) =>
    set(() => ({
      presentation: ensureDefaults(p),
      currentSlideId: p.slides[0]?.id ?? '',
      selectedCardId: null,
      history: { past: [], future: [] },
    })),

  setTitle: (title) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        draft.title = title;
        touch(draft);
      }),
      history: pushEntry(state, 'rename', []),
    })),

  setTheme: (themeId) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        draft.themeId = themeId;
        touch(draft);
      }),
    })),

  addSlide: () =>
    set((state) => {
      const newSlide = createSlide();
      const presentation = produce(state.presentation, (draft) => {
        draft.slides.push(newSlide);
        draft.slides.forEach((s, i) => (s.order = i));
        touch(draft);
      });
      return {
        presentation,
        currentSlideId: newSlide.id,
        selectedCardId: null,
        history: pushEntry(state, 'add-slide', []),
      };
    }),

  deleteSlide: (id) =>
    set((state) => {
      if (state.presentation.slides.length <= 1) return state;
      const presentation = produce(state.presentation, (draft) => {
        draft.slides = draft.slides.filter((s) => s.id !== id);
        draft.slides.forEach((s, i) => (s.order = i));
        touch(draft);
      });
      const currentSlideId =
        state.currentSlideId === id ? presentation.slides[0].id : state.currentSlideId;
      return {
        presentation,
        currentSlideId,
        selectedCardId: null,
        history: pushEntry(state, 'delete-slide', []),
      };
    }),

  duplicateSlide: (id) =>
    set((state) => {
      const src = state.presentation.slides.find((s) => s.id === id);
      if (!src) return state;
      const cloned: Slide = JSON.parse(JSON.stringify(src));
      cloned.id = newId('s');
      cloned.cards.forEach((c) => (c.id = newId()));
      const presentation = produce(state.presentation, (draft) => {
        const idx = draft.slides.findIndex((s) => s.id === id);
        cloned.order = idx + 1;
        draft.slides.splice(idx + 1, 0, cloned);
        draft.slides.forEach((s, i) => (s.order = i));
        touch(draft);
      });
      return {
        presentation,
        currentSlideId: cloned.id,
        history: pushEntry(state, 'duplicate-slide', []),
      };
    }),

  reorderSlides: (from, to) =>
    set((state) => {
      const presentation = produce(state.presentation, (draft) => {
        draft.slides = reorderSlides(draft.slides, from, to);
        touch(draft);
      });
      return {
        presentation,
        history: pushEntry(state, 'reorder-slides', []),
      };
    }),

  setCurrentSlide: (id) =>
    set(() => ({
      currentSlideId: id,
      selectedCardId: null,
    })),

  setSlideBackground: (id: string, bg: SlideBackground) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        const s = draft.slides.find((s) => s.id === id);
        if (s) {
          // legacy per-slide bg removed; use setPresentationBackground instead
          touch(draft);
        }
      }),
    })),

  setPresentationBackground: (bg) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        draft.background = bg;
        touch(draft);
      }),
      history: pushEntry(state, 'set-pres-bg', []),
    })),

  addCard: (type, slideId) =>
    set((state) => {
      const targetSlideId = slideId ?? state.currentSlideId ?? state.presentation.slides[0].id;
      const presentation = produce(state.presentation, (draft) => {
        const slide = draft.slides.find((s) => s.id === targetSlideId);
        if (!slide) return;
        const maxZ = slide.cards.reduce((m, c) => Math.max(m, c.zIndex), 0);
        const total = slide.cards.length;
        const offset = total * 40;
        const card = createCard(type, { zIndex: maxZ + 1, x: 200 + offset, y: 220 + offset });
        slide.cards.push(card);
        touch(draft);
      });
      const newCardId = presentation.slides.find((s) => s.id === targetSlideId)!.cards.at(-1)!.id;
      return {
        presentation,
        currentSlideId: targetSlideId,
        selectedCardId: newCardId,
        history: pushEntry(state, `add-card:${type}`, []),
      };
    }),

  deleteCard: (cardId) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        for (const s of draft.slides) {
          s.cards = s.cards.filter((c) => c.id !== cardId);
        }
        touch(draft);
      }),
      selectedCardId: state.selectedCardId === cardId ? null : state.selectedCardId,
      history: pushEntry(state, 'delete-card', []),
    })),

  duplicateCard: (cardId) =>
    set((state) => {
      let newIdForCloned = cardId;
      const presentation = produce(state.presentation, (draft) => {
        for (const s of draft.slides) {
          const idx = s.cards.findIndex((c) => c.id === cardId);
          if (idx !== -1) {
            const clone: Card = JSON.parse(JSON.stringify(s.cards[idx]));
            clone.id = newId();
            newIdForCloned = clone.id;
            clone.x += 40;
            clone.y += 40;
            clone.zIndex = s.cards.reduce((m, c) => Math.max(m, c.zIndex), 0) + 1;
            s.cards.splice(idx + 1, 0, clone);
            touch(draft);
            return;
          }
        }
      });
      return {
        presentation,
        selectedCardId: newIdForCloned,
        history: pushEntry(state, 'duplicate-card', []),
      };
    }),

  bringForward: (cardId) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        for (const s of draft.slides) {
          const card = s.cards.find((c) => c.id === cardId);
          if (card) {
            const maxZ = s.cards.reduce((m, c) => Math.max(m, c.zIndex), 0);
            card.zIndex = maxZ + 1;
            touch(draft);
            return;
          }
        }
      }),
    })),

  sendBackward: (cardId) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        for (const s of draft.slides) {
          const card = s.cards.find((c) => c.id === cardId);
          if (card) {
            const minZ = s.cards.reduce((m, c) => Math.min(m, c.zIndex), Infinity);
            card.zIndex = minZ - 1;
            touch(draft);
            return;
          }
        }
      }),
    })),

  updateCard: (cardId, patch) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        const found = findCard(draft, cardId);
        if (found) {
          Object.assign(found.card, patch);
          touch(draft);
        }
      }),
    })),

  updateCardData: (cardId, patch) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        const found = findCard(draft, cardId);
        if (found) {
          Object.assign(found.card.data, patch);
          touch(draft);
        }
      }),
    })),

  updateCardStyle: (cardId, patch) =>
    set((state) => ({
      presentation: produce(state.presentation, (draft) => {
        const found = findCard(draft, cardId);
        if (found) {
          found.card.style = { ...(found.card.style ?? {}), ...patch };
          touch(draft);
        }
      }),
    })),

  selectCard: (id) => set(() => ({ selectedCardId: id })),

  undo: () =>
    set((state) => {
      const past = state.history.past.slice();
      const entry = past.pop();
      if (!entry) return state;
      const future = [entry, ...state.history.future];
      return { history: { past, future } };
    }),

  redo: () =>
    set((state) => {
      const future = state.history.future.slice();
      const entry = future.shift();
      if (!entry) return state;
      const past = [...state.history.past, entry];
      return { history: { past, future } };
    }),

  getCurrentSlide: () => {
    const state = get();
    return (
      state.presentation.slides.find((s) => s.id === state.currentSlideId) ??
      state.presentation.slides[0]
    );
  },
}));