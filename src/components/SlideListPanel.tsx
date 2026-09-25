import { useEditor } from '../store/editor';
import { SlideThumb } from './SlideThumb';
import type { CardType } from '../types';

const CARD_TYPES: { type: CardType; label: string }[] = [
  { type: 'title', label: '标题' },
  { type: 'text', label: '文字' },
  { type: 'list', label: '列表' },
  { type: 'image', label: '图片' },
  { type: 'timeline', label: '时间线' },
  { type: 'resources', label: '资源' },
  { type: 'divider', label: '分割线' },
];

export function SlideListPanel() {
  const presentation = useEditor((s) => s.presentation);
  const currentSlideId = useEditor((s) => s.currentSlideId);
  const setCurrentSlide = useEditor((s) => s.setCurrentSlide);
  const addSlide = useEditor((s) => s.addSlide);
  const deleteSlide = useEditor((s) => s.deleteSlide);
  const duplicateSlide = useEditor((s) => s.duplicateSlide);
  const addCard = useEditor((s) => s.addCard);

  return (
    <aside
      style={{
        width: 200,
        background: 'rgba(20,20,30,0.85)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        padding: 12,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => addSlide()}
        style={{ background: 'rgba(0,201,255,0.3)', color: '#fff', border: 'none', padding: 8, borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
      >
        + 新建页面
      </button>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>插入卡片</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {CARD_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => addCard(t.type)}
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 4px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
        {presentation.slides.map((slide, i) => (
          <div
            key={slide.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: 6,
              borderRadius: 6,
              background: slide.id === currentSlideId ? 'rgba(0,201,255,0.2)' : 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => setCurrentSlide(slide.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, opacity: 0.85 }}>
              <span>第 {i + 1} 页</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
                  title="复制"
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >⎘</button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (presentation.slides.length > 1) deleteSlide(slide.id); }}
                  title="删除"
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                >×</button>
              </div>
            </div>
            <SlideThumb presentation={presentation} slideId={slide.id} />
          </div>
        ))}
      </div>
    </aside>
  );
}