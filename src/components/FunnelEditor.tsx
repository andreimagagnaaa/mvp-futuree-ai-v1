import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  ChevronDownIcon,
  ArrowDownIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowUpIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { Funnel, Stage, FunnelTemplate } from '../types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FunnelTemplateMenu } from './FunnelTemplateMenu';
import { GapDiagnostic } from './GapDiagnostic';

interface FunnelEditorProps {
  funnel: Funnel;
  onUpdate: (funnel: Funnel) => void;
  onClose: () => void;
}

const stageTypes = {
  lead: {
    name: 'Lead',
    description: 'Potenciais clientes no topo do funil',
    icon: UserGroupIcon,
    color: 'blue'
  },
  opportunity: {
    name: 'Oportunidade',
    description: 'Leads qualificados com potencial de compra',
    icon: SparklesIcon,
    color: 'amber'
  },
  sale: {
    name: 'Venda',
    description: 'Negócios fechados e receita gerada',
    icon: CurrencyDollarIcon,
    color: 'green'
  }
};

const StageMetrics: React.FC<{ stage: Stage; index: number; isFirst: boolean }> = ({ stage, index, isFirst }) => {
  const hasConversion = !isFirst && stage.metrics?.conversionRate;
  const conversionRate = stage.metrics?.conversionRate || 0;
  const isGoodConversion = conversionRate >= 50;

  return (
    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
      <span className="flex items-center gap-1">
        <UserGroupIcon className="w-4 h-4" />
        {stage.metrics?.count || 0} leads
      </span>
      {hasConversion && (
        <span className={`flex items-center gap-1 ${isGoodConversion ? 'text-green-600' : 'text-amber-600'}`}>
          <ArrowUpIcon className="w-4 h-4" />
          {conversionRate}% conversão
        </span>
      )}
      {stage.type === 'sale' && (
        <span className="flex items-center gap-1 text-green-600">
          <CurrencyDollarIcon className="w-4 h-4" />
          R$ {stage.metrics?.revenue?.toLocaleString() || '0'}
        </span>
      )}
    </div>
  );
};

const StageProgressBar: React.FC<{ stage: Stage; totalLeads: number }> = ({ stage, totalLeads }) => {
  const percentage = totalLeads > 0 ? (stage.metrics?.count || 0) / totalLeads * 100 : 0;
  
  return (
    <div className="mt-3">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            stage.type === 'lead' ? 'bg-blue-500' :
            stage.type === 'opportunity' ? 'bg-amber-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{percentage.toFixed(1)}% do total</span>
        {stage.type === 'sale' && (
          <span>Ticket Médio: R$ {stage.metrics?.averageTicket?.toLocaleString() || '0'}</span>
        )}
      </div>
    </div>
  );
};

