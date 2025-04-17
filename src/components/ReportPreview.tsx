import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, LineChart } from 'lucide-react';

const ReportPreview: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full relative overflow-hidden border border-gray-100"
    >
      {/* Gradiente decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      {/* Círculos decorativos */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart2 className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Prévia do Diagnóstico</h3>
            <p className="text-sm text-gray-500">Análise de Performance</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Marketing Digital</span>
            </div>
            <span className="text-xl font-bold text-blue-600">85%</span>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Redes Sociais</span>
            </div>
            <span className="text-xl font-bold text-purple-600">78%</span>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <LineChart className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">SEO</span>
            </div>
            <span className="text-xl font-bold text-blue-600">92%</span>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart2 className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-600">Conteúdo</span>
            </div>
            <span className="text-xl font-bold text-pink-600">81%</span>
          </div>
        </div>

        {/* Score Total */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Score Total</h4>
              <p className="text-xs text-gray-400">Baseado em 4 métricas</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                84%
              </span>
            </div>
          </div>
          {/* Barra de progresso */}
          <div className="mt-2 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportPreview; 