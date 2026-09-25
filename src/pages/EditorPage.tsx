import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor } from '../store/editor';
import { loadProject } from '../lib/storage';
import { exportProjectJson, exportStandaloneHtml } from '../lib/exporters';
import { CanvasStage } from '../components/CanvasStage';
import { InspectorPanel } from '../components/InspectorPanel';
import { SlideListPanel } from '../components/SlideListPanel';
import { EditorTopBar } from '../components/EditorTopBar';
import { saveProject } from '../lib/storage';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hydrate = useEditor((s) => s.hydrate);
  const presentation = useEditor((s) => s.presentation);
  const currentSlideId = useEditor((s) => s.currentSlideId);
  const selectCard = useEditor((s) => s.selectCard);
  const updateCard = useEditor((s) => s.updateCard);
  const setCurrentSlide = useEditor((s) => s.setCurrentSlide);
  const selectedCardId = useEditor((s) => s.selectedCardId);

  useEffect(() => {
    let cancel = false;
    if (!id) return;
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
    if (!presentation.slides.length) return;
    if (!presentation.slides.find((s) => s.id === currentSlideId)) {
      setCurrentSlide(presentation.slides[0].id);
    }
  }, [presentation, currentSlideId, setCurrentSlide]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveProject(presentation).catch((e) => console.error('save error', e));
    }, 1000);
    return () => clearTimeout(timer);
  }, [presentation]);

  useEffect(() => {
    async function onExport(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail === 'html') {
        exportStandaloneHtml(presentation);
      } else {
        exportProjectJson(presentation);
      }
    }
    window.addEventListener('oscar-ppt:export', onExport);
    return () => window.removeEventListener('oscar-ppt:export', onExport);
  }, [presentation]);

  const slide = presentation.slides.find((s) => s.id === currentSlideId) ?? presentation.slides[0];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0c0c14' }}>
      <EditorTopBar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <SlideListPanel />
        <CanvasStage
          presentation={presentation}
          slide={slide}
          selectedCardId={selectedCardId}
          onSelectCard={selectCard}
          onUpdateCard={(cardId, patch) => updateCard(cardId, patch)}
        />
        <InspectorPanel />
      </div>
    </div>
  );
}