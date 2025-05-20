import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type MetricType = 'mrr' | 'customers' | 'churn' | 'nps';

interface TrendAnalysisProps {
  period: string;
  dateRange: DateRange;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ period, dateRange }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('mrr');

  const metrics = {
    mrr: {
      label: 'Receita Mensal Recorrente',
      data: [45000, 48000, 52000, 49000, 55000, 58000],
      format: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
      color: 'rgb(34, 197, 94)',
      trend: 6.2,
      insight: 'Crescimento consistente nos últimos 3 meses'
    },
    customers: {
      label: 'Total de Clientes',
      data: [200, 220, 235, 228, 245, 260],
      format: (value: number) => value.toString(),
      color: 'rgb(59, 130, 246)',
      trend: 4.8,
      insight: 'Aumento na taxa de aquisição'
    },
    churn: {
      label: 'Taxa de Churn',
      data: [2.8, 2.5, 2.3, 2.4, 2.1, 2.0],
      format: (value: number) => `${value}%`,
      color: 'rgb(239, 68, 68)',
      trend: -0.5,
      insight: 'Redução gradual do churn'
    },
    nps: {
      label: 'NPS',
      data: [72, 75, 78, 76, 80, 82],
      format: (value: number) => value.toString(),
      color: 'rgb(168, 85, 247)',
      trend: 3.1,
      insight: 'Satisfação do cliente em alta'
    }
  };

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: metrics[selectedMetric].label,
        data: metrics[selectedMetric].data,
        borderColor: metrics[selectedMetric].color,
        backgroundColor: `${metrics[selectedMetric].color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: metrics[selectedMetric].color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return metrics[selectedMetric].format(value);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value: number) => metrics[selectedMetric].format(value),
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const currentValue = metrics[selectedMetric].data[metrics[selectedMetric].data.length - 1];
  const previousValue = metrics[selectedMetric].data[metrics[selectedMetric].data.length - 2];
  const trend = metrics[selectedMetric].trend;
  const isPositiveTrend = trend > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Análise de Tendências
          </h2>
          <div className="flex items-center gap-2">
            {isPositiveTrend ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveTrend ? '+' : ''}{trend}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(metrics).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as MetricType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === key
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: selectedMetric === key ? color : undefined
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Valor Atual
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {metrics[selectedMetric].format(currentValue)}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Valor Anterior
            </div>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {metrics[selectedMetric].format(previousValue)}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Variação
            </div>
            <div className={`mt-1 text-2xl font-bold ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveTrend ? '+' : ''}{trend}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Insight
            </h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              {metrics[selectedMetric].insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis; 