import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Logo from '../components/Logo';
import { AgendaModal } from '../components/AgendaModal';

const DashboardPremium = () => {
  const navigate = useNavigate();
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-4">
            <button
              onClick={() => setIsAgendaModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Agendar Reunião
            </button>
            <button
              onClick={() => navigate('/report')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Voltar para o Relatório
            </button>
          </div>
        </div>
      </header>

      <AgendaModal 
        isOpen={isAgendaModalOpen} 
        onClose={() => setIsAgendaModalOpen(false)} 
      />
    </div>
  );
};

export default DashboardPremium; 