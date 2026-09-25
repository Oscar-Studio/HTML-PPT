import type { Theme } from '../types';

export const THEMES: Record<string, Theme> = {
  'classic-blue': {
    id: 'classic-blue',
    name: '经典蓝',
    colors: {
      background: 'linear-gradient(135deg, #1a2a6c, #2c3e50, #4a235a)',
      surface: 'rgba(255,255,255,0.08)',
      primary: '#00c9ff',
      secondary: '#92fe9d',
      accent: '#ff7eb6',
      text: '#ffffff',
      muted: 'rgba(255,255,255,0.7)',
    },
    fonts: {
      title: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      body: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    cardDefaults: {
      borderRadius: 15,
      padding: 30,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  },
};

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES['classic-blue'];
}