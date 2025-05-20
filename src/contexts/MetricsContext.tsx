import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  Metric,
  MetricSummary,
  getMetrics,
  getMetricSummary,
  createMetric,
  updateMetric,
  deleteMetric
} from '../services/metrics';

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface MetricsContextData {
  metrics: Metric[];
  summaries: Record<Metric['type'], MetricSummary>;
  loading: boolean;
  error: string | null;
  fetchMetrics: (type: Metric['type'], startDate: Date, endDate: Date) => Promise<void>;
  fetchSummary: (type: Metric['type'], period: PeriodType) => Promise<void>;
  addMetric: (type: Metric['type'], value: number) => Promise<void>;
  editMetric: (id: string, value: number) => Promise<void>;
  removeMetric: (id: string) => Promise<void>;
}

const MetricsContext = createContext<MetricsContextData>({} as MetricsContextData);

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics deve ser usado dentro de um MetricsProvider');
  }
  return context;
};

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [summaries, setSummaries] = useState<Record<Metric['type'], MetricSummary>>({} as Record<Metric['type'], MetricSummary>);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (type: Metric['type'], startDate: Date, endDate: Date) => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getMetrics(currentUser.uid, type, startDate, endDate);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar métricas');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchSummary = useCallback(async (type: Metric['type'], period: PeriodType) => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const summary = await getMetricSummary(currentUser.uid, type, period);
      setSummaries(prev => ({ ...prev, [type]: summary }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar resumo das métricas');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addMetric = useCallback(async (type: Metric['type'], value: number) => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const newMetric = await createMetric(currentUser.uid, type, value);
      setMetrics(prev => [...prev, newMetric]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar métrica');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const editMetric = useCallback(async (id: string, value: number) => {
    setLoading(true);
    setError(null);

    try {
      await updateMetric(id, value);
      setMetrics(prev =>
        prev.map(metric =>
          metric.id === id ? { ...metric, value } : metric
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar métrica');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMetric = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteMetric(id);
      setMetrics(prev => prev.filter(metric => metric.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover métrica');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MetricsContext.Provider
      value={{
        metrics,
        summaries,
        loading,
        error,
        fetchMetrics,
        fetchSummary,
        addMetric,
        editMetric,
        removeMetric
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}; 