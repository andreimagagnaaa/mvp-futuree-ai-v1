import React from 'react'
import { useRecommendedTasks, type TaskRecommendation } from '../hooks/useRecommendedTasks'

interface TasksTabProps {
  clientType: 'B2B' | 'B2C'
  areaScores: Array<{
    area: string
    score: 'Precisa Melhorar' | 'Bom'
  }>
}

export function TasksTab({ clientType, areaScores }: TasksTabProps) {
  const { recommendations, loading, error } = useRecommendedTasks({
    clientType,
    areaScores
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Carregando tarefas recomendadas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">
          Erro ao carregar tarefas: {error}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">
          Nenhuma tarefa recomendada encontrada para suas áreas avaliadas.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Tarefas Recomendadas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((task: TaskRecommendation) => (
          <div 
            key={task.id} 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 transition-colors"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {task.tarefa_recomendada}
              </h3>
              
              <div className="space-y-4 flex-grow">
                <p className="text-gray-600">
                  Baseado no framework <span className="font-medium">{task.framework_sugerido}</span>
                </p>

                <div className="flex flex-wrap gap-2 text-sm">
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
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
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
          </div>
        ))}
      </div>
    </div>
  )
} 