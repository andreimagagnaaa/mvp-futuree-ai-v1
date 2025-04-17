import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiagnostic } from '../contexts/DiagnosticContext';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiagnosticPage() {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    questions,
    currentQuestionIndex,
    answers,
    setAnswers,
    nextQuestion,
    previousQuestion,
    submitDiagnostic
  } = useDiagnostic();

  // Verificação imediata de autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    navigate('/');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const selectedOption = answers[currentQuestion?.id];

  useEffect(() => {
    if (!currentUser) {
      console.log('DiagnosticPage: Usuário não autenticado, redirecionando para /');
      navigate('/');
      return;
    }
  }, [currentUser, navigate]);

  // Função para lidar com a resposta e redirecionamento
  const handleAnswerAndNavigation = async (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
    
    // Se não for a última questão, avança para a próxima
    if (currentQuestionIndex < totalQuestions - 1) {
      nextQuestion();
    }
  };

  // Função para lidar com a submissão do diagnóstico
  const handleSubmitDiagnostic = async () => {
    try {
      setIsLoading(true);
      // Salva a última resposta
      setAnswers({ ...answers, [currentQuestion.id]: selectedOption });
      // Submete o diagnóstico
      await submitDiagnostic();
      // Redireciona para o relatório
      navigate('/report');
    } catch (error) {
      console.error('Erro ao submeter diagnóstico:', error);
      setError('Erro ao salvar diagnóstico. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparando seu diagnóstico</h3>
          <p className="text-gray-600">Isso levará apenas alguns segundos...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full backdrop-blur-sm bg-white/90"
        >
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Ops! Ocorreu um erro</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
            >
              Voltar para o início
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    console.log('DiagnosticPage: Nenhuma questão carregada');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  console.log('DiagnosticPage: Renderizando questão:', currentQuestionIndex + 1);

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/30 py-4 sm:py-6 px-3 sm:px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-36 sm:w-56 h-36 sm:h-56 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full transform -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header - mais clean e responsivo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 px-2"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#007BFF] mb-2 tracking-tight">Futuree AI</h1>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Diagnóstico de Marketing Digital</h2>
          <p className="text-sm sm:text-base text-gray-600 mx-auto leading-relaxed">
            Responda as perguntas para receber um diagnóstico personalizado do seu marketing digital.
          </p>
        </motion.div>

        {/* Progress Section com gamificação - ajustado para mobile */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 sm:mb-6 px-2"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <motion.span 
                className="flex items-center justify-center w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm sm:text-base"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
              >
                {currentQuestionIndex + 1}
              </motion.span>
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                de {totalQuestions} questões
              </span>
            </div>
            <motion.div 
              className="flex items-center"
              animate={{ scale: selectedOption ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <SparklesIcon className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 mr-1" />
              <span className="text-xs sm:text-sm font-medium bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-[#007BFF] border border-blue-100">
                {Math.round(progress)}% completo
              </span>
            </motion.div>
          </div>
          <div className="relative h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
        </motion.div>

        {/* Question Card com feedback de gamificação - ajustado para mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white p-4 sm:p-6 mb-4 sm:mb-6 mx-2"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              {currentQuestion.text}
            </h3>

            <div className="space-y-2 sm:space-y-3">
              {currentQuestion.options.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => handleAnswerAndNavigation(currentQuestion.id, option.id)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    selectedOption === option.id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="text-sm sm:text-base text-gray-700">{option.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons - ajustados para mobile */}
        <div className="flex justify-between items-center px-2">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
              currentQuestionIndex === 0
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            <span>Anterior</span>
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmitDiagnostic}
              disabled={!selectedOption}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                !selectedOption ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              <span>Finalizar</span>
              <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={() => nextQuestion()}
              disabled={!selectedOption}
              className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                !selectedOption ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              <span>Próxima</span>
              <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 