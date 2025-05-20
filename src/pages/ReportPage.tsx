import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { motion } from "framer-motion";
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  BoltIcon, 
  RocketLaunchIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  StarIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ChevronRightIcon,
  ClipboardIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  TrophyIcon,
  CheckIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import { Rocket, Calendar as CalendarIcon } from "lucide-react";
import { Tab } from '@headlessui/react';
import { AgendaModal } from "../components/AgendaModal";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { areas } from '../data/areas';
import { supabase } from "../config/supabase";
import { classNames } from '../utils/classNames';
import { UpgradeButton } from '../components/UpgradeButton';

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
  history?: Array<{
    date: any;
    totalScore: number;
    scores: Record<string, number>;
  }>;
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

interface TaskProgress {
  completed: boolean;
  points: number;
}

interface TaskProgressData {
  task_id: string;
  user_id: string;
  status: 'pending' | 'completed';
  completed_at?: string | null;
  updated_at: string;
}

interface TaskRecommendation {
  id: string;
  area: string;
  score: string;
  tarefa_recomendada: string;
  framework_sugerido: string;
  nome_material: string;
  tipo_cliente: string;
  link_pdf: string;
  progress?: TaskProgress;
}

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
      { threshold: 7, label: 'Avançado', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Processos otimizados' },
      { threshold: 5, label: 'Intermediário', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Processos em desenvolvimento' },
      { threshold: 3, label: 'Básico', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Processos básicos' }
    ],
    engagement: [
      { threshold: 7, label: 'Alto', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Forte presença digital' },
      { threshold: 5, label: 'Médio', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Presença moderada' },
      { threshold: 3, label: 'Baixo', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Presença limitada' }
    ],
    automation: [
      { threshold: 7, label: 'Avançada', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Altamente automatizado' },
      { threshold: 5, label: 'Parcial', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Parcialmente automatizado' },
      { threshold: 3, label: 'Básica', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Processos manuais' }
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
  const areasEsperadas = [
    'Geração de Leads',
    'Conversão',
    'Canais de Aquisição',
    'Conteúdo',
    'CRM e Relacionamento',
    'Análise de Dados',
    'Presença Digital',
    'Automação'
  ];

  console.log('Scores recebidos:', scores);

  // Se não houver scores ou estiver vazio, retorna valores zerados
  if (!scores || Object.keys(scores).length === 0) {
    console.log('Nenhum score encontrado, retornando zeros');
    return {
      monthlyGrowth: 0,
      strongAreas: 0,
      weakAreas: areasEsperadas.length,
      efficiency: 0,
      engagement: 0,
      automation: 0,
      totalScore: 0
    };
  }

  // Normaliza os scores para garantir que todas as áreas esperadas tenham um valor
  const normalizedScores = areasEsperadas.reduce((acc, area) => {
    acc[area] = scores[area] || 0;
    return acc;
  }, {} as Record<string, number>);

  console.log('Scores normalizados:', normalizedScores);

  // Cálculo de áreas fortes (score >= 7) e fracas (score < 5)
  const strongAreas = areasEsperadas.reduce((count, area) => {
    const score = normalizedScores[area];
    return count + (score >= 7 ? 1 : 0);
  }, 0);

  const weakAreas = areasEsperadas.reduce((count, area) => {
    const score = normalizedScores[area];
    return count + (score < 5 ? 1 : 0);
  }, 0);

  // Cálculo do score total (soma direta dos scores)
  const totalScore = areasEsperadas.reduce((sum, area) => sum + normalizedScores[area], 0);
  console.log('Score total calculado:', totalScore);

  // Cálculo de eficiência operacional (média dos scores)
  const avgEfficiency = totalScore / areasEsperadas.length;

  // Cálculo de engajamento digital
  const digitalAreas = ['Presença Digital', 'Conteúdo', 'Canais de Aquisição'];
  const digitalScore = digitalAreas.reduce((sum, area) => sum + (normalizedScores[area] || 0), 0) / digitalAreas.length;

  // Cálculo de automação
  const automationScore = normalizedScores['Automação'] || 0;

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
    if (score >= 56) return { // 70% de 80
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      progress: 'bg-green-500',
      hover: 'hover:bg-green-600'
    };
    if (score >= 40) return { // 50% de 80
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

// Substitua a função generatePDF por esta nova função de impressão
const handlePrint = () => {
  window.print();
};

const getScoreClassification = (score: number) => {
  if (score >= 7) return 'Excelente';
  if (score >= 5) return 'Bom';
  return 'Precisa Melhorar';
};

// Adicione estas constantes no topo do arquivo
const LEVEL_COLORS = {
  1: { bg: 'from-blue-400 to-blue-500', text: 'text-blue-50' },
  2: { bg: 'from-green-400 to-green-500', text: 'text-green-50' },
  3: { bg: 'from-yellow-400 to-yellow-500', text: 'text-yellow-50' },
  4: { bg: 'from-purple-400 to-purple-500', text: 'text-purple-50' },
  5: { bg: 'from-red-400 to-red-500', text: 'text-red-50' }
};

const ACHIEVEMENTS = [
  { 
    icon: '🎯', 
    label: 'Primeira Tarefa', 
    description: 'Complete sua primeira tarefa',
    xp: 50 
  },
  { 
    icon: '⚡', 
    label: 'Velocidade', 
    description: 'Complete 3 tarefas em um dia',
    xp: 100 
  },
  { 
    icon: '🏆', 
    label: 'Mestre', 
    description: 'Alcance o nível 5',
    xp: 200 
  },
  { 
    icon: '🌟', 
    label: 'Excelência', 
    description: 'Complete todas as tarefas de uma área',
    xp: 300 
  }
];

export default function ReportPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskProgress, setTaskProgress] = useState<Record<string, TaskProgress>>({});
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userXP, setUserXP] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(0);

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
    console.log("Scores brutos:", data.diagnostic?.scores);

    if (!data.hasCompletedDiagnostic) {
      console.log("Usuário sem diagnóstico, redirecionando...");
          navigate("/diagnostic");
          return;
        }

    // Garante que todos os dados necessários estejam presentes e normaliza os nomes das áreas
    const normalizedScores = Object.entries(data.diagnostic?.scores || {}).reduce((acc, [area, score]) => {
      // Normaliza o nome da área se necessário
      const normalizedArea = area === 'Automações' ? 'Automação' : area;
      acc[normalizedArea] = score;
      return acc;
    }, {} as Record<string, number>);

    console.log("Scores normalizados:", normalizedScores);

    const diagnostic = {
      ...data.diagnostic,
      scores: normalizedScores,
      totalScore: data.diagnostic?.totalScore || 0,
      completedAt: data.diagnostic?.completedAt || null,
      previousScore: data.diagnostic?.previousScore || null,
      recommendations: data.diagnostic?.recommendations || [],
      insights: data.diagnostic?.insights || []
    };

    console.log("Diagnostic final:", diagnostic);

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userData?.diagnostic?.scores) return;

      try {
        setLoadingTasks(true);
        const clientType = userData.diagnostic.answers?.['9'] === '9a' ? 'B2C' : 'B2B';
        
        // Filtra áreas com score "Precisa Melhorar" ou "Bom"
        const validAreas = Object.entries(userData.diagnostic.scores)
          .filter(([area, score]) => {
            if (typeof score !== 'number') return false;
            const classification = getScoreClassification(score);
            return area !== 'Perfil do Cliente' && classification !== 'Excelente';
          })
          .map(([area, score]) => ({
            area: area === 'Automações' ? 'Automação' : area,
            score: getScoreClassification(score)
          }));

        const allRecommendations: TaskRecommendation[] = [];

        for (const { area, score } of validAreas) {
          const { data, error } = await supabase
            .from('tarefas_recomendadas')
            .select('*')
            .eq('area', area)
            .eq('score', score)
            .or(`tipo_cliente.eq.${clientType},tipo_cliente.is.null`);

          if (!error && data && data.length > 0) {
            allRecommendations.push(...data);
          }
        }

        setRecommendations(allRecommendations);

        // Carrega o progresso das tarefas
        if (currentUser?.uid) {
          const { data: progressData } = await supabase
            .from('task_progress')
            .select('*')
            .eq('user_id', currentUser.uid);

          if (progressData) {
            const progress = progressData.reduce((acc, item) => {
              acc[item.task_id] = {
                completed: item.status === 'completed',
                points: item.status === 'completed' ? 100 : 0
              };
              return acc;
            }, {} as Record<string, TaskProgress>);

            setTaskProgress(progress);
            setCompletedTasks(progressData.filter(p => p.status === 'completed').length);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchRecommendations();
  }, [userData?.diagnostic?.scores, userData?.diagnostic?.answers, currentUser]);

  useEffect(() => {
    const calculateTaskProgress = () => {
      const newProgress = Object.fromEntries(
        recommendations.map(task => [task.id, { completed: false, points: 0 }])
      );
      setTaskProgress(newProgress);
    };

    calculateTaskProgress();
  }, [recommendations]);

  useEffect(() => {
    const calculateUserLevelAndXP = () => {
      const totalPoints = Object.values(taskProgress).reduce((sum, task) => sum + (task.completed ? task.points : 0), 0);
      setUserLevel(Math.floor(totalPoints / 100) + 1);
      setUserXP(totalPoints % 100);
    };

    calculateUserLevelAndXP();
  }, [taskProgress]);

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

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
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
          'Automação'
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
                          {Object.entries(scores)
                            .filter(([area]) => area !== 'Perfil do Cliente')
                            .filter(([_, score]) => score <= 5)
                            .length === 0 
                              ? 'Nenhuma área precisa de atenção'
                              : Object.entries(scores)
                                .filter(([area]) => area !== 'Perfil do Cliente')
                                .filter(([_, score]) => score <= 5)
                                .length === 1 
                                ? '1 área precisa de atenção'
                                : `${Object.entries(scores)
                                    .filter(([area]) => area !== 'Perfil do Cliente')
                                    .filter(([_, score]) => score <= 5)
                                    .length} áreas precisam de atenção`
                          }
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
                    .filter(([_, score]) => score <= 5)
                    .sort((a, b) => a[1] - b[1])
                    .map(([area, score]) => (
                      <div key={area} className="bg-red-50 rounded-lg p-4 flex items-center justify-between mb-2 last:mb-0">
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                        <span className="text-sm font-semibold text-red-600 bg-white px-3 py-1 rounded-md shadow-sm">{score.toFixed(1)}</span>
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
                          {Object.values(scores).filter(score => score >= 7).length} {Object.values(scores).filter(score => score >= 7).length === 1 ? 'área se destaca' : 'áreas se destacam'}
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
                    .filter(([_, score]) => score >= 7)
                    .sort((a, b) => b[1] - a[1])
                    .map(([area, score]) => (
                      <div key={area} className="bg-green-50 rounded-lg p-4 flex items-center justify-between mb-2 last:mb-0">
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                        <span className="text-sm font-semibold text-green-600 bg-white px-3 py-1 rounded-md shadow-sm">{score.toFixed(1)}</span>
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

                  {/* Fonte Principal de Leads */}
                  <div className="bg-yellow-50/50 rounded-xl p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">Fonte Principal de Leads</span>
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
                        <div className={`text-[40px] font-bold ${
                          growthScore >= 7 ? 'text-green-600' :
                          growthScore >= 5 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {formattedScore}
                        </div>
                        <div className={`text-lg font-medium ${
                          growthScore >= 7 ? 'text-green-600' :
                          growthScore >= 5 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {growthScore >= 7 ? 'Crescimento Acelerado' :
                           growthScore >= 5 ? 'Crescimento Moderado' :
                           'Crescimento Inicial'}
                        </div>
                        {/* Barra de progresso com largura proporcional ao score (considerando 10 como máximo) */}
                        <div className="relative w-24 h-1.5 bg-gray-100 rounded-full mt-2">
                          <div 
                            className={`absolute left-0 h-1.5 rounded-full ${
                              growthScore >= 7 ? 'bg-green-500' :
                              growthScore >= 5 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
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
                    <span className="text-sm font-medium text-blue-500">
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
                    <span className="text-sm font-medium text-blue-500">
                      {(() => {
                        const digitalScore = (
                          (scores['Presença Digital'] || 0) +
                          (scores['Automação'] || 0) +
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
                    <span className="text-sm font-medium text-blue-500">
                      {(() => {
                        const execScore = (
                          (scores['CRM e Relacionamento'] || 0) +
                          (scores['Automação'] || 0)
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <TrophyIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Tendências 2025 em Marketing Digital</h3>
                    <p className="text-sm text-gray-500">Principais tendências e oportunidades</p>
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

            {/* Card de Comparação por Área */}
            <div className="hidden md:block mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Comparação por Área</h3>
                    <p className="text-sm text-gray-500">Seu desempenho vs. Média do Mercado</p>
                  </div>
                </div>

                <div className="mt-8" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={[
                        { area: 'Geração de Leads', score: scores['Geração de Leads'] || 0, media: 7 },
                        { area: 'Conversão', score: scores['Conversão'] || 0, media: 7 },
                        { area: 'Canais de Aquisição', score: scores['Canais de Aquisição'] || 0, media: 7 },
                        { area: 'Conteúdo', score: scores['Conteúdo'] || 0, media: 7 },
                        { area: 'CRM e Relacionamento', score: scores['CRM e Relacionamento'] || 0, media: 7 },
                        { area: 'Análise de Dados', score: scores['Análise de Dados'] || 0, media: 7 },
                        { area: 'Presença Digital', score: scores['Presença Digital'] || 0, media: 7 },
                        { area: 'Automação', score: scores['Automação'] || 0, media: 7 }
                      ].sort((a, b) => b.score - a.score)} // Ordenar por score decrescente
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const classification = 
                              data.score >= 7 ? 'Excelente' :
                              data.score >= 5 ? 'Bom' :
                              'Precisa Melhorar';
                            const color = 
                              data.score >= 7 ? 'text-green-600' :
                              data.score >= 5 ? 'text-yellow-600' :
                              'text-red-600';
                            return (
                              <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-100">
                                <p className="font-medium text-gray-900 mb-1">{data.area}</p>
                                <p className={`text-sm ${color}`}>
                                  Score: {data.score.toFixed(1)} - {classification}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Média: {data.media.toFixed(1)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="score"
                        name="Seu Score"
                      >
                        {Object.entries(scores)
                          .filter(([area]) => area !== 'Perfil do Cliente')
                          .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA) // Ordenar por score decrescente
                          .map(([_, score]) => (
                            <Cell
                              key={`cell-${score}`}
                              fill={
                                score >= 7 ? '#10B981' :  // Verde para Excelente
                                score >= 5 ? '#EAB308' :  // Amarelo para Bom
                                '#EF4444'                 // Vermelho para Precisa Melhorar
                              }
                            />
                          ))}
                      </Bar>
                      <Bar
                        dataKey="media"
                        name="Média do Mercado"
                        fill="#9CA3AF"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Card de Evolução Temporal */}
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-purple-50">
                      <ChartBarIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Evolução Temporal</h3>
                      <p className="text-sm text-gray-500">Histórico dos seus diagnósticos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedPeriod}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      onChange={(e) => {
                        const period = parseInt(e.target.value);
                        setSelectedPeriod(period);
                      }}
                    >
                      <option value="3">Últimos 3 meses</option>
                      <option value="6">Últimos 6 meses</option>
                      <option value="12">Último ano</option>
                      <option value="0">Todo histórico</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={(() => {
                        const now = new Date(); // Adicione esta linha
                        if (diagnostic.history && diagnostic.history.length > 0) {
                          const sortedHistory = [...diagnostic.history].sort(
                            (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
                          );
                          
                          const filteredHistory = selectedPeriod === 0 
                            ? sortedHistory 
                            : sortedHistory.filter(entry => {
                                const entryDate = entry.date.toDate();
                                const diffMonths = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                                return diffMonths <= selectedPeriod;
                              });
                          
                          return filteredHistory.map(entry => ({
                            date: entry.date.toDate(),
                            score: entry.totalScore,
                            media: 56
                          }));
                        }
                        
                        return diagnostic.previousScore 
                          ? [
                              { 
                                date: new Date(diagnostic.completedAt.toDate().getTime() - (3 * 30 * 24 * 60 * 60 * 1000)), 
                                score: diagnostic.previousScore, 
                                media: 56 
                              },
                              { 
                                date: diagnostic.completedAt.toDate(), 
                                score: totalScore, 
                                media: 56 
                              }
                            ]
                          : [
                              { 
                                date: new Date(diagnostic.completedAt.toDate().getTime() - (3 * 30 * 24 * 60 * 60 * 1000)), 
                                score: totalScore, 
                                media: 56 
                              },
                              { 
                                date: diagnostic.completedAt.toDate(), 
                                score: totalScore, 
                                media: 56 
                              }
                            ];
                      })()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                      />
                      <YAxis 
                        domain={[0, 80]} 
                        tickFormatter={(value) => `${value}pts`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const scoreClass = 
                              data.score >= 56 ? 'text-green-600' :
                              data.score >= 40 ? 'text-yellow-600' :
                              'text-red-600';
                            
                            return (
                              <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                                <p className="font-medium text-gray-900 mb-2">
                                  {new Date(data.date).toLocaleDateString('pt-BR', { 
                                    month: 'long', 
                                    year: 'numeric',
                                    day: 'numeric'
                                  })}
                                </p>
                                <div className="space-y-1">
                                  <p className={`text-sm font-semibold ${scoreClass}`}>
                                    Score Total: {data.score} pontos
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Média do Mercado: {data.media} pontos
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {data.score >= 56 ? '🌟 Excelente' :
                                     data.score >= 40 ? '👍 Bom' :
                                     '⚠️ Precisa Melhorar'}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Score Total"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={{ 
                          r: 6, 
                          fill: "#8B5CF6",
                          strokeWidth: 2,
                          stroke: "#fff"
                        }}
                        activeDot={{ 
                          r: 8,
                          stroke: "#8B5CF6",
                          strokeWidth: 2
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="media"
                        name="Média do Mercado"
                        stroke="#9CA3AF"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legenda de Status */}
                <div className="mt-6 flex items-center justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Excelente (≥ 56pts)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600">Bom (40-55pts)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-600">Precisa Melhorar (≤ 39pts)</span>
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
      case 'areas':
        return (
          <div className="space-y-8">
            {/* Mapa de Impacto */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-50">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Mapa de Impacto</h3>
                  <p className="text-sm text-gray-500">Análise de desempenho por área</p>
                </div>
              </div>

              <div className="w-full" style={{ height: '400px' }}>
                <ResponsiveContainer>
                  <RadarChart 
                    cx="50%" 
                    cy="50%" 
                    outerRadius="80%" 
                    data={Object.entries(scores)
                      .filter(([area]) => area !== 'Perfil do Cliente')
                      .map(([area, score]) => ({
                        area: area,
                        score: score,
                        fullMark: 10
                      }))
                    }
                  >
                    <PolarGrid gridType="polygon" stroke="#E5E7EB" />
                    <PolarAngleAxis
                      dataKey="area"
                      tick={{ fill: '#4B5563', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={{ fill: '#4B5563', fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-100">
                              <p className="font-medium text-gray-900 mb-1">{data.area}</p>
                              <p className={`text-sm ${
                                data.score >= 7 ? 'text-green-600' :
                                data.score >= 5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                Score: {data.score.toFixed(1)} / {data.fullMark}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Excelente (≥ 7)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">Bom (5-6.9)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Precisa Melhorar (≤ 4.9)</span>
                </div>
              </div>
            </div>

            {/* Áreas que Precisam Melhorar */}
            <div className="space-y-4">
              {(() => {
                const areasQuePrecisamMelhorar = Object.entries(scores)
                  .filter(([area]) => area !== 'Perfil do Cliente' && scores[area] < 5);
                
                if (areasQuePrecisamMelhorar.length === 0) return null;

                return (
                  <>
                    <div className="flex items-center space-x-3 mb-6">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                      <h3 className="text-xl font-semibold text-gray-900">Áreas que Precisam Melhorar</h3>
                    </div>
                    <div className={classNames(
                      'grid grid-cols-1 gap-6',
                      areasQuePrecisamMelhorar.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'
                    )}>
                      {areasQuePrecisamMelhorar.map(([area, score], index) => {
                        const areaData = areas[area as keyof typeof areas];
                        const IconComponent = areaData?.icon || ChartBarIcon;
                        return (
                          <motion.div
                            key={area}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="w-full bg-white rounded-3xl shadow-sm p-8 relative overflow-hidden border border-red-100"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-red-500">
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-gray-900">{area}</h3>
                                </div>
                                <div className="text-2xl font-bold text-red-500">
                                  {score}
                                </div>
                              </div>
                              
                              <p className="text-gray-600">{areas[area as keyof typeof areas]?.description}</p>
                              
                              <div className="relative pt-2">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateBarPercentage(score)}%` }}
                                    transition={{ duration: 1 }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                                  />
                                </div>
                              </div>

                              <div className="bg-red-50 rounded-2xl p-4">
                                <p className="text-red-700">
                                  {getRecommendation(area, score)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Áreas com Bom Desempenho */}
            <div className="space-y-4">
              {(() => {
                const areasComBomDesempenho = Object.entries(scores)
                  .filter(([area]) => area !== 'Perfil do Cliente' && scores[area] >= 5 && scores[area] < 7);
                
                if (areasComBomDesempenho.length === 0) return null;

                return (
                  <>
                    <div className="flex items-center space-x-3 mb-6">
                      <CheckCircleIcon className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-semibold text-gray-900">Áreas com Bom Desempenho</h3>
                    </div>
                    <div className="space-y-6">
                      {areasComBomDesempenho.map(([area, score], index) => {
                        const areaData = areas[area as keyof typeof areas];
                        const IconComponent = areaData?.icon || ChartBarIcon;
                        return (
                          <motion.div
                            key={area}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="w-full bg-white rounded-3xl shadow-sm p-8 relative overflow-hidden border border-yellow-100"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-yellow-500">
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-gray-900">{area}</h3>
                                </div>
                                <div className="text-2xl font-bold text-yellow-500">
                                  {score}
                                </div>
                              </div>
                              
                              <p className="text-gray-600">{areas[area as keyof typeof areas]?.description}</p>
                              
                              <div className="relative pt-2">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateBarPercentage(score)}%` }}
                                    transition={{ duration: 1 }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                                  />
                                </div>
                              </div>

                              <div className="bg-yellow-50 rounded-2xl p-4">
                                <p className="text-yellow-700">
                                  {getRecommendation(area, score)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Áreas de Excelência */}
            <div className="space-y-4">
              {(() => {
                const areasDeExcelencia = Object.entries(scores)
                  .filter(([area]) => area !== 'Perfil do Cliente' && scores[area] >= 7);
                
                if (areasDeExcelencia.length === 0) return null;

                return (
                  <>
                    <div className="flex items-center space-x-3 mb-6">
                      <StarIcon className="w-6 h-6 text-green-500" />
                      <h3 className="text-xl font-semibold text-gray-900">Áreas de Excelência</h3>
                    </div>
                    <div className="space-y-6">
                      {areasDeExcelencia.map(([area, score], index) => {
                        const areaData = areas[area as keyof typeof areas];
                        const IconComponent = areaData?.icon || ChartBarIcon;
                        return (
                          <motion.div
                            key={area}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="w-full bg-white rounded-3xl shadow-sm p-8 relative overflow-hidden border border-green-100"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-green-500">
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-gray-900">{area}</h3>
                                </div>
                                <div className="text-2xl font-bold text-green-500">
                                  {score}
                                </div>
                              </div>
                              
                              <p className="text-gray-600">{areas[area as keyof typeof areas]?.description}</p>
                              
                              <div className="relative pt-2">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateBarPercentage(score)}%` }}
                                    transition={{ duration: 1 }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                                  />
                                </div>
                              </div>

                              <div className="bg-green-50 rounded-2xl p-4">
                                <p className="text-green-700">
                                  {getRecommendation(area, score)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        );
      case 'tasks':
        const groupedByArea = recommendations.reduce((acc, task) => {
          if (!acc[task.area]) {
            acc[task.area] = [];
          }
          acc[task.area].push(task);
          return acc;
        }, {} as Record<string, TaskRecommendation[]>);

        // Ordenar áreas por prioridade (score mais baixo primeiro)
        const sortedAreas = Object.entries(groupedByArea)
          .sort(([, tasksA], [, tasksB]) => {
            const scoreA = tasksA[0].score === 'Precisa Melhorar' ? 0 : 1;
            const scoreB = tasksB[0].score === 'Precisa Melhorar' ? 0 : 1;
            return scoreA - scoreB;
          });

        const getPriorityBadge = (score: string) => {
          if (score === 'Precisa Melhorar') {
            return { text: 'Alta Prioridade', bg: 'bg-red-50', textColor: 'text-red-700' };
          }
          return { text: 'Média Prioridade', bg: 'bg-yellow-50', textColor: 'text-yellow-700' };
        };

        const handleTaskComplete = async (taskId: string) => {
          const currentProgress = taskProgress[taskId] || { completed: false, points: 0 };
          const isCompleting = !currentProgress.completed;
          const now = new Date().toISOString();

          try {
            const updateData: TaskProgressData = {
              task_id: taskId,
              user_id: currentUser?.uid,
              status: isCompleting ? 'completed' : 'pending',
              updated_at: now,
              completed_at: isCompleting ? now : null
            };

            // Atualiza o progresso no Supabase
            const { error } = await supabase
              .from('task_progress')
              .upsert(updateData);

            if (error) {
              console.error('Erro ao salvar progresso:', error);
              return;
            }

            // Atualiza o estado local
            const newProgress = {
              ...taskProgress,
              [taskId]: {
                completed: isCompleting,
                points: isCompleting ? 100 : 0
              }
            };

            setTaskProgress(newProgress);

            // Atualiza o contador de tarefas concluídas
            const completedCount = Object.values(newProgress).filter(p => p.completed).length;
            setCompletedTasks(completedCount);

            if (isCompleting) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 2000);
            }
          } catch (error) {
            console.error('Erro ao atualizar progresso da tarefa:', error);
          }
        };

        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="flex flex-col">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <RocketLaunchIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Tarefas Recomendadas</h3>
                    <p className="text-sm text-gray-500">Ações personalizadas baseadas no seu diagnóstico</p>
                  </div>
                </div>
              </div>

              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-500 mt-4">Carregando suas tarefas personalizadas...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="p-4 rounded-full bg-gray-50">
                    <ClipboardIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mt-4 text-center">
                    Nenhuma tarefa recomendada encontrada para o seu perfil.
                  </p>
                </div>
              ) : (
                <Tab.Group>
                  <Tab.List className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-1 rounded-xl bg-blue-50/80 p-1 mb-6">
                    {sortedAreas.map(([area, tasks]) => {
                      const priority = getPriorityBadge(tasks[0].score);
                      return (
                        <Tab
                          key={area}
                          className={({ selected }) => `
                            w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                            ${selected
                              ? 'bg-white shadow text-blue-700'
                              : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-600'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <span className="font-medium">{area}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.textColor}`}>
                              {priority.text}
                            </span>
                          </div>
                        </Tab>
                      );
                    })}
                  </Tab.List>

                  <Tab.Panels>
                    {sortedAreas.map(([area, tasks]) => (
                      <Tab.Panel key={area} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Coluna de Tarefas */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-2">
                              <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
                              <span className="text-base font-medium text-gray-900">Lista de Tarefas</span>
                            </div>
                            <span className={classNames(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              tasks[0].score === 'Precisa Melhorar'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-yellow-50 text-yellow-700'
                            )}>
                              {tasks.filter(t => !taskProgress[t.id]?.completed).length} pendentes
                            </span>
                          </div>
                          
                          {tasks.map((task: TaskRecommendation, index: number) => {
                            const progress = taskProgress[task.id] || { completed: false, points: 0 };
                            
                            return (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`group relative bg-white rounded-2xl border ${
                                  progress.completed 
                                    ? 'border-green-200 shadow-lg shadow-green-100' 
                                    : 'border-gray-100 shadow-sm hover:shadow-md'
                                } transition-all duration-300 p-6`}
                              >
                                {/* Badge de Status */}
                                <div className="absolute -top-2 -right-2">
                                  {progress.completed ? (
                                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                                      <CheckCircleIcon className="w-4 h-4" />
                                      <span>Concluída</span>
                                    </div>
                                  ) : (
                                    <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                      Pendente
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    <div 
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        progress.completed 
                                          ? 'bg-green-50 text-green-600' 
                                          : 'bg-blue-50 text-blue-600'
                                      }`}
                                    >
                                      <RocketLaunchIcon className="w-6 h-6" />
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <h5 className={`text-base font-semibold ${
                                        progress.completed ? 'text-green-700' : 'text-gray-900'
                                      } group-hover:text-blue-600 transition-colors duration-200`}>
                                        {task.tarefa_recomendada}
                                      </h5>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {task.framework_sugerido}
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                        {task.area}
                                      </span>
                                    </div>

                                    {/* Barra de Progresso */}
                                    {progress.completed && (
                                      <div className="mt-3">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-green-500 h-1.5 rounded-full"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-shrink-0">
                                    <button
                                      onClick={() => handleTaskComplete(task.id)}
                                      className={`relative inline-flex items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                                        progress.completed
                                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                          : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                                      }`}
                                    >
                                      <motion.div
                                        animate={progress.completed ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                      >
                                        {progress.completed ? (
                                          <CheckCircleIcon className="w-6 h-6" />
                                        ) : (
                                          <input
                                            type="checkbox"
                                            className="h-6 w-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            checked={progress.completed}
                                            onChange={() => handleTaskComplete(task.id)}
                                          />
                                        )}
                                      </motion.div>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Coluna de Material de Apoio */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-center space-x-3 mb-6">
                            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                            <h4 className="text-lg font-semibold text-gray-900">Material de Apoio</h4>
                          </div>
                          
                          {tasks.length > 0 && (
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                              <h5 className="font-medium text-gray-900 mb-2">
                                {tasks[0].nome_material}
                              </h5>
                              <p className="text-sm text-gray-500 mb-4">
                                Material específico para clientes {tasks[0].tipo_cliente}
                              </p>
                              
                              <a
                                href={tasks[0].link_pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 group"
                              >
                                <span>Acessar material completo</span>
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </a>

                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <InformationCircleIcon className="w-5 h-5" />
                                  <span>Este material é válido para todas as {tasks.length} tarefas desta área</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 7) return 'bg-green-50';
    if (score >= 5) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'Excelente';
    if (score >= 5) return 'Bom';
    return 'Precisa Melhorar';
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
        case "Automação":
          return "Identifique processos repetitivos que podem ser automatizados.";
        default:
          return "Desenvolva uma estratégia básica para esta área.";
      }
    }
    return "";
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
              <div className="flex flex-col sm:hidden items-center space-y-2">
                <UpgradeButton
                  plano="premium"
                  className="p-2 text-blue-600"
                />
                <button
                  onClick={() => setIsAgendaModalOpen(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Agendar Reunião
                </button>
              </div>
            </div>
            {/* Botões desktop */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => setIsAgendaModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                Agendar Reunião
              </button>
              <UpgradeButton
                plano="premium"
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div id="report-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
                {tabs.map((tab) => (
                  <Tab.Panel key={tab.id}>
                    {renderTabContent(tab.id)}
                  </Tab.Panel>
                ))}
              </motion.div>
            </Tab.Panels>
          </Tab.Group>

          {/* Card de Impressão do Relatório */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden print:hidden"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-50">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="w-6 h-6 text-blue-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" 
              />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Download do Relatório</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Imprima seu relatório completo ou salve como PDF para compartilhar com sua equipe.
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Layout otimizado para impressão</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Opção de salvar como PDF</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-sm text-gray-600">Visualização prévia</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrint}
                    className="w-full md:w-auto group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="w-6 h-6 transform group-hover:translate-y-1 transition-transform duration-300" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download do Relatório
                      <span className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                Use a opção "Salvar como PDF" na janela de impressão para gerar um arquivo PDF
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AgendaModal 
        isOpen={isAgendaModalOpen} 
        onClose={() => setIsAgendaModalOpen(false)} 
      />

      {/* Efeito de Fogos de Artifício */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => {
            const hue = Math.random() * 360;
            const angle = (Math.random() * Math.PI * 2);
            const velocity = 20 + Math.random() * 15;
            const size = Math.random() * 6 + 2;
            
            return (
              <motion.div
                key={i}
                initial={{
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  opacity: 1,
                  scale: 0
                }}
                animate={{
                  x: [
                    window.innerWidth / 2,
                    window.innerWidth / 2 + Math.cos(angle) * velocity * 20
                  ],
                  y: [
                    window.innerHeight / 2,
                    window.innerHeight / 2 + Math.sin(angle) * velocity * 20 + (velocity * 15)
                  ],
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0.5]
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.2, 0.8, 0.4, 1],
                  delay: Math.random() * 0.2
                }}
                style={{
                  position: 'absolute',
                  width: size + 'px',
                  height: size + 'px',
                  background: `hsl(${hue}, 100%, 65%)`,
                  boxShadow: `0 0 ${size * 2}px hsl(${hue}, 100%, 65%)`,
                  borderRadius: '50%',
                  zIndex: 9999
                }}
              />
            );
          })}

          {/* Explosões centrais */}
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={`burst-${index}`}
              initial={{ 
                scale: 0,
                opacity: 1,
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 100
              }}
              animate={{
                scale: [0, 3],
                opacity: [1, 0]
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.1
              }}
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                background: `radial-gradient(circle, hsl(${Math.random() * 360}, 100%, 75%) 0%, transparent 70%)`,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}

          {/* Rastros luminosos */}
          {[...Array(12)].map((_, index) => {
            const angle = (index / 12) * Math.PI * 2;
            const hue = Math.random() * 360;
            
            return (
              <motion.div
                key={`trail-${index}`}
                initial={{
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: window.innerWidth / 2 + Math.cos(angle) * 150,
                  y: window.innerHeight / 2 + Math.sin(angle) * 150,
                  scale: [0, 1, 0],
                  opacity: [1, 0.8, 0]
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  delay: Math.random() * 0.2
                }}
                style={{
                  position: 'absolute',
                  width: '3px',
                  height: '25px',
                  background: `linear-gradient(to top, transparent, hsl(${hue}, 100%, 70%))`,
                  transform: `rotate(${angle}rad)`,
                  transformOrigin: 'center'
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskList({ tasks }) {
  if (!tasks?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma tarefa disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div
          key={index}
          className="p-6 rounded-lg border border-gray-200 bg-white"
        >
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
          <p className="mt-2 text-gray-600">{task.description}</p>
        </div>
      ))}
    </div>
  );
}
