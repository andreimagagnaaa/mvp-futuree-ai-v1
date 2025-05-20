export interface Task {
  id: string;
  title: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Em progresso' | 'Concluído';
  categoria: string;
  pontuacao: 'bom' | 'precisa melhorar';
  clientType: 'B2B' | 'B2C';
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Criar lead magnet com foco no problema do cliente',
    categoria: 'Geração de Leads',
    prioridade: 'Alta',
    status: 'Pendente',
    pontuacao: 'precisa melhorar',
    clientType: 'B2B'
  },
  {
    id: '2',
    title: 'Revisar formulário de captura',
    categoria: 'Geração de Leads',
    prioridade: 'Média',
    status: 'Em progresso',
    pontuacao: 'precisa melhorar',
    clientType: 'B2B'
  },
  {
    id: '3',
    title: 'Oferecer diagnóstico gratuito',
    categoria: 'Conversão',
    prioridade: 'Baixa',
    status: 'Concluído',
    pontuacao: 'bom',
    clientType: 'B2C'
  },
  {
    id: '4',
    title: 'Criar página de captura otimizada',
    categoria: 'Geração de Leads',
    prioridade: 'Média',
    status: 'Pendente',
    pontuacao: 'bom',
    clientType: 'B2C'
  }
]; 