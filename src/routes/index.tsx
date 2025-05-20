import { Routes, Route } from 'react-router-dom';
import { FunnelBuilder } from '../pages/FunnelBuilder';
import { FunnelEditorPage } from '../pages/FunnelEditor';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FunnelBuilder />} />
      <Route path="/funnels" element={<FunnelBuilder />} />
      <Route path="/funnels/new" element={<FunnelEditorPage />} />
      <Route path="/funnels/:id/edit" element={<FunnelEditorPage />} />
      {/* outras rotas... */}
    </Routes>
  );
}; 