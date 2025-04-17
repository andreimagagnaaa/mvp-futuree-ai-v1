import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, Building2, Phone } from 'lucide-react';
import { supabase } from '../config/supabase';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Salvar dados no Supabase
      const { error: supabaseError } = await supabase
        .from('agendamentos')
        .insert([
          {
            nome: formData.nome,
            email: formData.email,
            empresa: formData.empresa,
            telefone: formData.telefone,
            status: 'pendente',
            created_at: new Date().toISOString()
          }
        ]);

      if (supabaseError) throw supabaseError;

      // Se salvou com sucesso, avança para o calendário
      setStep(2);
    } catch (err: any) {
      console.error('Erro ao salvar agendamento:', err);
      setError('Ocorreu um erro ao salvar seus dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
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
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Barra de progresso */}
            <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gray-100">
              <div className="h-full bg-gradient-to-r from-[#40A9FF] via-[#1890FF] to-[#40A9FF] transition-all duration-300" 
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>

            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="h-4 sm:h-5 w-4 sm:w-5" />
            </button>

            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
              {step === 1 ? (
                <>
                  <div className="text-center mb-3 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Agende sua Demonstração
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Preencha seus dados para agendar uma demonstração personalizada
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <User className="h-4 sm:h-5 w-4 sm:w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu nome"
                          className="block w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu e-mail"
                          className="block w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-4 sm:h-5 w-4 sm:w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          required
                          placeholder="Nome da empresa"
                          className="block w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-[#1890FF]" />
                        </div>
                        <input
                          type="tel"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu telefone"
                          className="block w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-transparent bg-gray-50/50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full mt-3 sm:mt-4 bg-gradient-to-r from-[#40A9FF] to-[#1890FF] text-white py-2 sm:py-2.5 px-4 rounded-lg sm:rounded-xl hover:from-[#69B9FF] hover:to-[#40A9FF] transition-all duration-300 flex items-center justify-center text-sm sm:text-base font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </div>
                      ) : (
                        <>
                          <Calendar className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                          Continuar para Agendamento
                        </>
                      )}
                    </button>

                    <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-2">
                      Duração estimada da demonstração: 30 minutos
                    </p>
                  </form>
                </>
              ) : (
                <div className="h-[400px] sm:h-[450px] -mx-4 sm:-mx-6 md:-mx-8">
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