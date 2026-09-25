import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { PreviewPage } from './pages/PreviewPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/preview/:id" element={<PreviewPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}