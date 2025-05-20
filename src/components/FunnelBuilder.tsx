import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { funnelService, type Funnel, type FunnelStage } from '../services/funnelService';
import {
  PlusIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
  LightBulbIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import FunnelEditor from './FunnelEditor';
import { toast } from 'react-hot-toast';

interface FunnelBuilderProps {
  userId: string;
}

interface FunnelTemplate {
  name: string;
  stages: Omit<FunnelStage, 'id'>[];
}

const defaultTemplates: Record<string, FunnelTemplate> = {
  vendas: {
    name: 'Funil de Vendas',
    stages: [
      { name: 'Leads', type: 'lead', metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 } },
      { name: 'Qualificação', type: 'opportunity', metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 } },
      { name: 'Fechamento', type: 'sale', metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 } }
    ]
  },
  marketing: {
    name: 'Funil de Marketing',
    stages: [
      { name: 'Visitantes', type: 'lead', metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 } },
      { name: 'Leads', type: 'opportunity', metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 } },
      { name: 'SQLs', type: 'sale', metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 } }
    ]
  }
};

const FunnelBuilder: React.FC<FunnelBuilderProps> = ({ userId }) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  // Carregar funis do usuário
  const fetchFunnels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await funnelService.getFunnels(userId);
      setFunnels(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar os funis';
      console.error('Erro ao carregar os funis:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFunnels();
    }
  }, [userId]);

  // Criar novo funil
  const createFunnel = async (template?: FunnelTemplate) => {
    try {
      setError(null);
      const newFunnel: Omit<Funnel, 'id'> = {
        name: template ? template.name : 'Novo Funil',
        stages: template ? template.stages.map((stage, index) => ({
          ...stage,
          id: (index + 1).toString()
        })) : [
          { 
            id: '1', 
            name: 'Leads', 
            type: 'lead', 
            metrics: { 
              count: 0, 
              conversionRate: 0, 
              revenue: 0, 
              averageTicket: 0 
            } 
          },
        ],
        user_id: userId
      };

      const createdFunnel = await funnelService.createFunnel(newFunnel, userId);
      setFunnels(prev => [createdFunnel, ...prev]);
      setEditingFunnel(createdFunnel);
      toast.success('Funil criado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar funil';
      console.error('Erro ao criar funil:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Atualizar funil existente
  const updateFunnel = async (updatedFunnel: Funnel) => {
    try {
      setError(null);
      await funnelService.updateFunnel(updatedFunnel);
      setFunnels(prev => prev.map(f => 
        f.id === updatedFunnel.id ? updatedFunnel : f
      ));
      setEditingFunnel(null);
      toast.success('Funil atualizado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar funil';
      console.error('Erro ao atualizar funil:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Excluir funil
  const handleDeleteFunnel = async (funnelId: string) => {
    if (!funnelId) {
      toast.error('ID do funil não fornecido');
      return;
    }

    try {
      setIsLoading(true);
      await funnelService.deleteFunnel(funnelId, userId);
      setFunnels(funnels.filter(funnel => funnel.id !== funnelId));
      toast.success('Funil excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir funil:', error);
      toast.error('Erro ao excluir funil');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Funis de Vendas</h2>
          <p className="text-gray-600">Crie e gerencie seus funis de conversão</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => createFunnel(defaultTemplates.marketing)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <LightBulbIcon className="w-5 h-5 mr-2" />
            Usar Template Marketing
          </button>
          <button
            onClick={() => createFunnel()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Funil
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Lista de Funis */}
      {funnels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {funnels.map(funnel => (
              <motion.div
                key={funnel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{funnel.name}</h3>
                    <p className="text-sm text-gray-500">{funnel.stages.length} etapas</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingFunnel(funnel)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => funnel.id && handleDeleteFunnel(funnel.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="space-y-2">
                    {funnel.stages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        <span className="text-gray-600">{stage.name}</span>
                        {index < funnel.stages.length - 1 && (
                          <ArrowDownIcon className="w-4 h-4 mx-2 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum funil criado
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Crie seu primeiro funil de vendas para começar a acompanhar e otimizar suas conversões
          </p>
          <button
            onClick={() => createFunnel()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Criar Primeiro Funil
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {editingFunnel && (
        <FunnelEditor
          funnel={editingFunnel}
          onUpdate={updateFunnel}
          onClose={() => setEditingFunnel(null)}
        />
      )}
    </div>
  );
};

export default FunnelBuilder; 