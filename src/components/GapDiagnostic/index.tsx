import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { DiagnosticQuestion, DiagnosticResult, ConsultationRequest } from '../../types';
import { Box, Typography, Paper, Chip, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Card, CardContent, Grid } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { AgendaModal } from '../AgendaModal';

interface GapDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'q1',
    question: 'Como você avalia a maturidade do seu processo de vendas?',
    options: [
      {
        id: 'q1_1',
        text: 'Processo bem definido, documentado e constantemente otimizado',
        weight: 1,
        gapTypes: ['processo']
      },
      {
        id: 'q1_2',
        text: 'Processo existe mas não está totalmente documentado',
        weight: 0.6,
        gapTypes: ['processo', 'documentação']
      },
      {
        id: 'q1_3',
        text: 'Processo informal ou inexistente',
        weight: 0.2,
        gapTypes: ['processo', 'documentação', 'estratégia']
      }
    ]
  },
  {
    id: 'q2',
    question: 'Como você monitora e analisa as métricas do seu funil?',
    options: [
      {
        id: 'q2_1',
        text: 'Dashboard em tempo real com KPIs e metas definidas',
        weight: 1,
        gapTypes: ['monitoramento']
      },
      {
        id: 'q2_2',
        text: 'Análise periódica sem metas claras',
        weight: 0.6,
        gapTypes: ['monitoramento', 'metas']
      },
      {
        id: 'q2_3',
        text: 'Não monitoro ou monitoro raramente',
        weight: 0.2,
        gapTypes: ['monitoramento', 'metas', 'processo']
      }
    ]
  },
  {
    id: 'q3',
    question: 'Qual é o nível de qualificação dos seus leads?',
    options: [
      {
        id: 'q3_1',
        text: 'Sistema de lead scoring implementado e validado',
        weight: 1,
        gapTypes: ['qualificação']
      },
      {
        id: 'q3_2',
        text: 'Critérios básicos de qualificação',
        weight: 0.6,
        gapTypes: ['qualificação', 'processo']
      },
      {
        id: 'q3_3',
        text: 'Sem critérios definidos',
        weight: 0.2,
        gapTypes: ['qualificação', 'processo', 'eficiência']
      }
    ]
  },
  {
    id: 'q4',
    question: 'Como você gerencia o relacionamento com leads em diferentes estágios?',
    options: [
      {
        id: 'q4_1',
        text: 'Jornada personalizada por perfil e estágio',
        weight: 1,
        gapTypes: ['nutrição']
      },
      {
        id: 'q4_2',
        text: 'Comunicação padronizada para todos',
        weight: 0.6,
        gapTypes: ['nutrição', 'personalização']
      },
      {
        id: 'q4_3',
        text: 'Sem estratégia de relacionamento',
        weight: 0.2,
        gapTypes: ['nutrição', 'personalização', 'estratégia']
      }
    ]
  },
  {
    id: 'q5',
    question: 'Qual é sua taxa média de conversão entre etapas do funil?',
    options: [
      {
        id: 'q5_1',
        text: 'Acima de 30% em todas as etapas',
        weight: 1,
        gapTypes: ['conversão']
      },
      {
        id: 'q5_2',
        text: 'Entre 10% e 30%',
        weight: 0.6,
        gapTypes: ['conversão', 'eficiência']
      },
      {
        id: 'q5_3',
        text: 'Menos de 10% ou não sei',
        weight: 0.2,
        gapTypes: ['conversão', 'eficiência', 'monitoramento']
      }
    ]
  },
  {
    id: 'q6',
    question: 'Como você identifica e resolve gargalos no funil?',
    options: [
      {
        id: 'q6_1',
        text: 'Análise contínua com ações corretivas imediatas',
        weight: 1,
        gapTypes: ['otimização']
      },
      {
        id: 'q6_2',
        text: 'Análise ocasional quando há problemas',
        weight: 0.6,
        gapTypes: ['otimização', 'processo']
      },
      {
        id: 'q6_3',
        text: 'Não há processo formal de identificação',
        weight: 0.2,
        gapTypes: ['otimização', 'processo', 'monitoramento']
      }
    ]
  },
  {
    id: 'q7',
    question: 'Qual o nível de automação do seu funil de vendas?',
    options: [
      {
        id: 'q7_1',
        text: 'Altamente automatizado com ferramentas integradas',
        weight: 1,
        gapTypes: ['automação']
      },
      {
        id: 'q7_2',
        text: 'Algumas automações básicas',
        weight: 0.6,
        gapTypes: ['automação', 'eficiência']
      },
      {
        id: 'q7_3',
        text: 'Processos majoritariamente manuais',
        weight: 0.2,
        gapTypes: ['automação', 'eficiência', 'processo']
      }
    ]
  },
  {
    id: 'q8',
    question: 'Como você trabalha a previsibilidade de vendas?',
    options: [
      {
        id: 'q8_1',
        text: 'Forecast baseado em dados históricos e tendências',
        weight: 1,
        gapTypes: ['previsibilidade']
      },
      {
        id: 'q8_2',
        text: 'Estimativas básicas sem modelo definido',
        weight: 0.6,
        gapTypes: ['previsibilidade', 'processo']
      },
      {
        id: 'q8_3',
        text: 'Não fazemos previsão de vendas',
        weight: 0.2,
        gapTypes: ['previsibilidade', 'processo', 'estratégia']
      }
    ]
  }
];

