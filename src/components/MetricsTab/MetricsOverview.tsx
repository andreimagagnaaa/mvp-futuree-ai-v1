import React from 'react';
import { formatCurrency } from '../../utils/format';
import { useCustomMetrics } from '../../contexts/CustomMetricsContext';
import { CustomMetric } from '../../types/metrics';
import { TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from './MetricCard';

const formatMetricValue = (metric: CustomMetric): string => {
  switch (metric.type) {
    case 'currency':
      return formatCurrency(metric.value);
    case 'percentage':
      return `${metric.value}%`;
    case 'time':
      return `${metric.value}h`;
    case 'score':
      return metric.value.toString();
    default:
      return metric.value.toString();
  }
};

const MetricsOverview: React.FC = () => {
  const { config } = useCustomMetrics();
  const visibleMetrics = config.metrics.filter(metric => metric.isVisible);

  const metricsByCategory = {
    engagement: visibleMetrics.filter(m => m.category === 'engagement'),
    customers: visibleMetrics.filter(m => m.category === 'customers'),
    financial: visibleMetrics.filter(m => m.category === 'financial'),
  };

  const categoryTitles = {
    engagement: 'Métricas de Engajamento',
    customers: 'Métricas de Clientes',
    financial: 'Métricas Financeiras',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Object.entries(metricsByCategory).map(([category, metrics]) => (
        <div key={category} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {categoryTitles[category as keyof typeof categoryTitles]}
          </h2>
          <div className="space-y-4">
            {metrics.map(metric => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsOverview; 