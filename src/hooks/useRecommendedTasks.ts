import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export interface AreaScore {
  area: string
  score: 'Precisa Melhorar' | 'Bom'
}

export interface TaskRecommendation {
  id: number
  area: string
  score: string
  tipo_cliente: 'B2B' | 'B2C'
  tarefa_recomendada: string
  framework_sugerido: string
  nome_material: string
  link_pdf: string
}

interface UseRecommendedTasksProps {
  clientType: 'B2B' | 'B2C'
  areaScores: AreaScore[]
}

export function useRecommendedTasks({ clientType, areaScores }: UseRecommendedTasksProps) {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        setError(null)

        console.log('useRecommendedTasks: areaScores recebidos:', areaScores)

        // Filtra apenas áreas com score "Precisa Melhorar" ou "Bom"
        const validAreaScores = areaScores.filter(
          as => as.score === 'Precisa Melhorar' || as.score === 'Bom'
        )

        console.log('useRecommendedTasks: Áreas válidas após filtro:', validAreaScores)

        // Busca recomendações para cada combinação de área e score
        const allRecommendations: TaskRecommendation[] = []

        for (const { area, score } of validAreaScores) {
          console.log(`useRecommendedTasks: Buscando recomendações para área "${area}" com score "${score}" e tipo "${clientType}"`)
          
          const { data, error } = await supabase
            .from('tarefas_recomendadas')
            .select('*')
            .eq('area', area)
            .eq('score', score)
            .eq('tipo_cliente', clientType)

          if (error) {
            console.error(`useRecommendedTasks: Erro na busca:`, error)
            throw new Error(`Erro ao buscar recomendações: ${error.message}`)
          }

          console.log(`useRecommendedTasks: Dados retornados para área ${area}:`, data)

          if (data) {
            allRecommendations.push(...data)
          }
        }

        console.log('useRecommendedTasks: Todas as recomendações:', allRecommendations)
        setRecommendations(allRecommendations)

      } catch (err) {
        console.error('useRecommendedTasks: Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [clientType, areaScores])

  return {
    recommendations,
    loading,
    error
  }
} 