const calculateDiagnostic = (answers: Record<string, string>): DiagnosticResult => {
  const gapTypes = new Map<string, { count: number; weight: number; impact: number }>();
  let totalWeight = 0;
  let questionCount = 0;

  // Analisa as respostas e calcula os pesos
  Object.entries(answers).forEach(([questionId, optionId]) => {
    const question = diagnosticQuestions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === optionId);

    if (option) {
      option.gapTypes.forEach(type => {
        const current = gapTypes.get(type) || { count: 0, weight: 0, impact: 0 };
        const questionImpact = 1 - option.weight; // Quanto menor o weight, maior o impacto
        
        gapTypes.set(type, {
          count: current.count + 1,
          weight: current.weight + option.weight,
          impact: current.impact + questionImpact
        });
      });
      totalWeight += option.weight;
      questionCount++;
    }
  });

  // Calcula a probabilidade e impacto de cada tipo de GAP
  const gaps = Array.from(gapTypes.entries()).map(([type, data]) => {
    const probability = 1 - (data.weight / data.count);
    const normalizedImpact = data.impact / data.count;
    
    // Calcula o impacto baseado na combinação de probabilidade e impacto normalizado
    let impact: 'Alto' | 'Médio' | 'Baixo';
    const impactScore = (probability + normalizedImpact) / 2;
    
    if (impactScore > 0.7) impact = 'Alto';
    else if (impactScore > 0.4) impact = 'Médio';
    else impact = 'Baixo';

    return {
      type,
      probability,
      description: getGapDescription(type),
      impact,
      recommendations: getGapRecommendations(type)
    };
  });

  // Calcula o score geral considerando o peso das questões e o impacto dos gaps
  const overallScore = Math.round(
    (totalWeight / questionCount) * 100 * 
    (1 - Math.min(gaps.reduce((acc, gap) => acc + (gap.probability * 0.1), 0), 0.5))
  );

  // Determina se precisa de consultoria baseado em múltiplos fatores
  const needsConsultation = 
    overallScore < 70 || // Score geral baixo
    gaps.filter(g => g.impact === 'Alto').length >= 3 || // Muitos gaps de alto impacto
    gaps.some(g => g.probability > 0.8); // Gaps críticos

  return {
    gaps: gaps
      .sort((a, b) => {
        // Ordena por impacto primeiro, depois por probabilidade
        const impactOrder = { Alto: 3, Médio: 2, Baixo: 1 };
        const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
        return impactDiff !== 0 ? impactDiff : b.probability - a.probability;
      }),
    overallScore,
    needsConsultation
  };
};

const getGapDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    processo: 'Falta de processos estruturados e padronizados no funil de vendas',
    documentação: 'Ausência de documentação clara dos processos e procedimentos',
    estratégia: 'Necessidade de direcionamento estratégico mais claro',
    monitoramento: 'Deficiência no acompanhamento e análise das métricas',
    metas: 'Ausência de metas claras e mensuráveis',
    qualificação: 'Problemas na identificação e classificação de leads',
    nutrição: 'Falhas no relacionamento e nutrição de leads',
    personalização: 'Falta de personalização no tratamento dos leads',
    conversão: 'Baixa taxa de conversão entre etapas do funil',
    eficiência: 'Oportunidades de melhoria na produtividade',
    otimização: 'Necessidade de otimização contínua do funil',
    automação: 'Processos manuais que poderiam ser automatizados',
    previsibilidade: 'Dificuldade em prever resultados de vendas'
  };
  return descriptions[type] || 'Gap identificado no processo';
};

