import type { Card, CardData, CardType, SlideBackground } from '../types';
import { useEditor } from '../store/editor';
import { DEFAULT_BACKGROUNDS } from '../lib/factory';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, opacity: 0.9 }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, multiline }: { value: string; onChange: (v: string) => void; multiline?: boolean }) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: 8, borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: 8, borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
    />
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={Math.round(value)}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: 8, borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value?.startsWith('#') ? value : '#ffffff'}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 48, height: 32, background: 'transparent', border: 'none' }}
    />
  );
}

function ListEditor({ items, onChange }: { items: string[]; onChange: (next: string[]) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={it}
            onChange={(e) => {
              const next = items.slice();
              next[i] = e.target.value;
              onChange(next);
            }}
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: 6, borderRadius: 6, fontSize: 14 }}
          />
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            style={{ background: 'rgba(255,0,0,0.3)', border: 'none', color: '#fff', padding: '0 10px', borderRadius: 6, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, '新条目'])}
        style={{ background: 'rgba(0,201,255,0.2)', border: '1px dashed rgba(0,201,255,0.6)', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
      >
        + 添加条目
      </button>
    </div>
  );
}

function FileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CardDataPanel({ card }: { card: Card }) {
  const update = useEditor((s) => s.updateCardData);
  const updateStyle = useEditor((s) => s.updateCardStyle);
  const updateCard = useEditor((s) => s.updateCard);
  const d = card.data as any;
  const s = card.style ?? {};

  function patch(p: Partial<CardData>) {
    update(card.id, p);
  }
  function patchStyle(p: Partial<NonNullable<Card['style']>>) {
    updateStyle(card.id, p);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Row label="X">
        <NumberInput value={card.x} min={0} onChange={(v) => updateCard(card.id, { x: v })} />
      </Row>
      <Row label="Y">
        <NumberInput value={card.y} min={0} onChange={(v) => updateCard(card.id, { y: v })} />
      </Row>
      <Row label="宽">
        <NumberInput value={card.w} min={60} onChange={(v) => updateCard(card.id, { w: v })} />
      </Row>
      <Row label="高">
        <NumberInput value={card.h} min={40} onChange={(v) => updateCard(card.id, { h: v })} />
      </Row>
      <Row label="旋转 (°)">
        <NumberInput value={card.rotate ?? 0} min={-180} max={180} onChange={(v) => updateCard(card.id, { rotate: v })} />
      </Row>

      {card.type === 'title' && (
        <>
          <Row label="小标题">
            <TextInput value={d.eyebrow ?? ''} onChange={(v) => patch({ eyebrow: v })} />
          </Row>
          <Row label="主标题">
            <TextInput value={d.title} onChange={(v) => patch({ title: v })} />
          </Row>
          <Row label="副标题">
            <TextInput value={d.subtitle ?? ''} multiline onChange={(v) => patch({ subtitle: v })} />
          </Row>
        </>
      )}

      {card.type === 'text' && (
        <>
          <Row label="图标">
            <TextInput value={d.icon ?? ''} onChange={(v) => patch({ icon: v })} />
          </Row>
          <Row label="标题">
            <TextInput value={d.heading} onChange={(v) => patch({ heading: v })} />
          </Row>
          <Row label="正文">
            <TextInput value={d.body ?? ''} multiline onChange={(v) => patch({ body: v })} />
          </Row>
        </>
      )}

      {card.type === 'list' && (
        <>
          <Row label="图标">
            <TextInput value={d.icon ?? ''} onChange={(v) => patch({ icon: v })} />
          </Row>
          <Row label="标题">
            <TextInput value={d.heading} onChange={(v) => patch({ heading: v })} />
          </Row>
          <Row label="条目">
            <ListEditor items={d.items ?? []} onChange={(items) => patch({ items })} />
          </Row>
        </>
      )}

      {card.type === 'image' && (
        <>
          <Row label="上传图片">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await FileToDataURL(file);
                patch({ src: url });
              }}
              style={{ color: '#fff' }}
            />
          </Row>
          <Row label="替代文本">
            <TextInput value={d.alt ?? ''} onChange={(v) => patch({ alt: v })} />
          </Row>
          <Row label="说明">
            <TextInput value={d.caption ?? ''} onChange={(v) => patch({ caption: v })} />
          </Row>
          <Row label="填充">
            <select
              value={d.fit ?? 'contain'}
              onChange={(e) => patch({ fit: e.target.value as any })}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: 8, borderRadius: 6 }}
            >
              <option value="contain">contain</option>
              <option value="cover">cover</option>
              <option value="fill">fill</option>
            </select>
          </Row>
        </>
      )}

      {card.type === 'timeline' && (
        <Row label="时间线条目">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(d.items ?? []).map((it: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input value={it.icon ?? ''} placeholder="图标" onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], icon: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <input value={it.title} placeholder="标题" onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], title: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <textarea value={it.body} placeholder="描述" rows={2} onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], body: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <button onClick={() => {
                  const items = (d.items ?? []).filter((_: any, idx: number) => idx !== i);
                  patch({ items } as any);
                }} style={{ background: 'rgba(255,0,0,0.3)', border: 'none', color: '#fff', padding: 4, borderRadius: 4, cursor: 'pointer' }}>删除</button>
              </div>
            ))}
            <button onClick={() => {
              const items = [...(d.items ?? []), { title: '新节点', body: '描述' }];
              patch({ items } as any);
            }} style={{ background: 'rgba(0,201,255,0.2)', border: '1px dashed rgba(0,201,255,0.6)', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer' }}>+ 添加节点</button>
          </div>
        </Row>
      )}

      {card.type === 'resources' && (
        <Row label="资源条目">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(d.items ?? []).map((it: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input value={it.icon ?? ''} placeholder="图标" onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], icon: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <input value={it.title} placeholder="标题" onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], title: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <input value={it.desc ?? ''} placeholder="描述" onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], desc: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <input value={it.href ?? ''} placeholder="链接" onChange={(e) => {
                  const items = (d.items ?? []).slice();
                  items[i] = { ...items[i], href: e.target.value };
                  patch({ items } as any);
                }} style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: 4, borderRadius: 4 }} />
                <button onClick={() => {
                  const items = (d.items ?? []).filter((_: any, idx: number) => idx !== i);
                  patch({ items } as any);
                }} style={{ background: 'rgba(255,0,0,0.3)', border: 'none', color: '#fff', padding: 4, borderRadius: 4, cursor: 'pointer' }}>删除</button>
              </div>
            ))}
            <button onClick={() => {
              const items = [...(d.items ?? []), { title: '新资源', desc: '描述', href: '' }];
              patch({ items } as any);
            }} style={{ background: 'rgba(0,201,255,0.2)', border: '1px dashed rgba(0,201,255,0.6)', color: '#fff', padding: 6, borderRadius: 6, cursor: 'pointer' }}>+ 添加资源</button>
          </div>
        </Row>
      )}

      {card.type === 'divider' && (
        <>
          <Row label="文字">
            <TextInput value={d.text ?? ''} onChange={(v) => patch({ text: v })} />
          </Row>
          <Row label="粗细">
            <NumberInput value={d.thickness ?? 2} min={1} onChange={(v) => patch({ thickness: v })} />
          </Row>
          <Row label="颜色">
            <ColorInput value={d.color ?? '#ffffff'} onChange={(v) => patch({ color: v })} />
          </Row>
        </>
      )}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 6 }}>
        <Row label="文字颜色">
          <ColorInput value={s.color ?? '#ffffff'} onChange={(v) => patchStyle({ color: v })} />
        </Row>
        <Row label="背景">
          <TextInput value={s.background ?? ''} onChange={(v) => patchStyle({ background: v })} />
        </Row>
        <Row label="字号">
          <NumberInput value={s.fontSize ?? 24} min={8} onChange={(v) => patchStyle({ fontSize: v })} />
        </Row>
        <Row label="圆角">
          <NumberInput value={s.borderRadius ?? 0} min={0} onChange={(v) => patchStyle({ borderRadius: v })} />
        </Row>
        <Row label="透明度">
          <NumberInput value={s.opacity ?? 1} min={0} max={1} onChange={(v) => patchStyle({ opacity: v })} />
        </Row>
      </div>
    </div>
  );
}

