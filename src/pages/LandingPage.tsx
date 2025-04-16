import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart2, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  DollarSign,
  Sun,
  Moon,
  Menu,
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react';
import ComparisonSection from '../components/ComparisonSection';
import GradientLine from '../components/GradientLine';
import ReportPreview from '../components/ReportPreview';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="min-h-[100vh] flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        {/* Animated Circles */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        <GradientLine />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto py-16 sm:py-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-10"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 leading-tight tracking-tight">
                Marketing Digital<br/>
                <span className="text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-400 to-pink-400">com Inteligência Artificial</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                Transforme sua estratégia digital com insights poderosos e recomendações personalizadas baseadas em IA
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link
                to="/diagnostic"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Começar Diagnóstico Gratuito
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
              </Link>
              <Link
                to="/about"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-gray-700/50 transition-all duration-300 border border-gray-700/50 hover:border-gray-600"
              >
                Saiba Mais
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" size={20} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Análise em Tempo Real</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Monitoramento contínuo e insights instantâneos para sua estratégia</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                  <BarChart2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Relatórios Personalizados</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Dashboards e análises sob medida para seu negócio</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Recomendações Inteligentes</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Sugestões baseadas em IA para otimizar seus resultados</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <GradientLine />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium mb-4">
              Recursos
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Recursos Avançados
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Ferramentas poderosas para impulsionar seus resultados de marketing
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Análise Profunda</h3>
              <p className="text-gray-400 leading-relaxed">
                Diagnóstico completo do seu perfil profissional com métricas avançadas
              </p>
            </div>
            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Insights Pessoais</h3>
              <p className="text-gray-400 leading-relaxed">
                Recomendações personalizadas para seu crescimento baseadas em dados
              </p>
            </div>
            <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
              <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Plano de Ação</h3>
              <p className="text-gray-400 leading-relaxed">
                Roteiro claro e estruturado para alcançar seus objetivos com eficiência
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <GradientLine />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium mb-4">
              Processo
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Como Funciona
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Em três simples passos, você terá um diagnóstico completo e um plano
              personalizado para transformar sua estratégia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 h-full">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Questionário</h3>
                <p className="text-gray-400 leading-relaxed">
                  Responda perguntas sobre sua estratégia atual e objetivos para personalizarmos sua experiência
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 h-full">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-400">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Análise</h3>
                <p className="text-gray-400 leading-relaxed">
                  Nossa IA analisa suas respostas e identifica oportunidades de melhoria para sua estratégia
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 h-full">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-400">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Resultado</h3>
                <p className="text-gray-400 leading-relaxed">
                  Receba seu diagnóstico completo e plano de ação personalizado para alcançar seus objetivos
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <GradientLine />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Comparativo de Planos
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Escolha o plano ideal para o seu negócio e comece a transformar sua estratégia hoje mesmo
            </p>
          </motion.div>
          <ComparisonSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <GradientLine />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Pronto para Transformar sua Estratégia?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Comece agora e descubra como nossa plataforma pode ajudar você a alcançar
              resultados extraordinários em seu marketing digital
            </p>
            <Link
              to="/diagnostic"
              className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Começar Agora
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={28} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Soluções Inteligentes Section */}
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <GradientLine />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Soluções Inteligentes para seu Marketing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra como nossa plataforma pode transformar sua estratégia de
              marketing com tecnologia de ponta
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nossos Produtos Section */}
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <GradientLine />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Nossos Produtos
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-400">
              Soluções Inteligentes para seu Marketing
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Escolha o plano ideal para impulsionar seus resultados com IA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seção de Diagnóstico Inteligente */}
      <section className="py-16 bg-gradient-to-br from-[#007BFF]/5 to-[#0288d1]/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Diagnóstico Inteligente de Marketing Digital
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Nossa plataforma utiliza inteligência artificial para analisar sua presença digital e fornecer insights valiosos para melhorar sua estratégia de marketing.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Análise completa de sua presença online</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Recomendações personalizadas baseadas em dados</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Relatórios detalhados e fáceis de entender</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <ReportPreview />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 