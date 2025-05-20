import { supabase } from '../config/supabase';

export interface Metric {
  id: string;
  userId: string;
  type: 'mrr' | 'arr' | 'churn' | 'customers' | 'nps';
  value: number;
  date: string;
  createdAt: string;
}

export interface MetricSummary {
  currentValue: number;
  previousValue: number;
  trend: number;
  period: string;
}

export const getMetrics = async (
  userId: string,
  type: Metric['type'],
  startDate: Date,
  endDate: Date
): Promise<Metric[]> => {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('userId', userId)
    .eq('type', type)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar métricas: ${error.message}`);
  }

  return data || [];
};

export const getMetricSummary = async (
  userId: string,
  type: Metric['type'],
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
): Promise<MetricSummary> => {
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      previousStartDate = new Date(startDate);
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      break;
    default:
      throw new Error('Período inválido');
  }

  const [currentMetrics, previousMetrics] = await Promise.all([
    getMetrics(userId, type, startDate, now),
    getMetrics(userId, type, previousStartDate, startDate)
  ]);

  const currentValue = currentMetrics.length > 0
    ? currentMetrics[currentMetrics.length - 1].value
    : 0;

  const previousValue = previousMetrics.length > 0
    ? previousMetrics[previousMetrics.length - 1].value
    : 0;

  const trend = previousValue === 0
    ? 0
    : ((currentValue - previousValue) / previousValue) * 100;

  return {
    currentValue,
    previousValue,
    trend,
    period
  };
};

export const createMetric = async (
  userId: string,
  type: Metric['type'],
  value: number
): Promise<Metric> => {
  const { data, error } = await supabase
    .from('metrics')
    .insert([
      {
        userId,
        type,
        value,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar métrica: ${error.message}`);
  }

  return data;
};

export const updateMetric = async (
  id: string,
  value: number
): Promise<void> => {
  const { error } = await supabase
    .from('metrics')
    .update({ value })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao atualizar métrica: ${error.message}`);
  }
};

export const deleteMetric = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('metrics')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao excluir métrica: ${error.message}`);
  }
}; 