const FunnelEditor: React.FC<FunnelEditorProps> = ({ funnel: initialFunnel, onUpdate, onClose }) => {
  const [editingFunnel, setEditingFunnel] = useState<Funnel>({
    ...initialFunnel,
    stages: initialFunnel.stages || []
  });
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showDiagnostic, setShowDiagnostic] = useState<boolean>(false);

  const handleUpdateStage = (stageId: string | undefined, updates: Partial<Stage>) => {
    if (!stageId) return;
    setEditingFunnel((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      ),
    }));
  };

  const handleUpdateMetrics = (stageId: string, field: string, value: number) => {
    setEditingFunnel((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              metrics: {
                count: field === 'count' ? value : stage.metrics?.count || 0,
                conversionRate: field === 'conversionRate' ? value : stage.metrics?.conversionRate || 0,
                revenue: field === 'revenue' ? value : stage.metrics?.revenue || 0,
                averageTicket: field === 'averageTicket' ? value : stage.metrics?.averageTicket || 0
              }
            }
          : stage
      )
    }));
  };

  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: 'Nova Etapa',
      type: 'lead',
      metrics: {
        count: 0,
        conversionRate: 0,
        revenue: 0,
        averageTicket: 0
      }
    };

    setEditingFunnel(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }));
  };

  const handleStageClick = (stageId: string | undefined) => {
    if (!stageId) return;
    setEditingStageId(editingStageId === stageId ? null : stageId);
  };

  const handleDeleteStage = (stageId: string | undefined) => {
    if (!stageId) return;
    setEditingFunnel((prev) => ({
      ...prev,
      stages: prev.stages.filter((stage) => stage.id !== stageId),
    }));
  };

  const handleMoveStage = (fromIndex: number, toIndex: number) => {
    setEditingFunnel((prev) => {
      const newStages = [...prev.stages];
      const [movedStage] = newStages.splice(fromIndex, 1);
      if (movedStage) {
        newStages.splice(toIndex, 0, movedStage);
      }
      return { ...prev, stages: newStages };
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    
    handleMoveStage(fromIndex, toIndex);
  };

  const handleSave = async () => {
    try {
      await onUpdate(editingFunnel);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar funil:', error);
    }
  };

  const handleTemplateSelect = (template: FunnelTemplate) => {
    setEditingFunnel(prev => ({
      ...prev,
      stages: template.stages.map(stage => ({
        ...stage,
        id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block w-full max-w-5xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Editor de Funil</h3>
              <p className="mt-1 text-sm text-gray-500">Configure as etapas do seu funil de vendas</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
              >
                <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                Usar Template
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                {showMetrics ? 'Ocultar Métricas' : 'Mostrar Métricas'}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Nome do Funil */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Funil
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={editingFunnel.name}
                  onChange={(e) => setEditingFunnel({ ...editingFunnel, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Funil de Vendas B2B"
                />
                <DocumentTextIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Etapas do Funil</h4>
                <button
                  onClick={handleAddStage}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Adicionar Etapa
                </button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="stages">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {editingFunnel.stages.map((stage, index) => {
                        if (!stage.id) return null;
                        const isEditing = editingStageId === stage.id;
                        const StageIcon = stageTypes[stage.type].icon;
                        const totalLeads = editingFunnel.stages[0]?.metrics?.count || 1;
                        
                        return (
                          <Draggable key={stage.id} draggableId={stage.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                              >
                                <div className={`bg-white rounded-lg shadow-sm border ${isEditing ? 'border-blue-500' : 'border-gray-200'} transition-all duration-200`}>
                                  <div className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${
                                          stage.type === 'lead' ? 'bg-blue-100 text-blue-600' :
                                          stage.type === 'opportunity' ? 'bg-amber-100 text-amber-600' :
                                          'bg-green-100 text-green-600'
                                        }`}>
                                          <StageIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <input
                                            type="text"
                                            value={stage.name}
                                            onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                                            className="text-lg font-medium bg-transparent border-none focus:ring-0 focus:outline-none"
                                            placeholder="Nome da Etapa"
                                          />
                                          {showMetrics && <StageMetrics stage={stage} index={index} isFirst={index === 0} />}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={stage.type}
                                          onChange={(e) => handleUpdateStage(stage.id, { type: e.target.value as Stage['type'] })}
                                          className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          {Object.entries(stageTypes).map(([value, { name }]) => (
                                            <option key={value} value={value}>{name}</option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => stage.id && handleStageClick(stage.id)}
                                          className={`p-2 rounded-lg transition-colors ${
                                            isEditing ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                          }`}
                                        >
                                          <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                          onClick={() => stage.id && handleDeleteStage(stage.id)}
                                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                          <TrashIcon className="h-5 w-5" />
                                        </button>
                                      </div>
                                    </div>

                                    {showMetrics && <StageProgressBar stage={stage} totalLeads={totalLeads} />}

                                    <AnimatePresence>
                                      {isEditing && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="mt-4 pt-4 border-t border-gray-200"
                                        >
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantidade de Leads
                                              </label>
                                              <input
                                                type="number"
                                                value={stage.metrics?.count || 0}
                                                onChange={(e) => handleUpdateMetrics(stage.id!, 'count', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Taxa de Conversão (%)
                                              </label>
                                              <input
                                                type="number"
                                                value={stage.metrics?.conversionRate || 0}
                                                onChange={(e) => handleUpdateMetrics(stage.id!, 'conversionRate', Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                              />
                                            </div>
                                            {stage.type === 'sale' && (
                                              <>
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Receita Total (R$)
                                                  </label>
                                                  <input
                                                    type="number"
                                                    value={stage.metrics?.revenue || 0}
                                                    onChange={(e) => handleUpdateMetrics(stage.id!, 'revenue', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                    step="0.01"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ticket Médio (R$)
                                                  </label>
                                                  <input
                                                    type="number"
                                                    value={stage.metrics?.averageTicket || 0}
                                                    onChange={(e) => handleUpdateMetrics(stage.id!, 'averageTicket', Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                    step="0.01"
                                                  />
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </motion.div>
      </div>

      <FunnelTemplateMenu
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      <GapDiagnostic
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
      />
    </div>
  );
};

export default FunnelEditor; 