const getGapRecommendations = (type: string): string[] => {
  const recommendations: Record<string, string[]> = {
    processo: [
      'Mapear e documentar todo o processo de vendas',
      'Criar playbooks e scripts de vendas',
      'Estabelecer pontos de controle e validação',
      'Implementar metodologia de vendas'
    ],
    documentação: [
      'Criar manual de processos de vendas',
      'Documentar melhores práticas',
      'Estabelecer padrões de documentação',
      'Manter biblioteca de casos de sucesso'
    ],
    estratégia: [
      'Definir ICP (Perfil de Cliente Ideal)',
      'Estabelecer objetivos claros de vendas',
      'Alinhar vendas com objetivos do negócio',
      'Desenvolver plano estratégico de crescimento'
    ],
    monitoramento: [
      'Implementar dashboard de KPIs',
      'Estabelecer rotina de análise de métricas',
      'Criar relatórios automatizados',
      'Definir indicadores por etapa do funil'
    ],
    metas: [
      'Estabelecer metas SMART por etapa',
      'Criar sistema de acompanhamento',
      'Implementar gestão por OKRs',
      'Definir KPIs individuais e em equipe'
    ],
    qualificação: [
      'Implementar sistema de lead scoring',
      'Criar matriz de qualificação',
      'Estabelecer critérios de MQL e SQL',
      'Treinar equipe em qualificação'
    ],
    nutrição: [
      'Criar jornadas de nutrição personalizadas',
      'Implementar automação de marketing',
      'Desenvolver conteúdo relevante',
      'Estabelecer pontos de contato estratégicos'
    ],
    personalização: [
      'Segmentar base de leads',
      'Criar personas detalhadas',
      'Personalizar comunicação por perfil',
      'Implementar triggers comportamentais'
    ],
    conversão: [
      'Analisar pontos de atrito no funil',
      'Otimizar material de vendas',
      'Testar diferentes abordagens',
      'Implementar testes A/B'
    ],
    eficiência: [
      'Identificar e eliminar gargalos',
      'Automatizar tarefas repetitivas',
      'Otimizar processos internos',
      'Implementar ferramentas de produtividade'
    ],
    otimização: [
      'Estabelecer processo de melhoria contínua',
      'Realizar análises periódicas',
      'Coletar feedback da equipe',
      'Implementar ciclos de otimização'
    ],
    automação: [
      'Mapear processos automatizáveis',
      'Implementar CRM robusto',
      'Integrar ferramentas de vendas',
      'Automatizar follow-ups'
    ],
    previsibilidade: [
      'Implementar modelo de forecast',
      'Criar pipeline de oportunidades',
      'Estabelecer métricas preditivas',
      'Desenvolver análise de tendências'
    ]
  };
  return recommendations[type] || ['Avaliar processo atual', 'Identificar pontos de melhoria'];
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  return '#f44336';
};

