import React from 'react';
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';

const VisaoGeral: React.FC = () => {
  const { userData } = useAuth();
  const { tasks, loading, error } = useTasks();

  // Verifica se o diagnóstico está completo
  if (!userData?.hasCompletedDiagnostic || !userData?.diagnostic?.scores) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mb-4" />
        <div className="text-gray-600 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Diagnóstico Incompleto</h3>
          <p>Para ver suas tarefas recomendadas, você precisa completar o diagnóstico primeiro.</p>
        </div>
      </div>
    );
  }

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'Concluído').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const pendingTasks = tasks.filter(task => task.status !== 'Concluído').length;

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-500';
      case 'Média':
        return 'bg-yellow-500';
      case 'Baixa':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 56) return { // 70% de 80
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      message: 'Excelente',
      progressColor: 'bg-green-600'
    };
    if (score >= 40) return { // 50% de 80
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      message: 'Bom',
      progressColor: 'bg-yellow-600'
    };
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      message: 'Precisa Melhorar',
      progressColor: 'bg-red-600'
    };
  };

  // Calcula o score total baseado no diagnóstico do usuário
  const calculateTotalScore = (): number => {
    if (!userData?.diagnostic?.totalScore) return 0;
    return userData.diagnostic.totalScore;
  };

  const userScore = calculateTotalScore();
  const scoreColors = getScoreColor(userScore);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Carregando tarefas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Nenhuma tarefa encontrada.</div>
      </div>
    );
  }

  const scoreType = tasks[0]?.pontuacao || 'bom';
  const clientType = tasks[0]?.clientType || 'B2B';

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Score Médio */}
        <div className={`rounded-xl p-6 border ${scoreColors.border} ${scoreColors.bg}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-lg ${scoreColors.bg} border ${scoreColors.border}`}>
              <ChartBarIcon className={`w-6 h-6 ${scoreColors.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Score Médio</h3>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-bold ${scoreColors.text}`}>{userScore}</span>
            <span className="text-sm text-gray-600">/ 80 pontos</span>
        </div>
          <div className="mt-2">
            <span className={`text-sm font-medium ${scoreColors.text}`}>{scoreColors.message}</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
                className={`h-2 rounded-full ${scoreColors.progressColor}`}
                style={{ width: `${(userScore / 80) * 100}%` }}
            />
          </div>
        </div>
      </div>

        {/* Outros cards e conteúdo existente */}
        <TaskList showHeader={true} />
      </div>
    </div>
  );
};

export default VisaoGeral; 