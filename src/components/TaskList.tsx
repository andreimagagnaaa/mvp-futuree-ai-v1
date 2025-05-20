import React from 'react';
import { RocketLaunchIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Task } from '../data/mockTasks';
import useTasks from '../hooks/useTasks';

interface TaskListProps {
  showHeader?: boolean;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({ showHeader = true, className = '' }) => {
  const { tasks, loading, error, updateTaskProgress } = useTasks();

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    try {
      await updateTaskProgress(taskId, currentStatus !== 'Concluído');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

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

  const getScoreColor = (pontuacao: string) => {
    return pontuacao === 'bom' ? 'text-green-500' : 'text-orange-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">Carregando tarefas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">Nenhuma tarefa encontrada.</div>
      </div>
    );
  }

  const pendingTasks = tasks.filter(task => task.status !== 'Concluído').length;
  const scoreType = tasks[0]?.pontuacao || 'bom';
  const clientType = tasks[0]?.clientType || 'B2B';

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <RocketLaunchIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Tarefas Recomendadas no seu Diagnóstico
            </h2>
          </div>
          <p className="text-sm text-gray-600 ml-9">
            Baseado no Score:{' '}
            <span className={getScoreColor(scoreType)}>
              {scoreType === 'bom' ? 'Bom' : 'Precisa Melhorar'}
            </span>
            {' | '}
            Tipo de Cliente: <span className="text-gray-600">{clientType}</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between transition-all duration-200 hover:bg-gray-100"
          >
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex-shrink-0 mt-1">
                <RocketLaunchIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {task.title}
                </h3>
                <p className="text-sm italic text-[#A78BFA]">
                  {task.categoria}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(task.prioridade)}`}>
                {task.prioridade}
              </span>
              <button
                onClick={() => handleTaskToggle(task.id, task.status)}
                className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                {task.status === 'Concluído' && (
                  <CheckIcon className="w-4 h-4 text-green-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <span className="text-sm font-bold text-gray-700">
          {pendingTasks} pendentes
        </span>
      </div>
    </div>
  );
};

export default TaskList; 