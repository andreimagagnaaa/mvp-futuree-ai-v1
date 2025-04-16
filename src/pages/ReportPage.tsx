import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ChartBarIcon, BoltIcon, RocketLaunchIcon, ArrowPathIcon, ClockIcon, ExclamationTriangleIcon, StarIcon, CheckCircleIcon, ExclamationCircleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Rocket } from "lucide-react";
import { Tab } from '@headlessui/react';
import { AgendaModal } from "../components/AgendaModal";

interface DiagnosticData {
  completedAt: any;
  answers: Record<string, string>;
  scores: Record<string, number>;
  totalScore: number;
  recommendations: string[];
  insights: string[];
  previousScore?: number | null;
  impactMetrics?: {
    financial: {
      roi: number;
      costSavings: number;
    };
    operational: {
      efficiency: number;
      quality: number;
    };
  };
}

interface UserData {
  name: string;
  email: string;
  hasCompletedDiagnostic: boolean;
  diagnostic: DiagnosticData;
}

interface TabOption {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface MetricClassification {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

interface ProgressCardProps {
  lastDiagnosticDate: Date | null;
  score: number;
  isFirstDiagnostic: boolean;
}

const areas = {
  "Geração de Leads": {
    icon: ChartBarIcon,
    description: "Capacidade de atrair e captar potenciais clientes"
  },
  "Conversão": {
    icon: RocketLaunchIcon,
    description: "Eficiência em transformar leads em clientes"
  },
  "Canais de Aquisição": {
    icon: BoltIcon,
    description: "Diversidade e eficácia dos canais de marketing"
  },
  "Conteúdo": {
    icon: ChartBarIcon,
    description: "Qualidade e estratégia de conteúdo"
  },
  "CRM e Relacionamento": {
    icon: ChartBarIcon,
    description: "Gestão do relacionamento com clientes"
  },
  "Análise de Dados": {
    icon: ChartBarIcon,
    description: "Uso de dados para tomada de decisão"
  },
  "Presença Digital": {
    icon: ChartBarIcon,
    description: "Força da marca no ambiente digital"
  },
  "Automações": {
    icon: ChartBarIcon,
    description: "Nível de automação dos processos"
  }
} as const;

const tabs: TabOption[] = [
  { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
  { id: 'areas', label: 'Áreas', icon: BoltIcon },
  { id: 'tasks', label: 'Tarefas', icon: RocketLaunchIcon }
];

const getMetricClassification = (score: number, type: string): MetricClassification => {
  const classifications = {
    growth: [
      { threshold: 7, label: 'Crescimento Acelerado', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Crescimento expressivo' },
      { threshold: 5, label: 'Em Crescimento', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Crescimento moderado' },
      { threshold: -Infinity, label: 'Sem Crescimento', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Necessita atenção' }
    ],
    strength: [
      { threshold: 7, label: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Muitos pontos fortes' },
      { threshold: 5, label: 'Regular', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Alguns pontos fortes' },
      { threshold: 3, label: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Necessita melhorias urgentes' }
    ],
    attention: [
      { threshold: 7, label: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Muitas áreas precisam de atenção' },
      { threshold: 5, label: 'Em Atenção', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Algumas áreas precisam de atenção' },
      { threshold: 3, label: 'Otimizado', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Áreas bem gerenciadas' }
    ],
    efficiency: [
      { threshold: 8, label: 'Avançado', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Processos otimizados' },
      { threshold: 6, label: 'Intermediário', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Processos em desenvolvimento' },
      { threshold: 3, label: 'Básico', color: 'text-gray-600', bgColor: 'bg-gray-50', description: 'Processos básicos' }
    ],
    engagement: [
      { threshold: 8, label: 'Alto', color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'Forte presença digital' },
      { threshold: 6, label: 'Médio', color: 'text-purple-400', bgColor: 'bg-purple-50', description: 'Presença moderada' },
      { threshold: 3, label: 'Baixo', color: 'text-purple-300', bgColor: 'bg-purple-50', description: 'Presença limitada' }
    ],
    automation: [
      { threshold: 8, label: 'Avançada', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Altamente automatizado' },
      { threshold: 6, label: 'Parcial', color: 'text-orange-400', bgColor: 'bg-orange-50', description: 'Parcialmente automatizado' },
      { threshold: 3, label: 'Básica', color: 'text-orange-300', bgColor: 'bg-orange-50', description: 'Processos manuais' }
    ]
  };

  const list = classifications[type as keyof typeof classifications];
  for (const item of list) {
    if (score >= item.threshold) {
      return {
        label: item.label,
        color: item.color,
        bgColor: item.bgColor,
        description: item.description
      };
    }
  }
  return list[list.length - 1];
};

const calculateMetrics = (scores: Record<string, number> = {}) => {
  // Lista completa de todas as áreas esperadas
  const expectedAreas = [
    'Geração de Leads',
    'Conversão',
    'Canais de Aquisição',
    'Conteúdo',
    'CRM e Relacionamento',
    'Análise de Dados',
    'Presença Digital',
    'Automações'
  ];

  console.log('Scores recebidos:', scores);

  // Se não houver scores ou estiver vazio, retorna valores zerados
  if (!scores || Object.keys(scores).length === 0) {
    console.log('Nenhum score encontrado, retornando zeros');
    return {
      monthlyGrowth: 0,
      strongAreas: 0,
      weakAreas: expectedAreas.length,
      efficiency: 0,
      engagement: 0,
      automation: 0,
      totalScore: 0
    };
  }

  // Normaliza os scores para garantir que todas as áreas esperadas tenham um valor
  const normalizedScores = expectedAreas.reduce((acc, area) => {
    acc[area] = scores[area] || 0;
    return acc;
  }, {} as Record<string, number>);

  console.log('Scores normalizados:', normalizedScores);

  // Cálculo de áreas fortes (score >= 7) e fracas (score < 5)
  const strongAreas = expectedAreas.reduce((count, area) => {
    const score = normalizedScores[area];
    return count + (score >= 7 ? 1 : 0);
  }, 0);

  const weakAreas = expectedAreas.reduce((count, area) => {
    const score = normalizedScores[area];
    return count + (score < 5 ? 1 : 0);
  }, 0);

  // Cálculo do score total (soma direta dos scores)
  const totalScore = expectedAreas.reduce((sum, area) => sum + normalizedScores[area], 0);
  console.log('Score total calculado:', totalScore);

  // Cálculo de eficiência operacional (média dos scores)
  const avgEfficiency = totalScore / expectedAreas.length;

  // Cálculo de engajamento digital
  const digitalAreas = ['Presença Digital', 'Conteúdo', 'Canais de Aquisição'];
  const digitalScore = digitalAreas.reduce((sum, area) => sum + (normalizedScores[area] || 0), 0) / digitalAreas.length;

  // Cálculo de automação
  const automationScore = normalizedScores['Automações'] || 0;

  // Cálculo do crescimento mensal
  const monthlyGrowth = calculateMonthlyGrowth(normalizedScores);

  const metrics = {
    monthlyGrowth,
    strongAreas,
    weakAreas,
    efficiency: avgEfficiency,
    engagement: digitalScore,
    automation: automationScore,
    totalScore: totalScore // Usando o score total sem normalização
  };

  console.log('Métricas calculadas:', metrics);
  return metrics;
};

// Função auxiliar para calcular o crescimento mensal
const calculateMonthlyGrowth = (scores: Record<string, number>) => {
  const weights = {
    'Geração de Leads': 0.3,
    'Conversão': 0.3,
    'Canais de Aquisição': 0.2,
    'CRM e Relacionamento': 0.2
  };

  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([area, weight]) => {
    if (scores[area] !== undefined) {
      // Normaliza o score para uma escala de 0-100 para o cálculo de crescimento
      const normalizedScore = ((scores[area] - 3) / 7) * 100;
      weightedSum += normalizedScore * weight;
      totalWeight += weight;
    }
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
};

const calculateImpactMetrics = (scores: Record<string, number> = {}) => {
  if (!scores || Object.keys(scores).length === 0) {
    return {
      financial: {
        roi: 100,
        costSavings: 100
      },
      operational: {
        efficiency: 100,
        quality: 100
      }
    };
  }

  // Calcula o score médio na escala de 3-10
  const baseScore = Object.values(scores).reduce((acc, score) => acc + score, 0) / Object.values(scores).length;
  
  // Normaliza o score para uma escala de 0-1 para o cálculo de impacto
  const normalizedScore = (baseScore - 3) / 7;
  
  // Calcula o impacto com base no score normalizado
  const impact = Math.round((1 - normalizedScore) * 100);
  
  return {
    financial: {
      roi: Math.max(impact, 70),
      costSavings: Math.max(impact, 70)
    },
    operational: {
      efficiency: Math.max(impact, 70),
      quality: Math.max(impact, 70)
    }
  };
};

const ProgressCard: React.FC<ProgressCardProps> = ({ lastDiagnosticDate, score, isFirstDiagnostic }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 56) return { // 7 * 8 = 56 (70% de 80)
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      progress: 'bg-green-500',
      hover: 'hover:bg-green-600'
    };
    if (score >= 40) return { // 5 * 8 = 40 (50% de 80)
      text: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      progress: 'bg-yellow-500',
      hover: 'hover:bg-yellow-600'
    };
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      progress: 'bg-red-500',
      hover: 'hover:bg-red-600'
    };
  };

  const scoreColors = getScoreColor(score);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!lastDiagnosticDate) return '';

      const nextDiagnosticDate = new Date(lastDiagnosticDate);
      nextDiagnosticDate.setDate(nextDiagnosticDate.getDate() + 10);
      
      const now = new Date();
      const difference = nextDiagnosticDate.getTime() - now.getTime();
      
      if (difference <= 0) return 'Disponível agora';

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [lastDiagnosticDate]);

  const isNewDiagnosticAvailable = !lastDiagnosticDate || 
    (new Date().getTime() - lastDiagnosticDate.getTime()) >= (10 * 24 * 60 * 60 * 1000);

  const getStatusMessage = () => {
    if (isFirstDiagnostic) return 'Primeiro diagnóstico realizado';
    if (score >= 56) return 'Excelente progresso!';
    if (score >= 40) return 'Bom progresso';
    return 'Necessita atenção';
  };

  return (
    <div className={`rounded-xl p-6 border ${scoreColors.border} ${scoreColors.bg}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${scoreColors.bg} border ${scoreColors.border}`}>
            <ChartBarIcon className={`w-6 h-6 ${scoreColors.text}`} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Seu Progresso</h2>
            <p className="text-sm text-gray-500">
              Último diagnóstico: {lastDiagnosticDate?.toLocaleDateString() || 'Nenhum'}
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-lg p-6 border ${scoreColors.border} bg-white mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Status Atual</span>
          <span className={`text-sm font-medium ${scoreColors.text}`}>{getStatusMessage()}</span>
        </div>
        <div className="flex items-baseline space-x-2 mb-4">
          <span className={`text-4xl font-bold ${scoreColors.text}`}>{score}</span>
          <span className="text-sm text-gray-600">pontos</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(score / 80) * 100}%` }}
            transition={{ duration: 1 }}
            className={`h-3 rounded-full ${scoreColors.progress}`}
          />
        </div>
      </div>

      {!isNewDiagnosticAvailable && (
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Próximo diagnóstico em</p>
              <p className="text-lg font-bold text-gray-600">{timeLeft}</p>
            </div>
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/diagnostic')}
        disabled={!isNewDiagnosticAvailable}
        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
          isNewDiagnosticAvailable
            ? `bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 ${scoreColors.hover}`
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ArrowPathIcon className="w-5 h-5" />
        <span className="font-medium">
          {isNewDiagnosticAvailable ? 'Iniciar Novo Diagnóstico' : 'Aguarde para novo diagnóstico'}
        </span>
      </motion.button>
    </div>
  );
};

// Função auxiliar para calcular a porcentagem da barra
const calculateBarPercentage = (score: number, isTotal: boolean = false) => {
  if (isTotal) {
    // Para o score total (máximo 80)
    return Math.min((score / 80) * 100, 100);
  } else {
    // Para scores individuais (máximo 10)
    return Math.min((score / 10) * 100, 100);
  }
};

export default function ReportPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 7) return 'bg-green-100';
    if (score >= 5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'Excelente';
    if (score >= 5) return 'Bom';
    return 'Precisa Melhorar';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendation = (area: string, score: number) => {
    if (score < 7) {
      switch (area) {
        case "Geração de Leads":
          return "Implemente estratégias básicas de captação de leads e comece a construir sua base de dados.";
        case "Conversão":
          return "Analise seus pontos de contato e identifique onde estão as principais perdas de conversão.";
        case "Canais de Aquisição":
          return "Diversifique seus canais de marketing e comece testando novas plataformas.";
        case "Conteúdo":
          return "Desenvolva um calendário editorial básico e comece a produzir conteúdo regularmente.";
        case "CRM e Relacionamento":
          return "Implemente um sistema básico de CRM para começar a organizar seus contatos.";
        case "Análise de Dados":
          return "Comece a coletar e analisar dados básicos de performance.";
        case "Presença Digital":
          return "Fortaleça sua presença nas principais redes sociais e mantenha consistência.";
        case "Automações":
          return "Identifique processos repetitivos que podem ser automatizados.";
        default:
          return "Desenvolva uma estratégia básica para esta área.";
      }
    }
    return "";
  };

    const loadUserData = async () => {
      if (!currentUser) {
      console.log("Usuário não autenticado, redirecionando...");
        navigate("/");
        return;
      }

      try {
      console.log("Carregando dados do usuário...");
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
        console.log("Documento do usuário não encontrado");
        setError("Dados do usuário não encontrados");
          return;
        }

      const data = userDoc.data() as UserData;
      console.log("Dados brutos do diagnóstico:", data.diagnostic);

      if (!data.hasCompletedDiagnostic) {
        console.log("Usuário sem diagnóstico, redirecionando...");
          navigate("/diagnostic");
          return;
        }

      // Garante que todos os dados necessários estejam presentes
      const diagnostic = {
        ...data.diagnostic,
        scores: data.diagnostic?.scores || {},
        totalScore: data.diagnostic?.totalScore || 0,
        completedAt: data.diagnostic?.completedAt || null,
        previousScore: data.diagnostic?.previousScore || null,
        recommendations: data.diagnostic?.recommendations || [],
        insights: data.diagnostic?.insights || []
      };

      console.log("Scores do diagnóstico:", diagnostic.scores);
      console.log("Score total do diagnóstico:", diagnostic.totalScore);

      setUserData({
        ...data,
        diagnostic
      });

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados do relatório");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUserData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Carregando seu relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData?.diagnostic || !userData?.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Nenhum diagnóstico encontrado</div>
      </div>
    );
  }

  const { diagnostic, name } = userData;
  const { scores = {}, totalScore = 0, completedAt } = diagnostic;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        const metrics = calculateMetrics(diagnostic?.scores);
        const impactMetrics = calculateImpactMetrics(diagnostic?.scores);
        const growthClass = getMetricClassification(metrics.monthlyGrowth, 'growth');
        const strengthClass = getMetricClassification(metrics.strongAreas, 'strength');
        const attentionClass = getMetricClassification(metrics.weakAreas, 'attention');
        const efficiencyClass = getMetricClassification(metrics.efficiency, 'efficiency');
        const engagementClass = getMetricClassification(metrics.engagement, 'engagement');
        const automationClass = getMetricClassification(metrics.automation, 'automation');

        // Lista completa de áreas esperadas
        const areasEsperadas = [
          'Geração de Leads',
          'Conversão',
          'Canais de Aquisição',
          'Conteúdo',
          'CRM e Relacionamento',
          'Análise de Dados',
          'Presença Digital',
          'Automações'
        ];

        // Função para obter áreas com score ou sem score (considerando como 0)
        const getAreasComScore = (minScore: number, maxScore: number) => {
          const areasComScore = areasEsperadas.map(area => {
            const score = scores[area] || 0;
            return [area, score] as [string, number];
          });

          return areasComScore
            .filter(([_, score]) => score >= minScore && score <= maxScore)
            .sort((a, b) => a[1] - b[1]); // Ordem crescente para áreas em atenção
        };

        // Áreas em atenção (score < 50 ou sem score)
        const areasEmAtencao = getAreasComScore(0, 49);
        // Áreas em destaque (score >= 80)
        const areasDestaque = getAreasComScore(80, 100);

        const handleVerTodas = () => {
          const tabsElement = document.querySelector('[role="tablist"]');
          const areasTab = Array.from(tabsElement?.children || []).find(
            (tab) => tab.textContent?.includes('Áreas')
          ) as HTMLElement;
          
          if (areasTab) {
            areasTab.click();
          }
        };

        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna Principal - Score */}
              <div className="md:col-span-1 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-3 rounded-xl ${
                    totalScore >= 56 ? 'bg-green-50' : // 7 * 8 = 56 (7 é o threshold para Excelente)
                    totalScore >= 40 ? 'bg-yellow-50' : // 5 * 8 = 40 (5 é o threshold para Bom)
                    'bg-red-50'
                  }`}>
                    <ChartBarIcon className={`w-6 h-6 ${getScoreColor(totalScore/8)}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Score Geral</h3>
                    <p className="text-sm text-gray-500">Avaliação completa do seu desempenho</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-between min-h-[280px]">
                  {/* Score e Label */}
                  <div className="text-center flex-1 flex flex-col items-center justify-center">
                    <div className={`text-8xl font-bold tracking-tight ${getScoreColor(totalScore/8)}`}>
                      {totalScore}
                    </div>
                    <div className={`text-xl font-semibold mt-3 ${getScoreColor(totalScore/8)}`}>
                      {getScoreLabel(totalScore/8)}
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="w-full space-y-4 mt-6">
                    {/* Barra de Progresso */}
                    <div className="w-full">
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateBarPercentage(totalScore, true)}%` }}
                          transition={{ duration: 1 }}
                          className={`h-3 rounded-full transition-all duration-500 ${
                            totalScore >= 56 ? 'bg-green-500' :
                            totalScore >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Status e Data */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          totalScore >= 56 ? 'bg-green-500' :
                          totalScore >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-gray-600">Status atual</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        Última atualização: {completedAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>

                    {/* Dicas ou Mensagem */}
                    <div className={`p-3 rounded-lg ${
                      totalScore >= 56 ? 'bg-green-50 text-green-700' :
                      totalScore >= 40 ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      <p className="text-sm">
                        {totalScore >= 56 ? 'Excelente! Continue mantendo o alto desempenho.' :
                         totalScore >= 40 ? 'Bom trabalho! Foque em melhorar ainda mais.' :
                         'Identifique áreas prioritárias para melhorar seu desempenho.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Central - Métricas */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Evolução Mensal */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Evolução Mensal</h4>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${
                        metrics.monthlyGrowth >= 7 ? 'text-green-600' :
                        metrics.monthlyGrowth >= 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {metrics.monthlyGrowth}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{growthClass.description}</p>
                </div>

                {/* Áreas Fortes */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Áreas Fortes</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{metrics.strongAreas}</span>
                      <span className={`text-sm ${strengthClass.color} ${strengthClass.bgColor} px-2 py-1 rounded-full`}>
                        {strengthClass.label}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(metrics.strongAreas / 8) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strengthClass.description}</p>
                </div>

                {/* Áreas de Atenção */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Áreas de Atenção</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">{metrics.weakAreas}</span>
                      <span className={`text-sm ${attentionClass.color} ${attentionClass.bgColor} px-2 py-1 rounded-full`}>
                        {attentionClass.label}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(metrics.weakAreas / 8) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{attentionClass.description}</p>
                </div>

                {/* Eficiência Operacional */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Eficiência Operacional</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-600">{efficiencyClass.label}</span>
                      <span className={`text-sm ${efficiencyClass.color} ${efficiencyClass.bgColor} px-2 py-1 rounded-full`}>
                        {Math.round(metrics.efficiency)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${calculateBarPercentage(metrics.efficiency)}%` }}
                    />
                  </div>
                </div>

                {/* Engajamento Digital */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Engajamento Digital</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600">{engagementClass.label}</span>
                      <span className={`text-sm ${engagementClass.color} ${engagementClass.bgColor} px-2 py-1 rounded-full`}>
                        {Math.round(metrics.engagement)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${calculateBarPercentage(metrics.engagement)}%` }}
                    />
                  </div>
                </div>

                {/* Automação */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-600">Automação</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">{automationClass.label}</span>
                      <span className={`text-sm ${automationClass.color} ${automationClass.bgColor} px-2 py-1 rounded-full`}>
                        {Math.round(metrics.automation)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${calculateBarPercentage(metrics.automation)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card de Progresso */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ProgressCard
                lastDiagnosticDate={diagnostic?.completedAt?.toDate() || null}
                score={totalScore}
                isFirstDiagnostic={!diagnostic?.previousScore}
              />
            </div>

            {/* Cards de Áreas em Atenção e Destaque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card de Áreas em Atenção */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="border-l-4 border-red-500 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-red-50">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Áreas em Atenção</h3>
                        <p className="text-sm text-gray-500">
                          {areasEmAtencao.length} {areasEmAtencao.length === 1 ? 'área precisa' : 'áreas precisam'} de atenção
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleVerTodas}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      Ver todas
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {Object.entries(scores)
                    .filter(([area]) => area !== 'Perfil do Cliente')
                    .filter(([_, score]) => score < 7)
                    .sort((a, b) => a[1] - b[1])
                    .map(([area, score]) => (
                      <div key={area} className="bg-red-50 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                        <span className="text-sm font-bold text-red-600">{score.toFixed(1)}</span>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Card de Áreas em Destaque */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="border-l-4 border-green-500 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-50">
                        <StarIcon className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Áreas em Destaque</h3>
                        <p className="text-sm text-gray-500">
                          {Object.values(scores).filter(score => score >= 8).length} {Object.values(scores).filter(score => score >= 8).length === 1 ? 'área se destaca' : 'áreas se destacam'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleVerTodas}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      Ver todas
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {Object.entries(scores)
                    .filter(([area]) => area !== 'Perfil do Cliente')
                    .filter(([_, score]) => score >= 8)
                    .sort((a, b) => b[1] - a[1])
                    .map(([area, score]) => (
                      <div key={area} className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                        <span className="text-sm font-bold text-green-600">{score.toFixed(1)}</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            </div>

            {/* Cards de Impacto Potencial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Card Financeiros */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-xl bg-green-50">
                    <ChartBarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Financeiros</h3>
                    <p className="text-sm text-gray-500">Impacto potencial nos resultados</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">ROI Potencial</span>
                      <span className="text-2xl font-bold text-green-600">+{impactMetrics.financial.roi}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateBarPercentage(impactMetrics.financial.roi, true)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Economia de Custos</span>
                      <span className="text-2xl font-bold text-purple-600">-{impactMetrics.financial.costSavings}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateBarPercentage(impactMetrics.financial.costSavings, true)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Operacionais */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-xl bg-blue-50">
                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Operacionais</h3>
                    <p className="text-sm text-gray-500">Impacto potencial nos processos</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Eficiência</span>
                      <span className="text-2xl font-bold text-blue-600">+{impactMetrics.operational.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateBarPercentage(impactMetrics.operational.efficiency, true)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Qualidade</span>
                      <span className="text-2xl font-bold text-indigo-600">+{impactMetrics.operational.quality}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${calculateBarPercentage(impactMetrics.operational.quality, true)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Tendências */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {/* Card de Tendências - 3 colunas */}
              <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-xl bg-yellow-50">
                    <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Análise de Tendências</h3>
                    <p className="text-sm text-gray-500">Principais indicadores de crescimento</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Crescimento do Mercado */}
                  <div className="bg-yellow-50/50 rounded-xl p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Crescimento do Mercado</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-gray-900">+35%</span>
                        <span className="text-sm text-gray-500 ml-1">último ano</span>
                      </div>
                    </div>
                  </div>

                  {/* Aumento nas Vendas */}
                  <div className="bg-yellow-50/50 rounded-xl p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Aumento nas Vendas</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-gray-900">+29%</span>
                        <span className="text-sm text-gray-500 ml-1">com CRM integrado</span>
                      </div>
                    </div>
                  </div>

                  {/* Fonte Principal de Leads B2B */}
                  <div className="bg-yellow-50/50 rounded-xl p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Fonte Principal de Leads B2B</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-gray-900">Founder-led growth</span>
                        <span className="text-sm text-gray-500 ml-1">em 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Últimos Cards - Growth Score e Tendências 2025 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Card de Growth Score */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <RocketLaunchIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Growth Score</h3>
                    <p className="text-sm text-gray-500">Análise do potencial de crescimento</p>
                  </div>
                </div>

                <div className="mt-8">
                  {/* Calculando a média das pontuações, excluindo a pergunta de perfil */}
                  {(() => {
                    const validScores = Object.entries(scores)
                      .filter(([area]) => area !== 'Perfil do Cliente')
                      .map(([_, score]) => score);
                    
                    const growthScore = validScores.length > 0
                      ? validScores.reduce((acc, score) => acc + score, 0) / validScores.length
                      : 0;

                    const formattedScore = growthScore.toFixed(1);
                    
                    return (
                      <>
                        <div className="text-[40px] font-bold text-green-500">
                          {formattedScore}
                        </div>
                        <div className="text-lg font-medium text-green-500 mt-1">
                          {growthScore >= 7 ? 'Crescimento Acelerado' :
                           growthScore >= 5 ? 'Crescimento Moderado' :
                           'Crescimento Inicial'}
                        </div>
                        {/* Barra de progresso com largura proporcional ao score (considerando 10 como máximo) */}
                        <div className="relative w-24 h-1.5 bg-gray-100 rounded-full mt-2">
                          <div 
                            className="absolute left-0 h-1.5 bg-green-500 rounded-full"
                            style={{ width: `${(growthScore) * 10}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Potencial de Mercado</span>
                    <span className="text-sm font-medium text-green-500">
                      {(() => {
                        const marketScore = scores['Geração de Leads'] || 0;
                        return marketScore >= 7 ? 'Alto' :
                               marketScore >= 5 ? 'Médio' :
                               'Em Desenvolvimento';
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Maturidade Digital</span>
                    <span className="text-sm font-medium text-green-500">
                      {(() => {
                        const digitalScore = (
                          (scores['Presença Digital'] || 0) +
                          (scores['Automações'] || 0) +
                          (scores['Análise de Dados'] || 0)
                        ) / 3;
                        return digitalScore >= 7 ? 'Avançada' :
                               digitalScore >= 5 ? 'Intermediária' :
                               'Básica';
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Velocidade de Execução</span>
                    <span className="text-sm font-medium text-green-500">
                      {(() => {
                        const execScore = (
                          (scores['CRM e Relacionamento'] || 0) +
                          (scores['Automações'] || 0)
                        ) / 2;
                        return execScore >= 7 ? 'Rápida' :
                               execScore >= 5 ? 'Moderada' :
                               'Em Evolução';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Tendências 2025 */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <BoltIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Tendências 2025 e Média de Mercado</h3>
                    <p className="text-sm text-gray-500">Tendências para 2025</p>
                  </div>
                </div>

                <div className="mt-8 bg-purple-50 rounded-xl p-6">
                  <div className="space-y-6">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-purple-700 font-medium">IA Generativa</span>
                      </div>
                      <div className="text-purple-600 font-semibold">
                        +45% de adoção
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-purple-700 font-medium">Automação de Vendas</span>
                      </div>
                      <div className="text-purple-600 font-semibold">
                        +38%
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-purple-700 font-medium">Marketing Conversacional</span>
                      </div>
                      <div className="text-purple-600 font-semibold">
                        +52%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'areas':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(scores)
              .filter(([area]) => area !== 'Perfil do Cliente')
              .map(([area, score], index) => {
                const AreaIcon = areas[area as keyof typeof areas]?.icon || ChartBarIcon;
                return (
                  <motion.div
                    key={area}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                    className={`bg-white rounded-xl shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-shadow border ${
                      score >= 7 ? 'border-green-200' :
                      score >= 5 ? 'border-yellow-200' :
                      'border-red-200'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getScoreBackground(score)}`}>
                            <AreaIcon className={`w-6 h-6 ${getScoreColor(score/8)}`} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{area}</h3>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(score/8)}`}>
                          {score}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{areas[area as keyof typeof areas]?.description}</p>
                      
                      <div className="relative pt-2">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${calculateBarPercentage(score)}%` }}
                            transition={{ duration: 1 }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              score >= 7 ? 'bg-green-500' :
                              score >= 5 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>

                      {score < 7 && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm text-red-700">
                            {getRecommendation(area, score)}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        );
      case 'tasks':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-center">Em desenvolvimento...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center w-full sm:w-auto justify-between">
              <a href="/" className="text-2xl font-bold text-[#007BFF]">
                Futuree AI
              </a>
              {/* Menu mobile */}
              <div className="flex sm:hidden items-center space-x-2">
                <button
                  onClick={() => setIsAgendaModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  aria-label="Agendar Reunião"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  aria-label="Upgrade"
                >
                  <Rocket className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
            {/* Botões desktop */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => setIsAgendaModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar Reunião
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF] rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#69B9FF] via-[#40A9FF] to-[#69B9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Rocket className="w-5 h-5 mr-2 transform group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative">
                    Upgrade
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
                </div>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Score Geral Card - Layout responsivo */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 relative overflow-hidden mb-6 sm:mb-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-500/5 to-gray-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pontuação Geral</h2>
                  <p className="text-gray-600 mt-1">Baseado nas suas respostas</p>
                </div>
                <div className={`text-4xl sm:text-5xl font-bold ${getScoreColor(totalScore/8)}`}>{totalScore}</div>
              </div>

              <div className="relative pt-2">
                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateBarPercentage(totalScore, true)}%` }}
                    transition={{ duration: 1 }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      totalScore >= 56 ? 'bg-green-500' : 
                      totalScore >= 40 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    totalScore >= 56 ? 'bg-green-500' : 
                    totalScore >= 40 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}></div>
                  <span className={`font-medium ${getScoreColor(totalScore/8)}`}>
                    {getScoreLabel(totalScore/8)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Última atualização: {completedAt?.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs responsivas */}
          <Tab.Group>
            <Tab.List className="flex p-1.5 space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100/50 backdrop-blur-xl mb-6 sm:mb-8 overflow-x-auto">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  className={({ selected }) =>
                    `group flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap
                    ${selected
                      ? 'bg-white text-blue-600 shadow-md shadow-blue-100 transform scale-[1.02] relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-blue-500/10 before:to-indigo-500/10 before:opacity-50'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-white/50'
                    }`
                  }
                >
                  <tab.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="relative hidden sm:inline">
                    {tab.label}
                    <motion.div
                      layoutId={`underline-${tab.id}`}
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                  </span>
                </Tab>
              ))}
            </Tab.List>

            {/* Conteúdo das tabs com grid responsivo */}
            <Tab.Panels>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 sm:space-y-8"
              >
                <Tab.Panel>
                  {renderTabContent()}
                </Tab.Panel>
              </motion.div>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </main>

      <AgendaModal 
        isOpen={isAgendaModalOpen} 
        onClose={() => setIsAgendaModalOpen(false)} 
      />
    </div>
  );
}
