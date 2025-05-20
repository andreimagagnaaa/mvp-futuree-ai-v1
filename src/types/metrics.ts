export interface CustomMetric {
  id: string;
  title: string;
  type: 'currency' | 'percentage' | 'number' | 'time' | 'score';
  value: number;
  format?: string;
  trend?: number;
  goal?: {
    target: number;
    deadline: Date;
    alert: {
      type: 'below' | 'above';
      threshold: number;
    };
  };
  category: 'financial' | 'customers' | 'engagement' | 'custom';
  isVisible: boolean;
  order: number;
}

export interface MetricsConfig {
  layout: {
    showRoiCalculator: boolean;
  };
  metrics: CustomMetric[];
}

export interface MetricsContextType {
  config: MetricsConfig;
  updateConfig: (newConfig: Partial<MetricsConfig>) => void;
  updateMetric: (metricId: string, updates: Partial<CustomMetric>) => void;
  addMetric: (metric: Omit<CustomMetric, 'id'>) => void;
  removeMetric: (metricId: string) => void;
  reorderMetrics: (startIndex: number, endIndex: number) => void;
} 