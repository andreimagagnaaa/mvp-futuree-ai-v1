import { CompetitorData, Metric, SectorMetrics, FormattingOptions } from '../types/benchmarking';

export const formatMetricValue = (value: number, options: FormattingOptions): string => {
  const { type, precision = 1, currency = 'BRL' } = options;
  
  switch (type) {
    case 'percentage':
      return `${value.toFixed(precision)}%`;
    case 'currency':
      return value.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency 
      });
    default:
      return value.toLocaleString('pt-BR');
  }
};

export const calculateSectorMetrics = (
  competitors: CompetitorData[],
  metrics: Metric[],
  selectedSector: string
): SectorMetrics => {
  const sectorCompetitors = competitors.filter(comp => comp.sector === selectedSector);
  
  if (sectorCompetitors.length === 0) {
    return metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.key]: 0
    }), {});
  }

  return metrics.reduce((acc, metric) => {
    const total = sectorCompetitors.reduce(
      (sum, comp) => sum + (comp.metrics[metric.key] || 0), 
      0
    );
    return {
      ...acc,
      [metric.key]: total / sectorCompetitors.length
    };
  }, {});
};

export const validateMetricKey = (key: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key);
};

export const generateDefaultMetrics = (userId: string): Metric[] => [
  { 
    id: crypto.randomUUID(),
    name: 'Market Share', 
    key: 'marketShare', 
    type: 'percentage', 
    isActive: true, 
    isRequired: true,
    userId
  },
  { 
    id: crypto.randomUUID(),
    name: 'Crescimento', 
    key: 'growth', 
    type: 'percentage', 
    isActive: true, 
    isRequired: true,
    userId
  },
  { 
    id: crypto.randomUUID(),
    name: 'Seguidores', 
    key: 'socialFollowers', 
    type: 'number', 
    isActive: true, 
    isRequired: true,
    userId
  },
  { 
    id: crypto.randomUUID(),
    name: 'Engajamento', 
    key: 'engagement', 
    type: 'percentage', 
    isActive: true, 
    isRequired: true,
    userId
  },
  { 
    id: crypto.randomUUID(),
    name: 'Tráfego Mensal', 
    key: 'websiteTraffic', 
    type: 'number', 
    isActive: true, 
    isRequired: true,
    userId
  },
  { 
    id: crypto.randomUUID(),
    name: 'Posts/Mês', 
    key: 'contentFrequency', 
    type: 'number', 
    isActive: true, 
    isRequired: true,
    userId
  }
]; 