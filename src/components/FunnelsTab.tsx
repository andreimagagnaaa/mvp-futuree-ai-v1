import React, { useState, useEffect } from 'react';
import FunnelBuilder from './FunnelBuilder';
import { useAuth } from '../contexts/AuthContext';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { DashboardGapsCard } from './DashboardGapsCard';
import { funnelService } from '../services/funnelService';
import { Funnel } from '../types';

const FunnelsTab: React.FC = () => {
  const auth = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?.currentUser?.uid) {
      loadFunnels();
    }
  }, [auth?.currentUser?.uid]);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const data = await funnelService.getFunnels(auth?.currentUser?.uid || '');
      setFunnels(data);
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGapAction = (gapType: string) => {
    switch (gapType) {
      case 'conversion':
        console.log('Analisando problemas de conversão...');
        break;
      case 'volume':
        console.log('Analisando volume de leads...');
        break;
      case 'velocity':
        console.log('Analisando velocidade do funil...');
        break;
    }
  };

  if (!auth?.currentUser?.uid) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Por favor, faça login para acessar seus funis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <FunnelBuilder userId={auth.currentUser.uid} />
      </div>

      {/* Card de Diagnóstico de GAPS */}
      {!loading && funnels.length > 0 && (
        <DashboardGapsCard
          funnel={funnels[0]}
          onActionClick={handleGapAction}
        />
      )}
    </div>
  );
};

export default FunnelsTab; 