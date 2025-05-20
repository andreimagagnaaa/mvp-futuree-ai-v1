import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CustomMetric, MetricsConfig, MetricsContextType } from '../types/metrics';

const defaultConfig: MetricsConfig = {
  layout: {
    showRoiCalculator: true
  },
  metrics: [
    {
      id: uuidv4(),
      title: 'Receita Mensal (MRR)',
      type: 'currency',
      value: 50000,
      trend: 12.5,
      category: 'financial',
      isVisible: true,
      order: 0
    },
    {
      id: uuidv4(),
      title: 'Total de Clientes',
      type: 'number',
      value: 250,
      trend: 8.4,
      category: 'customers',
      isVisible: true,
      order: 1
    },
    {
      id: uuidv4(),
      title: 'NPS',
      type: 'score',
      value: 75,
      trend: 3.2,
      category: 'engagement',
      isVisible: true,
      order: 2,
      goal: {
        target: 80,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        alert: {
          type: 'below',
          threshold: 70
        }
      }
    }
  ]
};

const CustomMetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const useCustomMetrics = () => {
  const context = useContext(CustomMetricsContext);
  if (!context) {
    throw new Error('useCustomMetrics deve ser usado dentro de um CustomMetricsProvider');
  }
  return context;
};

export const CustomMetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MetricsConfig>(() => {
    const savedConfig = localStorage.getItem('metricsConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  const saveConfig = useCallback((newConfig: MetricsConfig) => {
    localStorage.setItem('metricsConfig', JSON.stringify(newConfig));
    setConfig(newConfig);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<MetricsConfig>) => {
    saveConfig({
      ...config,
      ...newConfig,
      layout: {
        ...config.layout,
        ...newConfig.layout
      }
    });
  }, [config, saveConfig]);

  const updateMetric = useCallback((metricId: string, updates: Partial<CustomMetric>) => {
    const newMetrics = config.metrics.map(metric =>
      metric.id === metricId ? { ...metric, ...updates } : metric
    );
    saveConfig({ ...config, metrics: newMetrics });
  }, [config, saveConfig]);

  const addMetric = useCallback((metric: Omit<CustomMetric, 'id'>) => {
    const newMetric = {
      ...metric,
      id: uuidv4(),
      order: config.metrics.length
    };
    saveConfig({
      ...config,
      metrics: [...config.metrics, newMetric]
    });
  }, [config, saveConfig]);

  const removeMetric = useCallback((metricId: string) => {
    const newMetrics = config.metrics
      .filter(metric => metric.id !== metricId)
      .map((metric, index) => ({ ...metric, order: index }));
    saveConfig({ ...config, metrics: newMetrics });
  }, [config, saveConfig]);

  const reorderMetrics = useCallback((startIndex: number, endIndex: number) => {
    const newMetrics = [...config.metrics];
    const [removed] = newMetrics.splice(startIndex, 1);
    newMetrics.splice(endIndex, 0, removed);
    
    const reorderedMetrics = newMetrics.map((metric, index) => ({
      ...metric,
      order: index
    }));
    
    saveConfig({ ...config, metrics: reorderedMetrics });
  }, [config, saveConfig]);

  return (
    <CustomMetricsContext.Provider
      value={{
        config,
        updateConfig,
        updateMetric,
        addMetric,
        removeMetric,
        reorderMetrics
      }}
    >
      {children}
    </CustomMetricsContext.Provider>
  );
}; 