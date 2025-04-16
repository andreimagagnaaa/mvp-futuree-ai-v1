import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, Building2, Phone } from 'lucide-react';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgendaModal({ isOpen, onClose }: AgendaModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    telefone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Barra de progresso */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <div className="h-full bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF] transition-all duration-300" 
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>

            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="px-6 py-6 sm:px-8">
              {step === 1 ? (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      Agende sua Demonstração
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Preencha seus dados para agendar uma demonstração personalizada
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu nome"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu e-mail"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          required
                          placeholder="Nome da empresa"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="tel"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu telefone"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white py-2.5 px-4 rounded-xl hover:from-[#69B9FF] hover:to-[#40A9FF] transition-all duration-300 flex items-center justify-center font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Continuar para Agendamento
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-2">
                      Duração estimada da demonstração: 30 minutos
                    </p>
                  </form>
                </>
              ) : (
                <div className="h-[450px] -mx-6 sm:-mx-8">
                  <iframe 
                    src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1Lpk4n_Ml6JVn5CDbj8nTtw43XYW9T2iNlNTJ5-S8Wg7UeJAygBYUogAr78Fx_LgwjyqOp_IzQ?gv=true" 
                    style={{ border: 0 }} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AgendaModal; 