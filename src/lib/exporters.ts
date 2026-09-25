import type { Presentation, Card } from '../types';
import { SCHEMA_VERSION } from './factory';

export function exportProjectJson(p: Presentation) {
  const blob = new Blob([JSON.stringify({ ...p, schemaVersion: SCHEMA_VERSION }, null, 2)], { type: 'application/json' });
  download(blob, `${safeName(p.title)}.ppt.json`);
}

function escapeHtml(s: string) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function iconHtml(icon?: string) {
  if (!icon) return '';
  const cls = icon.replace(/[^a-z0-9-]/gi, '');
  return `<i class="fa-solid fa-${cls}" aria-hidden="true"></i>`;
}

function renderCardInner(card: Card, d: any): string {
  switch (card.type) {
    case 'title':
      return `<div class="title-card">
        ${d.eyebrow ? `<div class="eyebrow">${escapeHtml(d.eyebrow)}</div>` : ''}
        <h1 class="title-main">${escapeHtml(d.title)}</h1>
        ${d.subtitle ? `<p class="title-sub">${escapeHtml(d.subtitle)}</p>` : ''}
      </div>`;
    case 'text':
      return `<div class="card-block">
        <h3 class="card-heading">${iconHtml(d.icon)}<span>${escapeHtml(d.heading)}</span></h3>
        <p class="card-body">${escapeHtml(d.body ?? '')}</p>
      </div>`;
    case 'list':
      return `<div class="card-block">
        <h3 class="card-heading">${iconHtml(d.icon)}<span>${escapeHtml(d.heading)}</span></h3>
        <ul class="card-list">${(d.items ?? []).map((i: string) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      </div>`;
    case 'image':
      if (!d.src) return `<div class="image-empty">🖼 无图片</div>`;
      return `<figure class="card-figure">
        <img src="${escapeHtml(d.src)}" alt="${escapeHtml(d.alt ?? '')}" style="object-fit:${d.fit ?? 'contain'}" />
        ${d.caption ? `<figcaption>${escapeHtml(d.caption)}</figcaption>` : ''}
      </figure>`;
    case 'timeline': {
      const items = d.items ?? [];
      return `<div class="card-timeline">
        <div class="timeline-spine"></div>
        <div class="timeline-rows">
          ${items.map((it: any, i: number) => `
            <div class="timeline-row ${i % 2 === 0 ? 'odd' : 'even'}">
              <div class="timeline-card">
                <h4>${escapeHtml(it.title)}</h4>
                <p>${escapeHtml(it.body)}</p>
              </div>
              <div class="timeline-marker">${iconHtml(it.icon) || `<span>${i + 1}</span>`}</div>
              <div class="timeline-spacer"></div>
            </div>`).join('')}
        </div>
      </div>`;
    }
    case 'resources': {
      const items = d.items ?? [];
      return `<div class="card-resources">
        ${items.map((it: any) => `
          ${it.href ? `<a class="resource-link" href="${escapeHtml(it.href)}" target="_blank" rel="noreferrer">` : '<div class="resource-link">' }
            <div class="resource-card">
              <div class="resource-icon">${iconHtml(it.icon) || '●'}</div>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.desc ?? '')}</p>
            </div>
          ${it.href ? '</a>' : '</div>'}
        `).join('')}
      </div>`;
    }
    case 'divider':
      return `<div class="card-divider">
        <span class="divider-line"></span>
        ${d.text ? `<span class="divider-text">${escapeHtml(d.text)}</span><span class="divider-line"></span>` : ''}
      </div>`;
  }
  return '';
}

function cardStyle(card: Card): string {
  const s = card.style ?? {};
  const props: string[] = [
    `position:absolute`,
    `left:${card.x}px`,
    `top:${card.y}px`,
    `width:${card.w}px`,
    `height:${card.h}px`,
    `z-index:${card.zIndex}`,
  ];
  if (card.rotate) props.push(`transform:rotate(${card.rotate}deg)`);
  if (s.color) props.push(`color:${s.color}`);
  if (s.background) props.push(`background:${s.background}`);
  if (typeof s.borderRadius === 'number') props.push(`border-radius:${s.borderRadius}px`);
  if (typeof s.padding === 'number') props.push(`padding:${s.padding}px`);
  if (s.textAlign) props.push(`text-align:${s.textAlign}`);
  if (s.fontSize) props.push(`font-size:${s.fontSize}px`);
  if (s.fontWeight) props.push(`font-weight:${s.fontWeight}`);
  if (s.opacity != null) props.push(`opacity:${s.opacity}`);
  if (s.borderWidth) props.push(`border:${s.borderWidth}px solid ${s.borderColor ?? 'rgba(255,255,255,0.1)'}`);
  return props.join(';');
}

