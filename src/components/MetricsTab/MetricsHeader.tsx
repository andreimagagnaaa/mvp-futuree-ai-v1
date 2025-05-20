import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface MetricsHeaderProps {
  onConfigClick: () => void;
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({
  onConfigClick
}) => {
  return (
    <div className="flex flex-col space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Análise de Métricas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você pode analisar todas as suas métricas e KPIs aqui.
          </p>
        </div>
        <button
          onClick={onConfigClick}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          title="Configurar Métricas"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MetricsHeader; 