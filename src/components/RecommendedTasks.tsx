import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'

interface AreaScore {
  area: string
  score: 'Precisa Melhorar' | 'Bom'
}

interface TaskRecommendation {
  id: number
  area: string
  score: string
  tipo_cliente: 'B2B' | 'B2C'
  tarefa_recomendada: string
  framework_sugerido: string
  nome_material: string
  link_pdf: string
}

interface RecommendedTasksProps {
  clientType: 'B2B' | 'B2C'
  areaScores: AreaScore[]
  onTasksLoaded?: (tasks: TaskRecommendation[]) => void
}

export function RecommendedTasks({ clientType, areaScores, onTasksLoaded }: RecommendedTasksProps) {
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
        onTasksLoaded?.(allRecommendations)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [clientType, areaScores, onTasksLoaded])

  if (loading) {
    return <div className="text-gray-600">Carregando recomendações...</div>
  }

  if (error) {
    return <div className="text-red-600">Erro: {error}</div>
  }

  if (recommendations.length === 0) {
    return <div className="text-gray-600">Nenhuma recomendação encontrada.</div>
  }

  return (
    <div className="space-y-6">
      {recommendations.map((task) => (
        <div key={task.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {task.tarefa_recomendada}
          </h3>
          <div className="space-y-3">
            <p className="text-gray-600">
              Baseado no framework <span className="font-medium">{task.framework_sugerido}</span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                {task.area}
              </span>
              <span className={`px-2 py-1 rounded ${
                task.score === 'Precisa Melhorar' 
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                {task.score}
              </span>
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                {task.tipo_cliente}
              </span>
            </div>
            <a
              href={task.link_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              📚 {task.nome_material}
            </a>
          </div>
        </div>
      ))}
    </div>
  )
} 