function slideToHtml(slide: any, idx: number, total: number): string {
  const sorted = slide.cards.slice().sort((a: Card, b: Card) => a.zIndex - b.zIndex);
  const cardsHtml = sorted
    .map((card: Card) => {
      const style = cardStyle(card);
      const inner = renderCardInner(card, card.data);
      return `<div class="anim" data-anim style="${style}">${inner}</div>`;
    })
    .join('\n');
  return `<section class="ppt-section" data-section-index="${idx}">
    <div class="ppt-stage">${cardsHtml}</div>
    ${idx < total - 1 ? '<div class="scroll-hint"><i class="fa-solid fa-chevron-down"></i></div>' : ''}
  </section>`;
}

function safeName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80) || 'presentation';
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const SHARED_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#fff;overflow-x:hidden}
html,body{height:100%}
body{min-height:100vh}
.ppt-section{position:relative;width:100vw;height:100vh;overflow:hidden;background:transparent}
.ppt-stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform:translate(-50%,-50%) scale(var(--scale,1));transform-origin:center center}
.anim{opacity:0;transform:translateY(40px);transition:opacity .8s ease,transform .8s ease;will-change:opacity,transform}
.anim.in{opacity:1;transform:translateY(0)}
.title-card{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;gap:16px;text-align:center}
.eyebrow{font-size:24px;letter-spacing:4px;opacity:.75}
.title-main{font-size:96px;line-height:1.1;background:linear-gradient(to right,#00c9ff,#92fe9d);-webkit-background-clip:text;background-clip:text;color:transparent}
.title-sub{font-size:28px;opacity:.85;line-height:1.5}
.card-block{width:100%;height:100%}
.card-heading{margin:0 0 16px 0;font-size:36px;color:#92fe9d;display:flex;align-items:center;gap:12px}
.card-heading i{color:#00c9ff}
.card-body{margin:0;font-size:22px;line-height:1.6;opacity:.9;white-space:pre-wrap}
.card-list{margin:0;padding-left:24px;font-size:22px;line-height:1.8}
.image-empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border:2px dashed rgba(255,255,255,.3);border-radius:12px;opacity:.6}
.card-figure{width:100%;height:100%;display:flex;flex-direction:column;gap:12px;margin:0}
.card-figure>div,.card-figure img-wrap{flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px}
.card-figure img{max-width:100%;max-height:100%}
.card-figure figcaption{text-align:center;opacity:.7;font-size:18px}
.card-timeline{position:relative;width:100%;height:100%}
.timeline-spine{position:absolute;top:0;bottom:0;left:50%;width:4px;transform:translateX(-50%);background:linear-gradient(to bottom,#00c9ff,#92fe9d)}
.timeline-rows{display:flex;flex-direction:column;gap:24px;height:100%;justify-content:space-around}
.timeline-row{display:flex;align-items:center;gap:24px}
.timeline-row.odd{flex-direction:row}
.timeline-row.even{flex-direction:row-reverse}
.timeline-card{flex:1;padding:20px;background:rgba(255,255,255,.08);border-radius:12px;border:1px solid rgba(255,255,255,.1)}
.timeline-card h4{margin:0 0 8px 0;color:#92fe9d;font-size:26px}
.timeline-card p{margin:0;font-size:18px;line-height:1.5;opacity:.85;white-space:pre-wrap}
.timeline-marker{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#00c9ff,#92fe9d);display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;flex-shrink:0}
.timeline-marker span{font-size:22px}
.timeline-spacer{flex:1}
.card-resources{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:24px;width:100%;height:100%}
.resource-link{text-decoration:none;color:inherit;display:block}
.resource-card{width:240px;padding:24px;background:rgba(255,255,255,.08);border-radius:12px;border:1px solid rgba(255,255,255,.1);text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.3)}
.resource-icon{font-size:36px;color:#00c9ff;margin-bottom:12px}
.resource-card h3{margin:0 0 8px 0;font-size:22px}
.resource-card p{margin:0;font-size:16px;opacity:.7}
.card-divider{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:16px}
.divider-line{flex:1;height:2px;background:rgba(255,255,255,.4)}
.divider-text{font-size:20px;opacity:.7;letter-spacing:2px}
.scroll-hint{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);color:#00c9ff;font-size:24px;opacity:.7;animation:bounce 1.5s infinite;pointer-events:none}
.scroll-hint.top{bottom:auto;top:18px;animation:none;opacity:.5}
@keyframes bounce{0%,20%,50%,80%,100%{transform:translate(-50%,0)}40%{transform:translate(-50%,-10px)}60%{transform:translate(-50%,-5px)}}
.controls{position:fixed;top:16px;right:16px;z-index:50;display:flex;gap:6px;background:rgba(0,0,0,.45);padding:4px;border-radius:10px;backdrop-filter:blur(6px);color:#fff;font-family:inherit}
.controls button{background:rgba(255,255,255,.1);border:none;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:13px;font-family:inherit}
.controls button:disabled{opacity:.4;cursor:not-allowed}
.controls .label{padding:4px 8px;font-size:13px;align-self:center}
.exit{position:fixed;top:16px;left:16px;z-index:50;color:#fff;text-decoration:none;background:rgba(0,0,0,.45);padding:6px 12px;border-radius:8px;backdrop-filter:blur(6px);font-family:inherit;font-size:14px}
`;

const SHARED_JS = `function setScale(){var s=Math.min(window.innerWidth/1920,window.innerHeight/1080,1.5);document.documentElement.style.setProperty('--scale',String(s))}
setScale();window.addEventListener('resize',setScale);
var sections=document.querySelectorAll('.ppt-section');
var total=sections.length;
var current=0;
function goto(i){if(i<0||i>=total)return;current=i;sections[i].scrollIntoView({behavior:'smooth',block:'start'});var u=new URL(location.href);u.searchParams.set('slide',String(i));history.replaceState(null,'',u);updateUi()}
function updateUi(){var t=document.getElementById('total');if(t)t.textContent=(current+1)+' / '+total;var p=document.getElementById('prev');var n=document.getElementById('next');if(p)p.disabled=current===0;if(n)n.disabled=current>=total-1}
window.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key===' '||e.key==='PageDown'||e.key==='ArrowRight'){e.preventDefault();goto(current+1)}else if(e.key==='ArrowUp'||e.key==='PageUp'||e.key==='ArrowLeft'){e.preventDefault();goto(current-1)}else if(e.key==='Home')goto(0);else if(e.key==='End')goto(total-1)});
var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in')}else{en.target.classList.remove('in')}})},{threshold:0.15,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.anim').forEach(function(el){io.observe(el)});
var params=new URLSearchParams(location.search);
var start=parseInt(params.get('slide')||'0',10);
if(!isNaN(start)&&start>=0&&start<total){setTimeout(function(){goto(start)},50)}
window.addEventListener('wheel',function(e){if(Math.abs(e.deltaY)<10)return;if(e.deltaY>0)goto(current+1);else goto(current-1)},{passive:true});
window.goto=goto;`;

export function exportStandaloneHtml(p: Presentation) {
  const slidesHtml = p.slides.map((s, i) => slideToHtml(s, i, p.slides.length)).join('\n');
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${escapeHtml(p.title)}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<style>${SHARED_CSS}body{background:${escapeHtml(p.background.value)};background-attachment:scroll;background-size:100% auto}</style>
</head>
<body>
<a class="exit" href="javascript:window.close&&window.close()">✕ 退出</a>
<div class="controls">
  <button id="prev">‹</button>
  <span class="label"><span id="cur">1</span> / <span id="total">${p.slides.length}</span></span>
  <button id="next">›</button>
</div>
${slidesHtml}
<script>${SHARED_JS}
document.getElementById('cur').id='cur';
var prev=document.getElementById('prev');prev.addEventListener('click',function(){goto(current-1)});
var next=document.getElementById('next');next.addEventListener('click',function(){goto(current+1)});
function updateUiFull(){var c=document.getElementById('cur');if(c)c.textContent=current+1;prev.disabled=current===0;next.disabled=current>=total-1}
var _goto=goto;
window.goto=function(i){_goto(i);updateUiFull()};
updateUiFull();
</script>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  download(blob, `${safeName(p.title)}.html`);
}