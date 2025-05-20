import React, { useState } from 'react';
import { useCustomMetrics } from '../../contexts/CustomMetricsContext';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Segment {
  id: string;
  name: string;
  value: number;
  percentage: number;
}

const SegmentAnalysis: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentValue, setNewSegmentValue] = useState('');

  const addSegment = () => {
    if (!newSegmentName || !newSegmentValue) return;

    const value = parseFloat(newSegmentValue);
    if (isNaN(value)) return;

    const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0) + value;
    
    // Recalcular as porcentagens
    const updatedSegments = segments.map(segment => ({
      ...segment,
      percentage: (segment.value / totalValue) * 100
    }));

    setSegments([
      ...updatedSegments,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: newSegmentName,
        value: value,
        percentage: (value / totalValue) * 100
      }
    ]);

    setNewSegmentName('');
    setNewSegmentValue('');
  };

  const removeSegment = (id: string) => {
    const filteredSegments = segments.filter(segment => segment.id !== id);
    const totalValue = filteredSegments.reduce((sum, segment) => sum + segment.value, 0);

    // Recalcular as porcentagens após remover
    const updatedSegments = filteredSegments.map(segment => ({
      ...segment,
      percentage: totalValue > 0 ? (segment.value / totalValue) * 100 : 0
    }));

    setSegments(updatedSegments);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 w-full">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Análise por Segmento
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Nome do segmento"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Valor"
                  value={newSegmentValue}
                  onChange={(e) => setNewSegmentValue(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <button
                onClick={addSegment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {segments.map(segment => (
                <div
                  key={segment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {segment.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(segment.value)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {segment.percentage.toFixed(1)}%
                    </span>
                    <button
                      onClick={() => removeSegment(segment.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {segments.length > 0 ? (
              <div className="aspect-square rounded-full overflow-hidden relative">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {segments.reduce((acc, segment, index) => {
                    const previousPercentage = acc.totalPercentage;
                    const strokeDasharray = `${segment.percentage} 100`;
                    const strokeDashoffset = -previousPercentage;

                    acc.totalPercentage += segment.percentage;

                    const colors = [
                      'stroke-blue-500',
                      'stroke-green-500',
                      'stroke-purple-500',
                      'stroke-yellow-500',
                      'stroke-red-500',
                      'stroke-indigo-500'
                    ];

                    return [
                      ...acc.elements,
                      <circle
                        key={segment.id}
                        cx="50"
                        cy="50"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="30"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={colors[index % colors.length]}
                      />
                    ];
                  }, { elements: [], totalPercentage: 0 } as { elements: JSX.Element[], totalPercentage: number }).elements}
                </svg>
              </div>
            ) : (
              <div className="aspect-square rounded-full border-4 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Adicione segmentos para visualizar o gráfico
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentAnalysis; 