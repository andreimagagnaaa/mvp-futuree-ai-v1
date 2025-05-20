import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const Configuracoes: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Cog6ToothIcon className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
      </div>
      
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Preferências de Notificação</h4>
          <p className="text-sm text-gray-500">Configure como você deseja receber atualizações sobre suas metas e progresso.</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Preferências de Privacidade</h4>
          <p className="text-sm text-gray-500">Gerencie suas configurações de privacidade e compartilhamento de dados.</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Preferências de Conta</h4>
          <p className="text-sm text-gray-500">Atualize suas informações de perfil e preferências de conta.</p>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes; 