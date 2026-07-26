import { useEffect, useState } from 'react';

export type Quality = 'low' | 'normal';

const STORAGE_KEY = 'oscar-quality';

export function useQualitySetting(initial: Quality = 'normal') {
  const [quality, setQuality] = useState<Quality>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'low' || v === 'normal') return v;
    } catch {}
    return initial;
  });

  useEffect(() => {
    const body = document.body;
    body.classList.toggle('low-quality', quality === 'low');
    body.classList.toggle('quality-low', quality === 'low');
    try {
      localStorage.setItem(STORAGE_KEY, quality);
    } catch {}
  }, [quality]);

  return { quality, setQuality };
}