export function InspectorPanel() {
  const cardId = useEditor((s) => s.selectedCardId);
  const slideId = useEditor((s) => s.currentSlideId);
  const presentation = useEditor((s) => s.presentation);
  const setPresentationBg = useEditor((s) => s.setPresentationBackground);
  const deleteCard = useEditor((s) => s.deleteCard);
  const duplicateCard = useEditor((s) => s.duplicateCard);

  const slide = presentation.slides.find((s) => s.id === slideId);
  const card = slide?.cards.find((c) => c.id === cardId) ?? null;
  const bg = presentation.background;

  return (
    <aside
      style={{
        width: 320,
        background: 'rgba(20,20,30,0.85)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        padding: 16,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {!card && (
        <BackgroundPanel bg={bg} onChange={setPresentationBg} />
      )}

      {card && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{card.type}</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => duplicateCard(card.id)} style={{ background: 'rgba(0,201,255,0.25)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>复制</button>
              <button onClick={() => deleteCard(card.id)} style={{ background: 'rgba(255,80,80,0.4)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>删除</button>
            </div>
          </div>
          <CardDataPanel card={card} />
        </div>
      )}
    </aside>
  );
}

function BackgroundPanel({ bg, onChange }: { bg: SlideBackground; onChange: (b: SlideBackground) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>作品背景</h3>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>整份作品共用同一背景，预览与导出均使用。</div>
      <Row label="预设">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {DEFAULT_BACKGROUNDS.map((b) => (
            <button
              key={b.name}
              title={b.name}
              onClick={() => onChange({ type: b.type, value: b.value })}
              style={{
                height: 48,
                borderRadius: 6,
                border: bg.value === b.value ? '2px solid #00c9ff' : '1px solid rgba(255,255,255,0.15)',
                background: b.value,
                cursor: 'pointer',
                color: '#fff',
                fontSize: 11,
                textShadow: '0 1px 2px rgba(0,0,0,0.7)',
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </Row>
      <Row label={`类型 · ${bg.type}`}>
        <select
          value={bg.type}
          onChange={(e) => onChange({ type: e.target.value as 'solid' | 'gradient', value: bg.value })}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: 8, borderRadius: 6 }}
        >
          <option value="gradient">gradient</option>
          <option value="solid">solid</option>
        </select>
      </Row>
      <Row label="自定义 CSS 值">
        <TextInput
          value={bg.value}
          onChange={(v) => onChange({ type: bg.type, value: v })}
          multiline
        />
      </Row>
    </div>
  );
}