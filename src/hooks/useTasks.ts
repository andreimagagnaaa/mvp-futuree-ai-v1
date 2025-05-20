import { useState, useEffect, useCallback } from 'react';
import { Task } from '../data/mockTasks';
import { taskService } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const { currentUser, userData } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    console.log('useTasks: Iniciando fetchTasks');
    console.log('useTasks: currentUser:', currentUser?.uid);
    console.log('useTasks: userData completo:', userData);
    console.log('useTasks: diagnostic scores:', userData?.diagnostic?.scores);
    console.log('useTasks: diagnostic answers:', userData?.diagnostic?.answers);

    if (!currentUser?.uid) {
      console.log('useTasks: Usuário não autenticado');
      setLoading(false);
      return;
    }

    if (!userData?.diagnostic?.scores) {
      console.log('useTasks: Diagnóstico não encontrado ou scores não definidos');
      setLoading(false);
      return;
    }

    if (!userData?.diagnostic?.answers?.['9']) {
      console.log('useTasks: Resposta da pergunta 9 não encontrada, usando B2B como padrão');
    }

    const clientType = userData.diagnostic.answers?.['9'] === '9a' ? 'B2C' : 'B2B';
    console.log('useTasks: Tipo de cliente determinado:', clientType);
    console.log('useTasks: Resposta da pergunta 9:', userData.diagnostic.answers?.['9']);
    
    try {
      setLoading(true);
      console.log('useTasks: Buscando tarefas para userId:', currentUser.uid);
      console.log('useTasks: Parâmetros para getTasks:', {
        userId: currentUser.uid,
        scores: userData.diagnostic.scores,
        clientType
      });

      const fetchedTasks = await taskService.getTasks(currentUser.uid, {
        scores: userData.diagnostic.scores,
        clientType
      });
      
      console.log('useTasks: Tarefas recebidas:', fetchedTasks);
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      console.error('useTasks: Erro ao carregar tarefas:', err);
      setError('Erro ao carregar tarefas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, userData]);

  useEffect(() => {
    console.log('useTasks: useEffect disparado');
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskProgress = useCallback(async (taskId: string, completed: boolean) => {
    if (!currentUser?.uid) return;

    try {
      await taskService.updateTaskProgress(taskId, currentUser.uid, completed);
      // Atualiza o estado local
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: completed ? 'Concluído' : 'Pendente' }
            : task
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  return {
    tasks,
    loading,
    error,
    updateTaskProgress,
    refreshTasks: fetchTasks
  };
};

export default useTasks; 