import { supabase, supabaseAdmin } from '../config/supabase';

export interface Task {
  id: string;
  title: string;
  categoria: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  pontuacao: 'precisa melhorar' | 'bom' | 'excelente';
  clientType: string;
  status: 'Pendente' | 'Concluído';
}

export interface TaskProgress {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDiagnosticData {
  clientType: string;
  scores: Record<string, number>;
}

// Função auxiliar para normalizar nomes de áreas
function normalizeArea(area: string): string {
  const areaMap: Record<string, string> = {
    'Geração de Leads': 'leads',
    'Conversão': 'conversao',
    'Canais de Aquisição': 'canais',
    'Conteúdo': 'conteudo',
    'CRM e Relacionamento': 'crm',
    'Análise de Dados': 'dados',
    'Presença Digital': 'presenca',
    'Automação': 'automacao'
  };
  
  return areaMap[area] || area.toLowerCase();
}

// Função auxiliar para classificar o score
function getScoreClassification(score: number): 'Precisa Melhorar' | 'Bom' | 'Excelente' {
  if (score < 5) return 'Precisa Melhorar';
  if (score <= 8) return 'Bom';
  return 'Excelente';
}

export const taskService = {
  async getTasks(userId: string, userDiagnostic: UserDiagnosticData): Promise<Task[]> {
    try {
      // Filtra áreas válidas (excluindo Perfil do Cliente)
      const validAreas = Object.entries(userDiagnostic.scores)
        .filter(([area]) => area !== 'Perfil do Cliente')
        .filter(([area, score]) => {
          // Classifica o score
          const classification = getScoreClassification(score);
          console.log(`taskService: Área ${area} - Score ${score} - Classificação ${classification}`);
          
          // Inclui apenas áreas que precisam melhorar ou têm bom desempenho
          return classification === 'Precisa Melhorar' || classification === 'Bom';
        })
        .map(([area, score]) => ({
          area: normalizeArea(area),
          score: getScoreClassification(score)
        }));

      console.log('taskService: Áreas válidas após filtro:', validAreas);

      if (validAreas.length === 0) {
        console.log('taskService: Nenhuma área válida encontrada');
        return [];
      }

      // Busca tarefas para cada área
      const allTasks: Task[] = [];

      for (const { area, score } of validAreas) {
        console.log(`taskService: Buscando tarefas para área ${area} com score ${score} e tipo ${userDiagnostic.clientType}`);
        
        // Primeiro, vamos verificar todas as tarefas disponíveis para debug
        const { data: allAreaTasks } = await supabase
          .from('tarefas_recomendadas')
          .select('*');
        
        console.log(`taskService: Todas as tarefas disponíveis:`, allAreaTasks);
        console.log(`taskService: Buscando especificamente área "${area}" com score "${score}"`);

        // Agora faz a busca com os filtros
        const { data: tasks, error: tasksError } = await supabase
          .from('tarefas_recomendadas')
          .select('*')
          .eq('area', area)
          .eq('score', score)
          .or(`tipo_cliente.eq.${userDiagnostic.clientType},tipo_cliente.is.null`);

        if (tasksError) {
          console.error(`taskService: Erro ao buscar tarefas para área ${area}:`, tasksError);
          continue;
        }

        console.log(`taskService: Encontradas ${tasks?.length || 0} tarefas para área ${area} após filtros:`, tasks);
        
        if (tasks && tasks.length > 0) {
          // Mapeia para o formato Task
          const mappedTasks = tasks.map(task => ({
            id: task.id,
            title: task.tarefa_recomendada,
            categoria: normalizeArea(task.area),
            prioridade: score === 'Precisa Melhorar' ? ('Alta' as const) : ('Média' as const),
            pontuacao: score === 'Precisa Melhorar' ? 'precisa melhorar' : 'bom' as 'precisa melhorar' | 'bom' | 'excelente',
            clientType: task.tipo_cliente || 'Todos',
            status: 'Pendente' as const
          }));
            
          allTasks.push(...mappedTasks);
        }
      }

      // Ordena todas as tarefas por prioridade
      allTasks.sort((a, b) => {
        if (a.prioridade === 'Alta' && b.prioridade !== 'Alta') return -1;
        if (a.prioridade !== 'Alta' && b.prioridade === 'Alta') return 1;
        return 0;
      });

      console.log('taskService: Total de tarefas encontradas:', allTasks.length);
      console.log('taskService: Tarefas:', JSON.stringify(allTasks, null, 2));

      // Tenta buscar o progresso das tarefas
      try {
        const { data: progress, error: progressError } = await supabase
          .from('task_progress')
          .select('*')
          .eq('user_id', userId);

        if (progressError) {
          console.log('taskService: Erro ao buscar progresso:', progressError);
          return allTasks;
        }

        if (!progress || progress.length === 0) {
          console.log('taskService: Nenhum progresso encontrado');
          return allTasks;
        }

        console.log('taskService: Progresso encontrado:', progress);

        // Se tiver progresso, atualiza o status das tarefas
        return allTasks.map(task => ({
          ...task,
          status: progress.find(p => p.task_id === task.id)?.status === 'completed' ? ('Concluído' as const) : ('Pendente' as const)
        }));
      } catch (progressError) {
        console.log('taskService: Erro ao buscar progresso:', progressError);
        return allTasks;
      }

    } catch (error) {
      console.error('taskService: Erro ao buscar tarefas:', error);
      return [];
    }
  },

  async updateTaskProgress(taskId: string, userId: string, completed: boolean): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Primeiro, verifica se já existe um registro
      const { data: existingProgress } = await supabaseAdmin
        .from('task_progress')
        .select('id')
        .eq('task_id', taskId)
        .eq('user_id', userId)
        .single();

      const updateData = {
        task_id: taskId,
        user_id: userId,
        status: completed ? 'completed' : 'pending',
        completed_at: completed ? now : null,
        updated_at: now
      };

      // Se já existe, atualiza. Se não, insere
      const { error } = await supabaseAdmin
        .from('task_progress')
        .upsert({
          ...updateData,
          ...(existingProgress ? { id: existingProgress.id } : {})
        });

      if (error) {
        console.error('taskService: Erro ao atualizar progresso:', error);
        throw error;
      }
    } catch (error) {
      console.error('taskService: Erro ao atualizar progresso da tarefa:', error);
      throw error;
    }
  },

  async syncTaskProgress(userId: string): Promise<Record<string, TaskProgress>> {
    try {
      const { data, error } = await supabase
        .from('task_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('taskService: Erro ao sincronizar progresso:', error);
        return {};
      }

      return data.reduce((acc, progress) => {
        acc[progress.task_id] = progress;
        return acc;
      }, {} as Record<string, TaskProgress>);
    } catch (error) {
      console.error('taskService: Erro ao sincronizar progresso das tarefas:', error);
      return {};
    }
  }
};