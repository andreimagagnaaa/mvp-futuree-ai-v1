import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowLeft, Rocket } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-[#007BFF]">
                Futuree AI
              </a>
            </div>
            <button
              onClick={() => navigate('/report')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar para o Relatório
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden"
          >
            {/* Gradiente decorativo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="bg-blue-50 p-4 rounded-full">
                  <Lock className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Dashboard Premium
                </h1>
                <p className="text-gray-600 mb-8">
                  Desbloqueie recursos avançados para impulsionar ainda mais seus resultados de marketing
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Recursos Premium Incluem:</h3>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Analytics avançado com insights em tempo real
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Automações personalizadas de marketing
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Integração com múltiplas plataformas
                    </li>
                    <li className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Relatórios detalhados e exportáveis
                    </li>
                  </ul>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {/* Implementar integração com Stripe */}}
                  className="relative inline-flex items-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF] rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#69B9FF] via-[#40A9FF] to-[#69B9FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Rocket className="w-5 h-5 mr-2 transform group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative">
                      Fazer Upgrade Agora
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    </span>
                  </div>
                  {/* Efeito de brilho */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </motion.button>

                <p className="mt-4 text-sm text-gray-500">
                  Em breve disponível. Estamos preparando algo incrível para você!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 