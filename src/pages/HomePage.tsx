import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';
import { listProjects, deleteProject, loadProject, saveProject } from '../lib/storage';
import { clonePresentation, createPresentation } from '../lib/factory';
import type { ProjectMeta } from '../types';

function fmtDate(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function HomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileTip, setShowMobileTip] = useState(false);

  // 把 user-button.js 生成的 "登录/注册" 按钮改名为 "登录"
  useEffect(() => {
    const shorten = () => {
      const btn = document.querySelector<HTMLAnchorElement>('.login-register-btn');
      if (btn && btn.textContent && btn.textContent.includes('注册')) {
        btn.textContent = '登录';
      }
    };
    shorten();
    const observer = new MutationObserver(shorten);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // 移动端给编辑器入口加提示（非阻断）
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches) {
      setShowMobileTip(true);
    }
  }, []);

  async function refresh() {
    setLoading(true);
    const list = await listProjects();
    setProjects(list);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleNew() {
    const p = createPresentation();
    await saveProject(p);
    navigate(`/editor/${p.id}`);
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.slides)) throw new Error('invalid');
        parsed.id = undefined;
        parsed.createdAt = Date.now();
        parsed.updatedAt = Date.now();
        await saveProject(parsed);
        await refresh();
      } catch (e) {
        alert('导入失败：文件格式不正确');
      }
    };
    input.click();
  }

  async function handleDelete(id: string) {
    if (!confirm('确认删除该作品？此操作不可恢复。')) return;
    await deleteProject(id);
    refresh();
  }

  async function handleDuplicate(id: string) {
    const src = await loadProject(id);
    if (!src) return;
    const copy = clonePresentation(src);
    await saveProject(copy);
    refresh();
  }

  return (
    <div className="ppt-home">
      <header className="ppt-home-header">
        <Link to="https://oscarstudio.cn" className="ppt-home-brand">Oscar Studio</Link>
        <span className="ppt-home-sep">›</span>
        <h1 className="ppt-home-title">HTML PPT 编辑器</h1>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
        <div id="userButtonContainer" />
      </header>

      <main className="ppt-home-main">
        {showMobileTip && (
          <div className="ppt-mobile-tip" role="status">
            💡 建议在桌面端打开编辑器以获得完整体验
          </div>
        )}

        <div className="ppt-home-actions">
          <button onClick={handleNew} className="ppt-btn ppt-btn-primary">
            ＋ 新建作品
          </button>
          <button onClick={handleImport} className="ppt-btn ppt-btn-ghost">
            ⬆ 导入 JSON
          </button>
        </div>

        {loading ? (
          <p className="ppt-loading">加载中…</p>
        ) : projects.length === 0 ? (
          <div className="ppt-empty">
            <p style={{ margin: 0, fontSize: 18 }}>还没有作品</p>
            <p style={{ marginTop: 8, fontSize: 14 }}>点击"新建作品"开始你的第一个 HTML PPT。</p>
          </div>
        ) : (
          <div className="ppt-project-grid">
            {projects.map((p) => (
              <div key={p.id} className="ppt-project-card">
                <h3 className="ppt-project-title">{p.title}</h3>
                <div className="ppt-project-meta">
                  {p.slideCount} 页 · 更新于 {fmtDate(p.updatedAt)}
                </div>
                <div className="ppt-project-actions">
                  <button onClick={() => navigate(`/editor/${p.id}`)} className="ppt-btn ppt-btn-sm ppt-btn-edit">编辑</button>
                  <button onClick={() => navigate(`/preview/${p.id}`)} className="ppt-btn ppt-btn-sm ppt-btn-preview">预览</button>
                  <button onClick={() => handleDuplicate(p.id)} className="ppt-btn ppt-btn-sm ppt-btn-dup">复制</button>
                  <button onClick={() => handleDelete(p.id)} className="ppt-btn ppt-btn-sm ppt-btn-del">删除</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="ppt-home-footer">
          Oscar Studio · HTML PPT 编辑器 v2
        </footer>
      </main>
    </div>
  );
}