const DiagnosticResults: React.FC<{ results: DiagnosticResult }> = ({ results }) => {
  const [showAgendaModal, setShowAgendaModal] = useState(false);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* GAPs Identificados */}
      <Typography variant="h5" gutterBottom sx={{ 
        mb: 4,
        fontWeight: 700,
        color: '#2C6CEE',
        fontSize: '1.5rem'
      }}>
        GAPs Identificados
      </Typography>

      {results.gaps.map((gap, index) => (
        <Card key={index} sx={{ 
          mb: 3,
          border: '1px solid',
          borderColor: 'rgba(44, 108, 238, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(44, 108, 238, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 12px rgba(44, 108, 238, 0.1)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid component="div" sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Tipo: ${gap.type}`}
                    sx={{ 
                      borderRadius: '8px',
                      fontWeight: 600,
                      backgroundColor: '#2C6CEE',
                      color: 'white',
                      fontSize: '0.875rem',
                      height: '32px'
                    }}
                  />
                  <Chip 
                    label={`Impacto: ${gap.impact}`}
                    sx={{ 
                      borderRadius: '8px',
                      fontWeight: 600,
                      backgroundColor: gap.impact === 'Alto' ? '#2C6CEE' : 
                                     gap.impact === 'Médio' ? '#2C6CEE' : '#2C6CEE',
                      opacity: gap.impact === 'Alto' ? 1 : 
                              gap.impact === 'Médio' ? 0.8 : 0.6,
                      color: 'white',
                      fontSize: '0.875rem',
                      height: '32px'
                    }}
                  />
                  <Chip 
                    label={`Probabilidade: ${(gap.probability * 100).toFixed(0)}%`}
                    sx={{ 
                      borderRadius: '8px',
                      fontWeight: 600,
                      backgroundColor: '#2C6CEE',
                      color: 'white',
                      fontSize: '0.875rem',
                      height: '32px'
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid component="div" sx={{ width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: '#2C6CEE',
                    fontSize: '1.125rem',
                    mb: 2
                  }}
                >
                  Descrição
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ 
                    color: '#334155',
                    lineHeight: 1.6,
                    fontSize: '1rem'
                  }}
                >
                  {gap.description}
                </Typography>
              </Grid>

              <Grid component="div" sx={{ width: '100%' }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: '#2C6CEE',
                    fontSize: '1.125rem',
                    mb: 2
                  }}
                >
                  Recomendações
                </Typography>
                <Box 
                  component="ul" 
                  sx={{ 
                    mt: 0,
                    listStyleType: 'none',
                    pl: 0
                  }}
                >
                  {gap.recommendations.map((rec, idx) => (
                    <Typography 
                      component="li" 
                      key={idx}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                        color: '#334155',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        '&:before': {
                          content: '""',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#2C6CEE',
                          flexShrink: 0
                        }
                      }}
                    >
                      {rec}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* Resultado do Diagnóstico */}
      <Card sx={{ 
        mt: 4,
        background: 'linear-gradient(135deg, #2C6CEE 0%, #2C6CEE 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        boxShadow: '0 10px 20px rgba(44, 108, 238, 0.1)',
        textAlign: 'center'
      }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 70%)',
          }}
        />
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 700,
            mb: 3,
            fontSize: '2rem',
            background: 'linear-gradient(to right, #fff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Resultado do Diagnóstico
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ 
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '4px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              mb: 2
            }}>
              {results.overallScore.toFixed(0)}%
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem',
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 1
              }}>
                Pontuação Geral
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.8,
                fontSize: '1rem'
              }}>
                {results.overallScore >= 80 ? 'Excelente' : 
                 results.overallScore >= 60 ? 'Bom' : 'Precisa de Atenção'}
              </Typography>
            </Box>
          </Box>

          <button
            onClick={() => setShowAgendaModal(true)}
            className="w-full max-w-md px-6 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-lg text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-white border-opacity-20"
          >
            <CalendarDaysIcon className="w-5 h-5" />
            Agendar Reunião
          </button>
        </CardContent>
      </Card>

      <AgendaModal
        isOpen={showAgendaModal}
        onClose={() => setShowAgendaModal(false)}
      />
    </Box>
  );
};

export const GapDiagnostic: React.FC<GapDiagnosticProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [consultationData, setConsultationData] = useState<Partial<ConsultationRequest>>({});

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    if (currentStep < diagnosticQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const result = calculateDiagnostic(answers);
      setDiagnosticResult(result);
    }
  };

  const handleConsultationSubmit = () => {
    console.log('Consultation Request:', {
      ...consultationData,
      diagnosticResult
    });
    onClose();
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
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Diagnóstico de GAPs</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {!diagnosticResult
                      ? `Pergunta ${currentStep + 1} de ${diagnosticQuestions.length}`
                      : 'Resultado da Análise'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-lg"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!diagnosticResult ? (
                  // Questionário
                  <div>
                    <div className="mb-6">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${((currentStep + 1) / diagnosticQuestions.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-medium text-gray-900 mb-4">
                      {diagnosticQuestions[currentStep].question}
                    </h3>

                    <div className="space-y-3">
                      {diagnosticQuestions[currentStep].options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer(diagnosticQuestions[currentStep].id, option.id)}
                          className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3" />
                            <span>{option.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Resultado e CTA
                  <div>
                    <div className="mb-8">
                      <DiagnosticResults results={diagnosticResult} />
                    </div>

                    {diagnosticResult.needsConsultation && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                        <button
                          onClick={handleConsultationSubmit}
                          className="w-full px-4 py-3 bg-[#2C6CEE] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
                        >
                          Agendar Reunião
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 