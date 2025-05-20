import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CustomMetric } from '../../types/metrics';
import { useCustomMetrics } from '../../contexts/CustomMetricsContext';
import { PlusIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

const MetricsConfig: React.FC = () => {
  const { config, updateConfig, updateMetric, addMetric, removeMetric, reorderMetrics } = useCustomMetrics();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<CustomMetric>>({
    title: '',
    type: 'number',
    value: 0,
    category: 'custom',
    isVisible: true
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    reorderMetrics(result.source.index, result.destination.index);
  };

  const handleAddMetric = () => {
    if (!newMetric.title) return;
    addMetric(newMetric as Omit<CustomMetric, 'id'>);
    setNewMetric({
      title: '',
      type: 'number',
      value: 0,
      category: 'custom',
      isVisible: true
    });
    setShowAddForm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configurar Métricas
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Adicionar Métrica
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Título
              </label>
              <input
                type="text"
                value={newMetric.title}
                onChange={(e) => setNewMetric({ ...newMetric, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo
              </label>
              <select
                value={newMetric.type}
                onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value as CustomMetric['type'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              >
                <option value="number">Número</option>
                <option value="currency">Moeda</option>
                <option value="percentage">Porcentagem</option>
                <option value="time">Tempo</option>
                <option value="score">Score</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddMetric}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={config.layout.showRoiCalculator}
              onChange={(e) => updateConfig({
                layout: { ...config.layout, showRoiCalculator: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Mostrar Calculadora ROI
            </span>
          </label>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="metrics">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {config.metrics
                .sort((a, b) => a.order - b.order)
                .map((metric, index) => (
                  <Draggable key={metric.id} draggableId={metric.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                      >
                        <div {...provided.dragHandleProps} className="cursor-move">
                          <Bars3Icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {metric.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {metric.category} • {metric.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={metric.isVisible}
                              onChange={(e) => updateMetric(metric.id, { isVisible: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Visível
                            </span>
                          </label>
                          <button
                            onClick={() => removeMetric(metric.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default MetricsConfig; 