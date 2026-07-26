import { GlassWrap } from './GlassProvider';

export function Hero() {
  return (
    <section className="hero" id="heroSection">
      <GlassWrap
        borderRadius={24}
        style={{
          padding: '40px 60px',
          background: 'transparent',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div className="hero-icon">📑</div>
        <h1>HTML演示工具集</h1>
      </GlassWrap>
      <p>
        使用 HTML 制作的演示工具集，涵盖多种场景应用。所有工具直接在浏览器中运行，无需安装，方便快捷。
      </p>
    </section>
  );
}