import React, { useState, useEffect } from 'react';
import { CompetitorData, Metric } from '../types/benchmarking';

interface CompetitorFormProps {
  competitor?: CompetitorData;
  sectors: string[];
  metrics: Metric[];
  onSubmit: (competitor: CompetitorData | Partial<CompetitorData>) => void;
  onCancel: () => void;
}

export const CompetitorForm: React.FC<CompetitorFormProps> = ({
  competitor,
  sectors,
  metrics,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<CompetitorData>>({
    name: '',
    sector: sectors[0] || '',
    metrics: {}
  });

  useEffect(() => {
    if (competitor) {
      setFormData(competitor);
    }
  }, [competitor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleMetricChange = (key: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [key]: numericValue
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Empresa
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Setor
          </label>
          <select
            value={formData.sector}
            onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Métricas</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.filter(m => m.isActive).map(metric => (
            <div key={metric.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {metric.name}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.metrics?.[metric.key] || ''}
                  onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={metric.isRequired}
                />
                {metric.type === 'percentage' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {competitor ? 'Atualizar' : 'Adicionar'} Competidor
        </button>
      </div>
    </form>
  );
}; 