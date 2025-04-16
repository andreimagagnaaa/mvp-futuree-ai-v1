import { supabase } from '../config/supabase'

export async function buscarTarefasDeTeste() {
  // Temporariamente retornando dados mockados
  return {
    data: [{
      id: 1,
      titulo: "Tarefa de teste",
      descricao: "Esta é uma tarefa de teste",
      prioridade: "alta",
      status: "pendente"
    }],
    error: null
  };
} 