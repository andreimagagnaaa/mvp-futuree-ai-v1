import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Calendar,
  CheckCircle2,
  Brain,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  Rocket,
  Award,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  Clock,
  BarChart,
  DollarSign,
  Filter,
  Shield,
  Flame,
  Zap,
  AlertTriangle,
  Building2,
  Globe,
  Share2,
  FileText,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { AgendaModal } from './components/AgendaModal';
import { buscarTarefasDeTeste } from './utils/supabaseTest';
import DashboardPage from './pages/DashboardPage';
import DiagnosticPage from './pages/DiagnosticPage';
import DashboardPremium from './pages/DashboardPremium';

const testimonials = [
  {
    name: "Ana Silva",
    role: "Head de Marketing",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
    quote: "A Futuree AI transformou completamente nossa estratégia digital. Os resultados foram impressionantes.",
    metrics: "+45% leads",
  },
  {
    name: "Carlos Santos",
    role: "CMO",
    company: "InnovateX",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
    quote: "A plataforma nos ajudou a identificar oportunidades que não víamos antes. Nosso ROI em marketing dobrou.",
    metrics: "2x ROI",
  },
  {
    name: "Patricia Lima",
    role: "Diretora de Marketing",
    company: "GrowthLabs",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
    quote: "O diagnóstico inteligente economizou semanas de análise manual e nos deu direções claras para crescer.",
    metrics: "-70% tempo",
  },
];

