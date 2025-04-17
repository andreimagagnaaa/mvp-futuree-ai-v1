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

        // Filtra apenas áreas com score "Precisa Melhorar" ou "Bom"
        const validAreaScores = areaScores.filter(
          as => as.score === 'Precisa Melhorar' || as.score === 'Bom'
        )

        // Busca recomendações para cada combinação de área e score
        const allRecommendations: TaskRecommendation[] = []

        for (const { area, score } of validAreaScores) {
          const { data, error } = await supabase
            .from('tarefas_recomendadas')
            .select('*')
            .eq('area', area)
            .eq('score', score)
            .eq('tipo_cliente', clientType)

          if (error) {
            throw new Error(`Erro ao buscar recomendações: ${error.message}`)
          }

          if (data) {
            allRecommendations.push(...data)
          }
        }

        setRecommendations(allRecommendations)

      } catch (err) {
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