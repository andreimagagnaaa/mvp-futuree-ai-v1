import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ArrowLeftIcon, ChatBubbleLeftIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import {
  ChartBarIcon,
  FunnelIcon,
  UserGroupIcon,
  SparklesIcon,
  GlobeAltIcon,
  ChartPieIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Logo from '../components/Logo';
import { AgendaModal } from '../components/AgendaModal';
import { Tab } from '@headlessui/react';
import { classNames } from '../utils/classNames';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import GoalsCard from '../components/GoalsCard';
import { toast } from 'react-hot-toast';
import { formatISO } from 'date-fns';
import KanbanBoard from '../components/KanbanBoard';
import { v4 as uuidv4 } from 'uuid';
import FunnelsTab from '../components/FunnelsTab';
import ICPDiagnostic from '../components/ICPDiagnostic';
import { AIChat } from '../components/AI/AIChat';
import { BenchmarkingTab } from '../components/BenchmarkingTab';
import MetricsTab from '../components/MetricsTab';
import CalendarTab from '../components/CalendarTab';
import { Dialog } from '@headlessui/react';
import SettingsMenu from '../components/SettingsMenu';

const tabs = [
  { 
    id: 'overview', 
    name: 'Visão Geral',
    icon: ChartBarIcon,
    description: 'Acompanhe seus principais indicadores e progresso'
  },
  { 
    id: 'projects', 
    name: 'Projetos',
    icon: RocketLaunchIcon,
    description: 'Gerencie seus projetos e campanhas'
  },
  { 
    id: 'funnels', 
    name: 'Funis',
    icon: FunnelIcon,
    description: 'Acompanhe seus funis de vendas'
  },
  { 
    id: 'persona', 
    name: 'Persona',
    icon: UserGroupIcon,
    description: 'Analise e defina suas personas'
  },
  { 
    id: 'ai', 
    name: 'AI',
    icon: SparklesIcon,
    description: 'Utilize recursos de inteligência artificial'
  },
  { 
    id: 'market', 
    name: 'Mercado',
    icon: GlobeAltIcon,
    description: 'Análise de mercado e concorrência'
  },
  { 
    id: 'metrics', 
    name: 'Métricas',
    icon: ChartPieIcon,
    description: 'Analise suas métricas e KPIs'
  },
  { 
    id: 'calendar', 
    name: 'Calendário',
    icon: CalendarDaysIcon,
    description: 'Gerencie sua agenda e compromissos'
  }
];

interface DiagnosticData {
  scores: Record<string, number>;
  clientType?: string;
  answers?: Record<string, string>;
}

interface UserData {
  diagnostic?: DiagnosticData;
  goals?: {
    area: string;
    currentScore: number;
    targetScore: number;
    deadline: Date;
    status: 'active' | 'completed';
    classification: 'precisa melhorar' | 'bom' | 'excelente';
  }[];
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

interface TaskProgress {
  completed: boolean;
  points: number;
  first_completion_date?: string;
}

const DashboardPremium = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth?.currentUser?.uid) return;

      try {
        setIsLoading(true);
        
        // Busca dados do usuário no Firebase
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.diagnostic?.totalScore) {
            // Usa o score total diretamente do diagnóstico
            setUserScore(userData.diagnostic.totalScore);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [auth?.currentUser]);

  useEffect(() => {
    if (!auth?.currentUser?.uid) return;

    const channel = supabase
      .channel('task_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_progress'
        },
        async (payload) => {
          console.log('Mudança detectada:', payload);
          
          // Busca todas as tarefas que estão atualmente completed E têm first_completion_date
          const { data: completedTasks, error: completedError } = await supabase
            .from('task_progress')
            .select('task_id, status, first_completion_date')
            .eq('user_id', auth.currentUser.uid)
            .eq('status', 'completed')
            .not('first_completion_date', 'is', null);

          if (completedError) {
            console.error('Erro ao buscar tarefas concluídas:', completedError);
            return;
          }

          // Atualiza o progresso individual de cada tarefa
          const progress = (completedTasks || []).reduce((acc, item) => {
            acc[item.task_id] = {
              completed: true, // Já sabemos que está completed por causa do filtro
              points: 100,
              first_completion_date: item.first_completion_date
            };
            return acc;
          }, {} as Record<string, TaskProgress>);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [auth?.currentUser]);

  const getScoreClassification = (score: number): string => {
    if (score < 5) return 'Precisa Melhorar';
    if (score <= 8) return 'Bom';
    return 'Excelente';
  };

  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 gap-6">
            {/* Card de Score e Feedback */}
            <div className="w-full">
              <GoalsCard score={userScore} />
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <KanbanBoard />
          </div>
        );
      case 'funnels':
        return <FunnelsTab />;
      case 'persona':
        return <ICPDiagnostic />;
      case 'ai':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RocketLaunchIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Em Desenvolvimento</h3>
                <p className="text-gray-600 max-w-md">
                  Estamos trabalhando em uma experiência incrível com IA para você.
                  Esta funcionalidade estará disponível em breve!
                </p>
              </div>
            </div>
            <AIChat />
          </div>
        );
      case 'market':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <BenchmarkingTab />
          </div>
        );
      case 'metrics':
        return <MetricsTab />;
      case 'calendar':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <CalendarTab />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <p>Em desenvolvimento...</p>
          </div>
        );
    }
  };

  const handleSendFeedback = async () => {
    if (!auth?.currentUser?.uid) return;

    try {
      setFeedbackLoading(true);
      setFeedbackError('');
      setFeedbackSuccess(false);

      // Implemente a lógica para enviar o feedback para o servidor
      // Aqui você pode usar o supabase.from('user_feedback').insert()
      // ou qualquer outro método de comunicação com o servidor

      setFeedbackSuccess(true);
      setIsFeedbackModalOpen(false);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      setFeedbackError('Erro ao enviar feedback. Por favor, tente novamente mais tarde.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex justify-center sm:justify-start">
              <Logo />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <SettingsMenu />
              <button
                onClick={() => setIsAgendaModalOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                Agendar Reunião
              </button>
              <button
                onClick={() => navigate('/report')}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 w-full sm:w-auto"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Voltar para o Relatório
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <SparklesIcon className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Premium</h1>
              <p className="text-gray-600">Gerencie suas ações e acompanhe seu progresso</p>
            </div>
          </div>
        </div>

        {/* Container das tabs com scroll apenas nas tabs */}
        <div className="w-full">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide">
                <Tab.List className="tab-scrollable-list flex space-x-1 min-w-max bg-white rounded-xl p-1.5 shadow-sm relative">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.id}
                      className={({ selected }) =>
                        classNames(
                          'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                          selected
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        )
                      }
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </Tab>
                  ))}
                </Tab.List>
              </div>
              {/* Seta para indicar scroll no mobile */}
              <button
                type="button"
                aria-label="Ver mais abas"
                onClick={() => {
                  const tabList = document.querySelector('.tab-scrollable-list');
                  if (tabList) {
                    tabList.scrollBy({ left: 120, behavior: 'smooth' });
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center sm:hidden z-20 bg-transparent p-0 m-0 border-none outline-none focus:outline-none"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="rounded-full flex items-center bg-transparent">
                  <svg
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="text-blue-500 animate-pulse"
                    style={{ filter: 'drop-shadow(0 0 2px #3b82f6)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* Conteúdo das tabs */}
            <Tab.Panels className="mt-6">
              {tabs.map((tab) => (
                <Tab.Panel
                  key={tab.id}
                  className="rounded-xl focus:outline-none"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {renderTabContent(tab.id)}
                  </motion.div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Modal de Agenda */}
        <AgendaModal
          isOpen={isAgendaModalOpen}
          onClose={() => setIsAgendaModalOpen(false)}
        />

        {/* Modal de Feedback */}
        <Dialog
          as="div"
          className="relative z-50"
          open={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Seu Feedback
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Como você avalia sua experiência?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFeedbackRating(rating)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          feedbackRating === rating
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentários adicionais
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Compartilhe seus comentários..."
                  />
                </div>

                {feedbackError && (
                  <p className="text-sm text-red-600">{feedbackError}</p>
                )}

                {feedbackSuccess && (
                  <p className="text-sm text-green-600">
                    Obrigado pelo seu feedback!
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendFeedback}
                    disabled={feedbackLoading || !feedbackRating}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                      feedbackLoading || !feedbackRating
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {feedbackLoading ? 'Enviando...' : 'Enviar Feedback'}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </main>
    </div>
  );
};

export default DashboardPremium; 