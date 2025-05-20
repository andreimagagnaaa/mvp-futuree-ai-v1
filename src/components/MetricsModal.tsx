import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Metric } from '../types/benchmarking';
import { validateMetricKey } from '../utils/benchmarking';
import { toast } from 'react-hot-toast';

interface MetricsModalProps {
  metrics: Metric[];
  onSave: (metrics: Metric[]) => void;
  onClose: () => void;
}

export const MetricsModal: React.FC<MetricsModalProps> = ({ metrics, onSave, onClose }) => {
  const [editedMetrics, setEditedMetrics] = useState<Metric[]>(metrics);
  const [newMetric, setNewMetric] = useState<Partial<Metric>>({
    name: '',
    key: '',
    type: 'number',
    isActive: true
  });

  const handleAddMetric = () => {
    if (!newMetric.name || !newMetric.key) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!validateMetricKey(newMetric.key)) {
      toast.error('A chave deve começar com uma letra e conter apenas letras, números e _');
      return;
    }

    if (editedMetrics.some(m => m.key === newMetric.key)) {
      toast.error('Já existe uma métrica com esta chave');
      return;
    }

    setEditedMetrics(prev => [...prev, {
      ...newMetric,
      id: crypto.randomUUID(),
      isActive: true,
      userId: metrics[0]?.userId || '',
    } as Metric]);

    setNewMetric({
      name: '',
      key: '',
      type: 'number',
      isActive: true
    });
  };

  const handleDeleteMetric = (id: string) => {
    const metric = editedMetrics.find(m => m.id === id);
    if (metric?.isRequired) {
      toast.error('Não é possível excluir uma métrica obrigatória');
      return;
    }
    setEditedMetrics(prev => prev.filter(m => m.id !== id));
  };

  const handleToggleMetric = (id: string) => {
    setEditedMetrics(prev => prev.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleSave = () => {
    onSave(editedMetrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        <div className="relative bg-white rounded-xl shadow-lg max-w-4xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Gerenciar Métricas</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Métricas */}
          <div className="mb-6">
            <div className="grid grid-cols-5 gap-4 mb-2 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Nome</div>
              <div className="text-sm font-medium text-gray-500">Chave</div>
              <div className="text-sm font-medium text-gray-500">Tipo</div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="text-sm font-medium text-gray-500">Ações</div>
            </div>
            <div className="space-y-2">
              {editedMetrics.map(metric => (
                <div key={metric.id} className="grid grid-cols-5 gap-4 items-center px-4 py-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-900">{metric.name}</div>
                  <div className="text-sm text-gray-600">{metric.key}</div>
                  <div className="text-sm text-gray-600">
                    {metric.type === 'percentage' ? 'Porcentagem' :
                     metric.type === 'currency' ? 'Moeda' : 'Número'}
                  </div>
                  <div>
                    <button
                      onClick={() => handleToggleMetric(metric.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        metric.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {metric.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteMetric(metric.id)}
                      disabled={metric.isRequired}
                      className={`text-red-600 hover:text-red-900 ${
                        metric.isRequired ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário de Nova Métrica */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Adicionar Nova Métrica</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Nome da métrica"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Chave (ex: marketShare)"
                  value={newMetric.key}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={newMetric.type}
                  onChange={(e) => setNewMetric(prev => ({ 
                    ...prev, 
                    type: e.target.value as Metric['type']
                  }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="number">Número</option>
                  <option value="percentage">Porcentagem</option>
                  <option value="currency">Moeda</option>
                </select>
              </div>
              <div>
                <button
                  onClick={handleAddMetric}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
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
        </div>
      </div>
    </div>
  );
}; 