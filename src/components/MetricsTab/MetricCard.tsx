import React, { useState } from 'react';
import { CustomMetric } from '../../types/metrics';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useCustomMetrics } from '../../contexts/CustomMetricsContext';

interface MetricCardProps {
  metric: CustomMetric;
}

const formatValue = (value: number, type: CustomMetric['type']): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'score':
      return value.toFixed(1);
    default:
      return value.toLocaleString('pt-BR');
  }
};

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const { updateMetric } = useCustomMetrics();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(metric.value.toString());

  const handleEdit = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue)) {
      updateMetric(metric.id, { value: newValue });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {metric.title}
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Editar valor"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-baseline justify-between">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleEdit}
                onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(metric.value, metric.type)}
            </span>
          )}
          {metric.trend !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${
              metric.trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.trend >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              <span>{Math.abs(metric.trend)}%</span>
            </div>
          )}
        </div>

        {metric.goal && metric.category !== 'engagement' && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Meta: {formatValue(metric.goal.target, metric.type)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard; 