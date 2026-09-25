import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../store/editor';

export function EditorTopBar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const presentation = useEditor((s) => s.presentation);
  const setTitle = useEditor((s) => s.setTitle);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const past = useEditor((s) => s.history.past);
  const future = useEditor((s) => s.history.future);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (meta && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return (
    <header
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        background: 'rgba(15,15,25,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7 }}>← 我的作品</Link>
      <input
        value={presentation.title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 15, width: 260 }}
      />
      <div style={{ flex: 1 }} />
      <button onClick={undo} disabled={past.length === 0} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: past.length ? 'pointer' : 'not-allowed', opacity: past.length ? 1 : 0.4 }}>
        ↶ 撤销
      </button>
      <button onClick={redo} disabled={future.length === 0} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: future.length ? 'pointer' : 'not-allowed', opacity: future.length ? 1 : 0.4 }}>
        ↷ 重做
      </button>
      <button
        onClick={() => navigate(`/preview/${id}`)}
        style={{ background: 'rgba(0,201,255,0.3)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
      >
        ▶ 预览
      </button>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('oscar-ppt:export', { detail: 'json' }))}
        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
      >
        JSON
      </button>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('oscar-ppt:export', { detail: 'html' }))}
        style={{ background: 'rgba(146,254,157,0.3)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
      >
        ⬇ HTML
      </button>
      <div id="userButtonContainer" />
    </header>
  );
}