const services = [
  {
    icon: <Target className="h-10 w-10 text-[#007BFF] mx-auto mb-4" />,
    title: "Funil de Vendas",
    description: "Estruturamos seu funil para atrair, nutrir e converter leads em clientes. Maximizando seu investimento em marketing.",
    variant: "service-card-1"
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-[#007BFF] mx-auto mb-4" />,
    title: "Tráfego Pago",
    description: "Executamos campanhas pagas para aumentar a visibilidade, atrair leads e potencializar os resultados de conversão.",
    variant: "service-card-2"
  },
  {
    icon: <Users className="h-10 w-10 text-[#007BFF] mx-auto mb-4" />,
    title: "Gestão de Marca",
    description: "Ajudamos sua marca a comunicar valor de forma clara e relevante para o público. Atrair, educar e converter.",
    variant: "service-card-3"
  },
  {
    icon: <Brain className="h-10 w-10 text-[#007BFF] mx-auto mb-4" />,
    title: "Sites e Páginas",
    description: "Design moderno, responsivo e orientado pela experiência do usuário, interfaces intuitivas que reflitam a sua identidade.",
    variant: "service-card-4"
  },
  {
    icon: <MessageCircle className="h-10 w-10 text-[#007BFF] mx-auto mb-4" />,
    title: "E-mail Marketing",
    description: "Foco em construir e nutrir um relacionamento direto com leads ou clientes. Mais vendas, retenção e engajamento.",
    variant: "service-card-5"
  },
  {
    icon: <Rocket className="h-10 w-10 text-[#007BFF] mx-auto mb-4" />,
    title: "Dashboard",
    description: "Visão centralizada de KPIs chaves. Integrando os dados de múltiplas fontes, visualmente e intuitivamente.",
    variant: "service-card-6"
  }
];

const PopupCTA = ({ 
  onClose,
  setAuthModalView,
  setIsAuthModalOpen 
}: { 
  onClose: () => void;
  setAuthModalView: (view: 'login' | 'signup') => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-[90%] sm:max-w-sm bg-gradient-to-br from-white to-[#F8FAFC] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Fundo decorativo */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF]"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-[#0078FF] rounded-full blur-2xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-[#20B0FF] rounded-full blur-2xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-48 h-32 sm:h-48 bg-[#4A9FF5] rounded-full blur-2xl opacity-5"></div>

        {/* Botão de fechar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white z-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Conteúdo */}
        <div className="p-4 sm:p-6 relative">
          <div className="text-center mb-4 sm:mb-6">
            <span className="inline-block px-3 py-1 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-xs font-medium mb-2 sm:mb-3">
              Oferta Especial
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
              Potencialize seu Marketing Digital
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">Descubra como podemos transformar sua estratégia digital</p>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {/* Benefício 1 */}
            <div className="flex items-start space-x-2 sm:space-x-3 bg-white/50 p-2 sm:p-3 rounded-lg backdrop-blur-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-[#0078FF] to-[#40A9FF] flex items-center justify-center shadow-lg">
                  <Brain className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Análise Inteligente</h4>
                <p className="text-[10px] sm:text-xs text-gray-600">Processamento de dados em tempo real</p>
              </div>
            </div>

            {/* Benefício 2 */}
            <div className="flex items-start space-x-2 sm:space-x-3 bg-white/50 p-2 sm:p-3 rounded-lg backdrop-blur-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-[#20B0FF] to-[#69B9FF] flex items-center justify-center shadow-lg">
                  <Target className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Estratégias Personalizadas</h4>
                <p className="text-[10px] sm:text-xs text-gray-600">Planejamento adaptado ao seu negócio</p>
              </div>
            </div>

            {/* Benefício 3 */}
            <div className="flex items-start space-x-2 sm:space-x-3 bg-white/50 p-2 sm:p-3 rounded-lg backdrop-blur-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-[#4A9FF5] to-[#91C5FF] flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Resultados Comprovados</h4>
                <p className="text-[10px] sm:text-xs text-gray-600">Aumento consistente de conversões</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAuthModalView('signup');
                setIsAuthModalOpen(true);
                onClose();
              }}
              className="w-full py-2 sm:py-2.5 px-4 bg-[#007BFF] text-white hover:bg-[#0056b3] transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center space-x-2"
            >
              <span>Começar Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] sm:text-xs text-gray-500 text-center">
              Consulta gratuita de 30 minutos
            </p>
            <button
              onClick={onClose}
              className="text-[10px] sm:text-xs text-gray-400 hover:text-gray-600 transition-colors w-full"
            >
              Não mostrar novamente
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasClosedPopup, setHasClosedPopup] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Adiciona scroll suave para âncoras
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Testa a conexão com o Supabase
    buscarTarefasDeTeste();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasClosedPopup) {
        setShowPopup(true);
      }
    }, 60000); // 1 minuto

    return () => clearTimeout(timer);
  }, [hasClosedPopup]);

  const handleClosePopup = () => {
    setShowPopup(false);
    setHasClosedPopup(true);
  };

  const handleAuthButtonClick = (view: 'login' | 'signup' = 'login') => {
    if (currentUser) {
      logout();
    } else {
      setAuthModalView(view);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {showPopup && (
          <PopupCTA 
            onClose={handleClosePopup} 
            setAuthModalView={setAuthModalView}
            setIsAuthModalOpen={setIsAuthModalOpen}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <a href="#hero" className="text-2xl font-bold text-[#007BFF]">Futuree AI</a>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleAuthButtonClick('login')}
                className="text-gray-800 hover:text-[#007BFF] transition-colors duration-300 text-sm font-medium px-4 py-2"
              >
                Login
              </button>
              <button
                onClick={() => handleAuthButtonClick('signup')}
                className="px-6 py-3 bg-[#007BFF] text-white hover:bg-[#0056b3] transition-colors duration-300 text-sm font-medium rounded-lg"
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="section bg-gradient-to-b from-white to-[#F8FAFC] pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container-custom relative">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <div className="text-gray-900 whitespace-nowrap" style={{ lineHeight: '1.3' }}>Diagnóstico Inteligente de</div>
                <div className="bg-gradient-to-r from-[#007BFF] via-[#40A9FF] to-[#1890FF] text-transparent bg-clip-text whitespace-nowrap" style={{ lineHeight: '1.3' }}>Marketing Digital</div>
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl">
                Otimize sua estratégia de marketing com análises baseadas em IA. Obtenha insights personalizados e planos de ação práticos para impulsionar seus resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a 
                  href="#pricing" 
                  className="btn-primary bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white hover:from-[#69B9FF] hover:to-[#40A9FF] transition-all duration-300 px-6 py-3 rounded-xl flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
                >
                  Faça seu diagnóstico gratuito
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <button
                  onClick={() => setIsAgendaModalOpen(true)}
                  className="btn-secondary bg-white text-[#1890FF] border-2 border-[#1890FF] hover:bg-[#1890FF] hover:text-white transition-all duration-300 px-6 py-3 rounded-xl flex items-center justify-center font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar demonstração
                </button>
              </div>
              <div className="flex items-center text-sm sm:text-base text-gray-800">
                <CheckCircle2 className="h-5 w-5 mr-3 text-[#007BFF] flex-shrink-0" />
                <span>Mais de 500 empresas já melhoraram seus resultados</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3 relative"
            >
              <div className="relative z-10 rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-100">
                {/* Barra superior com gradiente */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#007BFF] via-[#40A9FF] to-[#007BFF]"></div>

                <div className="aspect-video p-8">
                  <div className="flex flex-col h-full">
                    {/* Header do Card */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-[#007BFF]/10 p-2.5 rounded-xl">
                          <BarChart2 className="h-6 w-6 text-[#007BFF]" />
                </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Prévia do seu Diagnóstico</h3>
                          <p className="text-sm text-gray-500 mt-1">Veja como está seu marketing digital</p>
                </div>
              </div>
                      <button 
                        onClick={() => {
                          setAuthModalView('signup');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#007BFF] text-white rounded-lg text-sm font-semibold flex items-center hover:bg-[#0056b3] transition-colors duration-300 shadow-lg"
                      >
                        Iniciar Diagnóstico
                      </button>
              </div>

                    {/* Badges de Status */}
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        <p className="text-sm font-medium text-emerald-700">Análise Personalizada</p>
                      </div>
                      <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Clock className="h-4 w-4 text-[#007BFF] mr-2" />
                        <p className="text-sm font-medium text-[#007BFF]">Em menos de 1 minuto</p>
                      </div>
                    </div>

                    {/* Seção de IA */}
                    <div className="bg-[#007BFF]/5 p-4 rounded-xl border border-[#007BFF]/10 mb-8">
                      <div className="flex items-start space-x-4">
                        <div className="bg-white p-2.5 rounded-xl shadow-md">
                          <BarChart2 className="h-5 w-5 text-[#007BFF]" />
                        </div>
                        <div>
                          <h4 className="text-[#007BFF] font-semibold mb-1 flex items-center">
                            Inteligência Artificial em Ação
                            <span className="ml-2 bg-[#007BFF]/10 text-[#007BFF] text-xs font-medium px-2 py-0.5 rounded-full">Powered by AI</span>
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">Nossa IA analisa mais de 8 áreas do marketing do seu negócio para gerar insights precisos e tarefas personalizadas</p>
                        </div>
                      </div>
                    </div>

                    {/* Grid de Métricas com Visual Aprimorado */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {/* Presença Digital */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Globe className="h-4 w-4 text-[#007BFF]" />
                              <p className="text-sm font-semibold text-gray-900">Presença Digital</p>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <h4 className="text-3xl font-bold text-[#007BFF]">85</h4>
                              <span className="text-lg text-gray-400">/100</span>
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl shadow-md">
                            <Target className="h-6 w-6 text-[#007BFF]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#007BFF] to-[#40A9FF] rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Performance</span>
                            <span className="text-[#007BFF] font-medium">Excelente</span>
                          </div>
                        </div>
                      </div>

                      {/* CRM */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4 text-[#007BFF]" />
                              <p className="text-sm font-semibold text-gray-900">CRM</p>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <h4 className="text-3xl font-bold text-[#007BFF]">92</h4>
                              <span className="text-lg text-gray-400">/100</span>
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl shadow-md">
                            <BarChart className="h-6 w-6 text-[#007BFF]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#007BFF] to-[#40A9FF] rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Performance</span>
                            <span className="text-[#007BFF] font-medium">Excepcional</span>
                          </div>
                        </div>
                      </div>

                      {/* Redes Sociais */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Share2 className="h-4 w-4 text-[#007BFF]" />
                              <p className="text-sm font-semibold text-gray-900">Redes Sociais</p>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <h4 className="text-3xl font-bold text-[#007BFF]">78</h4>
                              <span className="text-lg text-gray-400">/100</span>
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl shadow-md">
                            <Users className="h-6 w-6 text-[#007BFF]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#007BFF] to-[#40A9FF] rounded-full" style={{ width: '78%' }}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Performance</span>
                            <span className="text-[#007BFF] font-medium">Muito Bom</span>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-4 w-4 text-[#007BFF]" />
                              <p className="text-sm font-semibold text-gray-900">Conteúdo</p>
                            </div>
                            <div className="flex items-baseline space-x-1">
                              <h4 className="text-3xl font-bold text-[#007BFF]">81</h4>
                              <span className="text-lg text-gray-400">/100</span>
                            </div>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl shadow-md">
                            <MessageCircle className="h-6 w-6 text-[#007BFF]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#007BFF] to-[#40A9FF] rounded-full" style={{ width: '81%' }}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Progresso</span>
                            <span className="text-[#007BFF] font-medium">81%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Total Aprimorado */}
                    <div className="bg-gradient-to-r from-[#007BFF] to-[#00A6FF] rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Award className="h-5 w-5" />
                            <p className="text-sm font-medium opacity-90">Score Total</p>
                          </div>
                          <div className="flex items-baseline space-x-3">
                            <h3 className="text-4xl font-bold">84</h3>
                            <div className="flex items-center bg-white/20 px-2 py-1 rounded-full">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              <span className="text-sm font-medium">+12%</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                          <Award className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#007BFF]/10 to-transparent rounded-xl transform translate-x-4 translate-y-4"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Comparison Section */}
      <section className="section bg-gradient-to-b from-[#F8FAFC] to-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-2 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-sm font-medium">
                Transformação Digital
              </span>
              <h2 className="text-4xl font-bold text-gray-900">
                O Futuro do Marketing Digital é Agora
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Veja a diferença entre o marketing tradicional e o marketing orientado por IA
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inferno */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Marketing Tradicional</h3>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Frustração Constante</h4>
                      <p className="text-gray-600">Decisões baseadas em intuição e tentativa e erro</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Tempo Perdido</h4>
                      <p className="text-gray-600">Análises manuais demoradas e ineficientes</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <DollarSign className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">ROI Incerto</h4>
                      <p className="text-gray-600">Investimentos sem garantia de retorno</p>
                    </div>
                  </div>

                  <div className="bg-red-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-red-600">Taxa de Conversão</span>
                      <span className="text-2xl font-bold text-red-600">2.5%</span>
                    </div>
                    <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Céu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-[#007BFF] to-[#40A9FF] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Marketing com IA</h3>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Rocket className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg mr-4">
                      <Brain className="h-6 w-6 text-[#007BFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Decisões Inteligentes</h4>
                      <p className="text-gray-600">Análises precisas baseadas em dados e IA</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg mr-4">
                      <Zap className="h-6 w-6 text-[#007BFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Eficiência Máxima</h4>
                      <p className="text-gray-600">Automação e otimização em tempo real</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg mr-4">
                      <TrendingUp className="h-6 w-6 text-[#007BFF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">ROI Previsível</h4>
                      <p className="text-gray-600">Resultados mensuráveis e previsíveis</p>
                    </div>
                  </div>

                  <div className="bg-[#007BFF]/5 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-[#007BFF]">Taxa de Conversão</span>
                      <span className="text-2xl font-bold text-[#007BFF]">8.7%</span>
                    </div>
                    <div className="h-2 bg-[#007BFF]/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#007BFF] rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[#007BFF] font-medium text-lg mb-4">
                +248% de aumento na geração de leads
              </p>
              <a href="#pricing" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white rounded-lg hover:from-[#69B9FF] hover:to-[#40A9FF] transition-all duration-300">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-2 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-sm font-medium">
                Benefícios
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Por que escolher a Futuree AI
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Resultados extraordinários com IA avançada e metodologia comprovada
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <Clock className="h-8 w-8 text-[#007BFF]" />
                </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#007BFF] transition-colors duration-300">Economize Tempo</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Análises automáticas que substituem semanas de consultoria, permitindo que você foque no que realmente importa.
                </p>
                  <div className="mt-4 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
              </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <BarChart className="h-8 w-8 text-[#007BFF]" />
                </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#007BFF] transition-colors duration-300">Decisões Baseadas em Dados</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Tome decisões estratégicas com base em dados reais, não intuição, garantindo resultados mais consistentes.
                </p>
                  <div className="mt-4 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <DollarSign className="h-8 w-8 text-[#007BFF]" />
                </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#007BFF] transition-colors duration-300">Melhor ROI</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Priorize investimentos nos canais com maior retorno, maximizando o retorno sobre seu investimento em marketing.
                </p>
                  <div className="mt-4 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <Filter className="h-8 w-8 text-[#007BFF]" />
                </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#007BFF] transition-colors duration-300">Otimização de Funil</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Identifique e corrija vazamentos no funil de conversão, aumentando a eficiência do seu processo de vendas.
                </p>
                  <div className="mt-4 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <Brain className="h-8 w-8 text-[#007BFF]" />
                </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#007BFF] transition-colors duration-300">IA Avançada</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Estratégias respaldadas por inteligência artificial, garantindo análises precisas e previsões confiáveis.
                </p>
                  <div className="mt-4 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
                className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <Shield className="h-8 w-8 text-[#007BFF]" />
                </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#007BFF] transition-colors duration-300">Dados Seguros</h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Proteção total dos seus dados com criptografia avançada, garantindo a segurança das suas informações.
                </p>
                  <div className="mt-4 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-16 relative"
          >
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-[#0052CC] via-[#007BFF] to-[#40A9FF] rounded-2xl p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Pronto para melhorar seus resultados?
                </h3>
                <p className="text-white/90 mb-8">
                  Faça agora mesmo seu diagnóstico gratuito e descubra como podemos ajudar
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="#pricing" className="btn-primary bg-gradient-to-r from-[#69B9FF] to-[#1890FF] text-white hover:from-[#40A9FF] hover:to-[#0056b3] transition-all duration-300 px-6 py-3 rounded-lg flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                    Fazer Diagnóstico Gratuito →
                  </a>
                  <button
                    onClick={() => setIsAgendaModalOpen(true)}
                    className="btn-secondary bg-white text-[#1890FF] border-2 border-[#1890FF] hover:bg-[#1890FF] hover:text-white transition-all duration-300 px-6 py-3 rounded-xl flex items-center justify-center font-semibold"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Agendar demonstração
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-[#40A9FF] rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[#0052CC] rounded-full blur-3xl opacity-20"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* AI Diagnosis Section */}
      <section className="section bg-[#F8FAFC] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-2 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-sm font-medium">
                Diagnóstico Inteligente
              </span>
              <h2 className="text-4xl font-bold text-gray-900">
                Análise Profunda do seu Marketing Digital
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Nossa IA analisa profundamente seu marketing digital, identificando oportunidades e gerando insights acionáveis para impulsionar seus resultados.
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
                  <div className="flex items-start">
                    <div className="bg-[#007BFF]/10 p-4 rounded-xl mr-6 group-hover:bg-[#007BFF]/20 transition-colors duration-300">
                      <Brain className="h-8 w-8 text-[#007BFF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-[#007BFF] transition-colors duration-300">Análise Completa</h3>
                      <p className="text-gray-600 mb-4">Avaliação detalhada de todos os aspectos do seu marketing digital</p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Análise de canais
                        </li>
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Métricas de performance
                        </li>
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Identificação de gaps
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
                  <div className="flex items-start">
                    <div className="bg-[#007BFF]/10 p-4 rounded-xl mr-6 group-hover:bg-[#007BFF]/20 transition-colors duration-300">
                      <Target className="h-8 w-8 text-[#007BFF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-[#007BFF] transition-colors duration-300">Insights Personalizados</h3>
                      <p className="text-gray-600 mb-4">Recomendações específicas para seu negócio e mercado</p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Análise de concorrência
                        </li>
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Identificação de oportunidades
                        </li>
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Recomendações personalizadas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group md:col-span-2">
                  <div className="flex items-start">
                    <div className="bg-[#007BFF]/10 p-4 rounded-xl mr-6 group-hover:bg-[#007BFF]/20 transition-colors duration-300">
                      <TrendingUp className="h-8 w-8 text-[#007BFF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-[#007BFF] transition-colors duration-300">Plano de Ação</h3>
                      <p className="text-gray-600 mb-4">Estratégias práticas e implementáveis para melhorar seus resultados</p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Priorização de ações
                        </li>
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Cronograma de implementação
                        </li>
                        <li className="flex items-center text-sm text-gray-500">
                          <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                          Métricas de sucesso
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative lg:col-span-1"
            >
              <div className="h-full flex flex-col">
                <div className="flex-grow relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#007BFF]/10 to-[#0288d1]/10 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-[#007BFF]/20 to-[#0288d1]/20 flex items-center justify-center">
                      <BarChart2 className="w-24 h-24 text-[#007BFF]/50" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-xl">
                    <div className="flex items-center">
                      <Rocket className="h-6 w-6 text-[#007BFF]" />
                      <span className="ml-2 font-semibold text-[#007BFF]">+85% precisão</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-2xl transform translate-x-4 translate-y-4"></div>
              </div>
            </motion.div>
          </div>
          <div className="mt-12 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#pricing" className="btn-primary bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white hover:from-[#69B9FF] hover:to-[#40A9FF] transition-all duration-300 px-6 py-3 rounded-lg flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                Fazer Diagnóstico Gratuito →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Products Section */}
      <section className="section bg-gradient-to-b from-white to-[#F8FAFC] py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-2 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-sm font-medium">
                Nossos Produtos
              </span>
              <h2 className="text-4xl font-bold text-gray-900">
                Soluções Inteligentes para seu Marketing
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Escolha o plano ideal para impulsionar seus resultados com IA
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Futuree AI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-8 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#007BFF] mb-2 sm:mb-0">Futuree AI</h3>
                  <span className="text-sm text-[#007BFF] bg-[#007BFF]/10 px-4 py-1.5 rounded-full border border-[#007BFF] whitespace-nowrap shadow-sm">Produto</span>
                </div>
                <p className="text-gray-600 mb-6">Solução essencial para iniciar sua jornada com IA</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Diagnóstico básico</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Dashboard simplificado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">1 projeto</span>
                  </div>
                </div>
                <div className="text-center">
                  <button 
                    onClick={() => {
                      setAuthModalView('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] to-[#1890FF] hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300"
                  >
                    Começar Grátis
                  </button>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <span className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Gratuito para sempre
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Futuree AI Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#007BFF] hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-8 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#007BFF] mb-2 sm:mb-0">Futuree AI Premium</h3>
                  <span className="text-sm text-[#007BFF] bg-[#007BFF]/10 px-4 py-1.5 rounded-full border border-[#007BFF] whitespace-nowrap shadow-sm">Produto Premium</span>
                </div>
                <p className="text-gray-600 mb-6">Solução completa para otimizar seus resultados</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Diagnóstico completo e detalhado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Benchmarking avançado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Projetos ilimitados</span>
                  </div>
                </div>
                <div className="text-center">
                  <button 
                    onClick={() => {
                      setAuthModalView('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] to-[#1890FF] hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300"
                  >
                    Ativar Premium
                  </button>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <span className="flex items-center justify-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Teste grátis 7 dias
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Futuree AI Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Futuree AI Enterprise</h3>
                  <div className="bg-[#007BFF]/10 p-2 rounded-lg">
                    <Building2 className="h-6 w-6 text-[#007BFF]" />
                  </div>
                </div>
                <p className="text-gray-600 mb-6">Solução personalizada para grandes empresas</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Tudo do premium</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Assessoria especializada</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-3" />
                    <span className="text-gray-700">Suporte dedicado</span>
                  </div>
                </div>
                <div className="text-center">
                <button
                  onClick={() => setIsAgendaModalOpen(true)}
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] to-[#1890FF] hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300"
                >
                  Agendar Reunião
                </button>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <span className="flex items-center justify-center">
                      <Award className="h-4 w-4 mr-1" />
                      Solução personalizada
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg text-gray-600 mb-6">
                <span className="font-semibold text-[#007BFF]">+500</span> empresas já transformaram seus resultados
              </p>
              <a href="#pricing" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300">
                Ver Planos e Preços →
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Pillars Section */}
      <section className="section bg-[#111827] relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[#007BFF]/5"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container-custom relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium">
              Nossos Pilares
              </span>
              <h2 className="text-4xl font-bold text-white">
                Fundamentos que Impulsionam Resultados
              </h2>
              <p className="text-lg text-gray-300 md:max-w-none mx-auto leading-relaxed">
                Metodologia comprovada que combina estratégia, tecnologia e expertise para maximizar seu sucesso
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0288d1]/30 transition-all duration-300 hover:bg-white/10"
            >
          <div className="relative">
                <div className="mb-6 bg-[#0288d1]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#40A9FF] transition-colors duration-300">Estratégia</h3>
                <p className="text-gray-300">
                  Planejamento de canais, jornada de compra e funil de vendas para atrair e converter leads.
                </p>
                <div className="mt-6 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0288d1]/30 transition-all duration-300 hover:bg-white/10"
            >
              <div className="relative">
                <div className="mb-6 bg-[#0288d1]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#40A9FF] transition-colors duration-300">Branding</h3>
                <p className="text-gray-300">
                  Posicionamento de marca forte, sustentável e consistente, com relevância de longo prazo.
                </p>
                <div className="mt-6 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#0288d1]/30 transition-all duration-300 hover:bg-white/10"
            >
              <div className="relative">
                <div className="mb-6 bg-[#0288d1]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#40A9FF] transition-colors duration-300">Performance</h3>
                <p className="text-gray-300">
                  Execução de campanhas e automatizações que maximizam resultados e trazem escalabilidade.
                </p>
                <div className="mt-6 flex items-center text-[#40A9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#pricing" className="group/btn flex items-center text-[#007BFF] font-medium hover:text-[#40A9FF] transition-colors duration-300">
                    Saiba mais
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
              </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF] text-transparent bg-clip-text mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Histórias reais de empresas que transformaram seus resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="testimonial-card hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">{testimonial.quote}</p>
                  <div className="flex items-center text-[#007BFF] font-medium">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {testimonial.metrics}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Consulting Section */}
      <section className="section bg-[#F8FAFC] py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#007BFF]/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <span className="inline-block px-4 py-2 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-sm font-medium mb-6">
                  Assessoria Especializada
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Quer resultados ainda mais rápidos?
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
                  Combinamos nossa tecnologia de ponta com expertise humana para maximizar seus resultados
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg w-fit mb-4">
                      <Users className="h-6 w-6 text-[#007BFF]" />
                  </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Estratégia Personalizada</h3>
                    <p className="text-gray-600 text-sm">Desenvolvida por especialistas para seu negócio</p>
              </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg w-fit mb-4">
                      <Target className="h-6 w-6 text-[#007BFF]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Implementação Completa</h3>
                    <p className="text-gray-600 text-sm">Das recomendações da plataforma e estratégia personalizada</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg w-fit mb-4">
                      <TrendingUp className="h-6 w-6 text-[#007BFF]" />
              </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Otimização Contínua</h3>
                    <p className="text-gray-600 text-sm">Baseada em dados e resultados</p>
              </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="bg-[#007BFF]/10 p-3 rounded-lg w-fit mb-4">
                      <MessageCircle className="h-6 w-6 text-[#007BFF]" />
            </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Suporte Dedicado</h3>
                    <p className="text-gray-600 text-sm">Reuniões semanais de alinhamento</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <a href="#pricing" className="btn-primary bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white hover:from-[#69B9FF] hover:to-[#40A9FF] transition-all duration-300 px-6 py-3 rounded-lg flex items-center justify-center">
                    Solicitar Proposta →
                  </a>
                  <button
                    onClick={() => setIsAgendaModalOpen(true)}
                    className="btn-secondary bg-white text-[#1890FF] border-2 border-[#1890FF] hover:bg-[#1890FF] hover:text-white transition-all duration-300 px-6 py-3 rounded-xl flex items-center justify-center font-semibold"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Agendar Call
                  </button>
              </div>
            </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#007BFF]/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#007BFF]/10 to-[#0288d1]/10 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                      alt="Consultoria"
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl shadow-xl">
                    <div className="flex items-center">
                      <Award className="h-6 w-6 text-[#007BFF]" />
                      <span className="ml-2 font-semibold text-[#007BFF]">+200 clientes atendidos</span>
                </div>
              </div>
            </div>
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-2xl transform translate-x-4 translate-y-4"></div>
          </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Services Section */}
      <section className="section-padding bg-gradient-to-b from-white to-[#F8FAFC] py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <span className="inline-block px-4 py-2 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-sm font-medium">
              Nossos Serviços
              </span>
              <h2 className="text-4xl font-bold text-gray-900">
                Soluções Sob Medida para seu Negócio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Oferecemos soluções completas para garantir que seu negócio cresça!
            </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#0288d1]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="mb-6 bg-[#007BFF]/10 p-4 rounded-xl inline-block group-hover:bg-[#0288d1]/20 transition-colors duration-300">
                  {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#007BFF] transition-colors duration-300">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <div className="flex items-center text-[#007BFF] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="#pricing" className="group/btn flex items-center hover:text-[#40A9FF] transition-colors duration-300">
                      Saiba mais
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent"></div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="section bg-[#F8FAFC] py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF] text-transparent bg-clip-text mb-4"
            >
              Planos
            </motion.h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para seu negócio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="p-8 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#007BFF] mb-2 sm:mb-0">Futuree AI</h3>
                  <span className="text-sm font-medium text-[#007BFF] bg-[#007BFF]/10 px-4 py-1.5 rounded-full border border-[#007BFF] whitespace-nowrap shadow-sm">Produto</span>
                  </div>
                <p className="text-gray-600 mb-8 text-lg">Plataforma de diagnóstico inteligente</p>
                <div className="mb-8">
                  <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold text-gray-900">R$ 0</span>
                    <span className="text-gray-500 ml-2">/mês</span>
                  </div>
                  <p className="text-sm text-gray-500">Gratuito para sempre</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Diagnóstico básico com score geral
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Recomendações iniciais
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Dashboard simplificado
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    1 projeto
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Suporte por email
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Acesso à comunidade
                  </li>
                </ul>
                <div className="text-center">
                <button
                  onClick={() => {
                    setAuthModalView('signup');
                    setIsAuthModalOpen(true);
                  }}
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] to-[#1890FF] hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300"
                >
                  Começar Grátis
                </button>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <span className="flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Gratuito para sempre
                  </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -top-4 left-0 right-0 mx-auto w-[160px] h-[32px] flex items-center justify-center z-10">
                <div className="absolute inset-0 bg-[#007BFF] rounded-full shadow-lg"></div>
                <span className="relative text-white text-sm font-medium px-2">
                  Mais Popular
                </span>
            </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden border-2 border-[#007BFF]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="p-8 relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-[#007BFF] mb-2 sm:mb-0">Futuree AI Premium</h3>
                    <span className="text-sm font-medium text-[#007BFF] bg-[#007BFF]/10 px-4 py-1.5 rounded-full border border-[#007BFF] whitespace-nowrap shadow-sm">Produto Premium</span>
                  </div>
                  <p className="text-gray-600 mb-8 text-lg">Plataforma completa com recursos avançados</p>
                <div className="mb-8">
                    <div className="flex items-baseline mb-1">
                      <span className="text-4xl font-bold text-gray-900">R$ 97</span>
                      <span className="text-gray-500 ml-2">/mês</span>
                  </div>
                    <p className="text-sm text-gray-500 line-through">R$ 297/mês</p>
                    <p className="text-sm text-gray-500">Teste grátis 7 dias</p>
                </div>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Diagnóstico completo e detalhado
                  </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Benchmarking avançado
                  </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Plano de ação personalizado
                  </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Projetos ilimitados
                  </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Suporte prioritário
                  </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Relatórios customizados
                  </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                      Consultoria mensal
                  </li>
              </ul>
                  <div className="text-center">
                <button
                  onClick={() => {
                    setAuthModalView('signup');
                    setIsAuthModalOpen(true);
                  }}
                      className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] to-[#1890FF] hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300"
                >
                  Ativar Premium
                </button>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <span className="flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-1" />
                            Teste grátis 7 dias
                  </span>
                    </div>
                  </div>
            </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="p-8 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#007BFF] mb-2 sm:mb-0">Futuree AI Enterprise</h3>
                  <span className="text-sm font-medium text-[#007BFF] bg-[#007BFF]/10 px-4 py-1.5 rounded-full border border-[#007BFF] whitespace-nowrap shadow-sm">Produto + Assessoria</span>
                  </div>
                <p className="text-gray-600 mb-8 text-lg">Solução completa com assessoria especializada</p>
                <div className="mb-8">
                  <div className="flex items-baseline mb-1">
                    <span className="text-4xl font-bold text-gray-900">Personalizado</span>
                  </div>
                  <p className="text-sm text-gray-500">Solução personalizada</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Tudo do premium
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Assessoria especializada
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Cuidamos da sua presença digital
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-[#007BFF] mr-2 flex-shrink-0" />
                    Suporte dedicado
                  </li>
              </ul>
                <div className="text-center">
                <button
                  onClick={() => setIsAgendaModalOpen(true)}
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] to-[#1890FF] hover:from-[#69B9FF] hover:to-[#40A9FF] rounded-lg transition-all duration-300"
                >
                  Agendar Reunião
                </button>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <span className="flex items-center justify-center">
                    <Award className="h-4 w-4 mr-1" />
                    Solução personalizada
                  </span>
                  </div>
                </div>
              </div>
            </motion.div>
            </div>
          </div>
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-[#111E33] text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para transformar seu marketing digital?
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Comece agora com um diagnóstico gratuito do seu marketing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#pricing"
                className="btn-primary px-6 py-3 bg-[#007BFF] text-white hover:bg-[#0056b3] transition-all duration-300 rounded-lg flex items-center justify-center font-medium"
              >
                Fazer diagnóstico gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <button
                onClick={() => setIsAgendaModalOpen(true)}
                className="btn-secondary px-6 py-3 bg-transparent border border-white text-white hover:bg-white/10 transition-all duration-300 rounded-lg flex items-center justify-center font-medium"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-900 py-8">
        <div className="container-custom">
          <div className="flex flex-col items-center space-y-2">
            <a href="#hero" className="text-xl font-bold text-[#007BFF] hover:text-[#0056b3] transition-colors duration-300">Futuree AI</a>
            <p className="text-gray-500 text-xs">
              © 2025 Futuree AI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Adicione o modal de autenticação no final do JSX */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />

      <AgendaModal 
        isOpen={isAgendaModalOpen} 
        onClose={() => setIsAgendaModalOpen(false)} 
      />
    </div>
  );
}

export default App;