import { useEffect, useState } from 'react';

const REF_W = 1920;
const REF_H = 1080;

export function useStageScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const sx = window.innerWidth / REF_W;
      const sy = window.innerHeight / REF_H;
      setScale(Math.min(sx, sy, 1.5));
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}