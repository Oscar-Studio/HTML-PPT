# 📊 HTML-PPT 编辑器 (v2)

> 在线制作可拖拽、可导出独立 HTML 的演示文稿 — Oscar Studio 出品

🌐 **在线访问：[ppt.oscarstudio.cn](https://ppt.oscarstudio.cn)**

---

## ✨ 功能

- 🎨 **可视化画布**：16:9 画布，卡片自由拖拽、缩放、旋转（react-moveable）
- 🧩 **组件化卡片**：标题 / 文字 / 列表 / 图片 / 时间线 / 资源卡 / 分割线
- 📑 **多页面管理**：新建、复制、删除，缩略图一目了然
- 💾 **本地保存**：作品自动写入 IndexedDB，支持导出 / 导入 JSON
- 📤 **自包含 HTML 导出**：单文件播放，支持键盘翻页、URL 同步，可离线打开
- ↩ **撤销 / 重做**：50 步历史 + Ctrl/Cmd+Z 快捷键
- 🌓 **主题**：经典蓝主题，对应模板 2.0 视觉风格

---

## 🚀 开发

```bash
cd HTML-PPT
npm install
npm run dev          # 本地开发服务器（http://localhost:5173）
npm run build        # 产出 dist/
npm run deploy       # 构建并发布到 gh-pages（ppt.oscarstudio.cn）
```

## 📦 项目结构

```
HTML-PPT/
├── index.html              # Vite 入口
├── src/
│   ├── main.tsx            # React + BrowserRouter
│   ├── App.tsx             # 路由壳
│   ├── types.ts            # 数据模型（Presentation / Slide / Card）
│   ├── lib/
│   │   ├── factory.ts      # 默认值与新建/克隆
│   │   ├── storage.ts      # Dexie (IndexedDB)
│   │   ├── themes.ts       # 主题
│   │   └── exporters.ts    # JSON / 自包含 HTML 导出
│   ├── store/
│   │   └── editor.ts       # Zustand 编辑器状态
│   ├── pages/
│   │   ├── HomePage.tsx    # 作品列表
│   │   ├── EditorPage.tsx  # 三栏编辑器
│   │   └── PreviewPage.tsx # 全屏播放
│   └── components/
│       ├── CanvasStage.tsx # 画布 + react-moveable
│       ├── CardRenderer.tsx
│       ├── SlideListPanel.tsx
│       ├── InspectorPanel.tsx
│       ├── EditorTopBar.tsx
│       ├── PreviewDeck.tsx
│       └── SlideThumb.tsx
└── public/                 # favicon 等静态资源
```

---

## 🧩 添加新主题

在 `src/lib/themes.ts` 中新增条目，然后通过 `getTheme(id)` 切换。

## 🛠 添加新卡片类型

1. 在 `src/types.ts` 的 `CardType` 添加枚举。
2. 在 `src/lib/factory.ts` 的 `defaultCardData` 和 `defaultCardStyle` 加入默认。
3. 在 `src/components/CardRenderer.tsx` 添加渲染分支。
4. 在 `src/lib/exporters.ts` 的 `renderCardInner` 添加导出分支。
5. 在 `src/components/InspectorPanel.tsx` 添加属性表单。

---

*由 [Oscar Studio](https://oscarstudio.cn) 出品 · [查看主站 →](https://oscarstudio.cn)*