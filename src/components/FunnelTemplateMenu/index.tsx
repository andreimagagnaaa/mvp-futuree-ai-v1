import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { FunnelTemplate, FunnelTemplateCategory } from '../../types';

interface FunnelTemplateMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: FunnelTemplate) => void;
}

const templateCategories: FunnelTemplateCategory[] = [
  {
    id: 'inbound',
    name: 'Marketing Inbound',
    description: 'Templates para atração e conversão de leads através de conteúdo',
    templates: [
      {
        id: 'blog-lead-gen',
        name: 'Geração de Leads via Blog',
        description: 'Funil focado em converter visitantes do blog em leads qualificados',
        category: 'inbound',
        thumbnail: '🎯',
        stages: [
          {
            id: 'visitor',
            name: 'Visitante do Blog',
            type: 'lead',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'subscriber',
            name: 'Assinante Newsletter',
            type: 'lead',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'lead',
            name: 'Lead Qualificado',
            type: 'opportunity',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'customer',
            name: 'Cliente',
            type: 'sale',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'outbound',
    name: 'Vendas Outbound',
    description: 'Templates para prospecção ativa e vendas B2B',
    templates: [
      {
        id: 'b2b-sales',
        name: 'Vendas B2B Complexas',
        description: 'Funil para vendas corporativas com ciclo longo',
        category: 'outbound',
        thumbnail: '💼',
        stages: [
          {
            id: 'prospect',
            name: 'Prospect Identificado',
            type: 'lead',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'mql',
            name: 'MQL',
            type: 'lead',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'sql',
            name: 'SQL',
            type: 'opportunity',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'proposal',
            name: 'Proposta Enviada',
            type: 'opportunity',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'negotiation',
            name: 'Em Negociação',
            type: 'opportunity',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'closed',
            name: 'Fechado Ganho',
            type: 'sale',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          }
        ]
      }
    ]
  },
  {
    id: 'pos_venda',
    name: 'Pós-Venda',
    description: 'Templates para acompanhamento e sucesso do cliente',
    templates: [
      {
        id: 'customer-success',
        name: 'Customer Success',
        description: 'Funil de acompanhamento para garantir sucesso do cliente',
        category: 'pos_venda',
        thumbnail: '🌟',
        stages: [
          {
            id: 'onboarding',
            name: 'Onboarding',
            type: 'lead',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'adoption',
            name: 'Adoção do Produto',
            type: 'opportunity',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'value',
            name: 'Valor Percebido',
            type: 'opportunity',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          },
          {
            id: 'advocate',
            name: 'Cliente Advogado',
            type: 'sale',
            metrics: { count: 0, conversionRate: 0, revenue: 0, averageTicket: 0 }
          }
        ]
      }
    ]
  }
];

export const FunnelTemplateMenu: React.FC<FunnelTemplateMenuProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<FunnelTemplate | null>(null);

  const filteredCategories = templateCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.templates.some(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSelectTemplate = (template: FunnelTemplate) => {
    setPreviewTemplate(template);
  };

  const handleConfirmTemplate = () => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl bg-white rounded-2xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Templates de Funil</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Escolha um template para iniciar seu funil com as melhores práticas
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-0 h-[600px]">
                {/* Categories */}
                <div className="col-span-3 border-r border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {category.templates.length} templates
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates */}
                <div className="col-span-5 border-r border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    {selectedCategory && (
                      <div className="space-y-4">
                        {filteredCategories
                          .find((c) => c.id === selectedCategory)
                          ?.templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => handleSelectTemplate(template)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${
                                previewTemplate?.id === template.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-2xl">{template.thumbnail}</div>
                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="mt-3">
                                <div className="font-medium text-gray-900">
                                  {template.name}
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  {template.description}
                                </div>
                              </div>
                              <div className="mt-3 flex items-center text-sm text-gray-500">
                                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                                {template.stages.length} etapas
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="col-span-4 overflow-y-auto">
                  <div className="p-4">
                    {previewTemplate ? (
                      <div>
                        <div className="text-lg font-medium text-gray-900 mb-4">
                          Prévia do Template
                        </div>
                        <div className="space-y-3">
                          {previewTemplate.stages.map((stage, index) => (
                            <div
                              key={stage.id}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                                    stage.type === 'lead'
                                      ? 'bg-blue-500'
                                      : stage.type === 'opportunity'
                                      ? 'bg-amber-500'
                                      : 'bg-green-500'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium">{stage.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {stage.type === 'lead'
                                      ? 'Lead'
                                      : stage.type === 'opportunity'
                                      ? 'Oportunidade'
                                      : 'Venda'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleConfirmTemplate}
                          className="mt-6 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                          <ArrowPathIcon className="w-5 h-5 mr-2" />
                          Usar este template
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Selecione um template para visualizar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 