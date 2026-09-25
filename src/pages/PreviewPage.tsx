import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../store/editor';
import { loadProject } from '../lib/storage';
import { ScrollPreviewDeck } from '../components/ScrollPreviewDeck';
import { Presentation } from '../types';

export function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const presentation = useEditor((s) => s.presentation);
  const hydrate = useEditor((s) => s.hydrate);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancel = false;
    (async () => {
      const p = await loadProject(id);
      if (cancel) return;
      if (!p) {
        navigate('/');
        return;
      }
      hydrate(p);
    })();
    return () => { cancel = true; };
  }, [id, hydrate, navigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const total = presentation.slides.length;
      if (!total) return;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, total - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Home') {
        setIndex(0);
      } else if (e.key === 'End') {
        setIndex(total - 1);
      } else if (e.key === 'Escape') {
        navigate(`/editor/${id}`);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presentation.slides.length, navigate, id]);

  useEffect(() => {
    if (index >= presentation.slides.length) setIndex(Math.max(0, presentation.slides.length - 1));
  }, [presentation.slides.length, index]);

  if (!presentation.slides.length) return null;
  const deck: Presentation = presentation;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Link
        to={`/editor/${id}`}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 50,
          color: '#fff',
          textDecoration: 'none',
          background: 'rgba(0,0,0,0.45)',
          padding: '6px 12px',
          borderRadius: 8,
          backdropFilter: 'blur(6px)',
        }}
      >
        ✕ 退出
      </Link>
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 50,
          display: 'flex',
          gap: 6,
          background: 'rgba(0,0,0,0.45)',
          padding: 4,
          borderRadius: 10,
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            cursor: index === 0 ? 'not-allowed' : 'pointer',
            opacity: index === 0 ? 0.4 : 1,
          }}
        >
          ‹
        </button>
        <span style={{ color: '#fff', padding: '4px 8px', fontSize: 13, alignSelf: 'center' }}>
          {index + 1} / {presentation.slides.length}
        </span>
        <button
          onClick={() => setIndex((i) => Math.min(presentation.slides.length - 1, i + 1))}
          disabled={index >= presentation.slides.length - 1}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            cursor: index >= presentation.slides.length - 1 ? 'not-allowed' : 'pointer',
            opacity: index >= presentation.slides.length - 1 ? 0.4 : 1,
          }}
        >
          ›
        </button>
      </div>
      <ScrollPreviewDeck presentation={deck} currentIndex={index} onChangeIndex={setIndex} />
    </div>
  );
}