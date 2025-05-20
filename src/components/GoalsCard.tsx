import React, { useState, useEffect } from 'react';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface GoalsCardProps {
  score: number;
}

const GoalsCard: React.FC<GoalsCardProps> = ({ score }) => {
  const { currentUser } = useAuth();
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(true);

  const getScoreLevel = (score: number) => {
    if (score >= 60) return { 
      text: 'Excelente', 
      color: 'text-green-400', 
      bgColor: 'from-green-400/20',
      message: "Continue assim! Seu desempenho está excepcional.",
      gradient: 'from-[#34D399] via-[#10B981] to-[#059669]'
    };
    if (score >= 40) return { 
      text: 'Bom', 
      color: 'text-blue-400', 
      bgColor: 'from-blue-400/20',
      message: "Você está no caminho certo! Continue se esforçando.",
      gradient: 'from-[#60A5FA] via-[#3B82F6] to-[#2563EB]'
    };
    return { 
      text: 'Em Desenvolvimento', 
      color: 'text-yellow-400', 
      bgColor: 'from-yellow-400/20',
      message: "Cada pequeno progresso conta. Continue focado!",
      gradient: 'from-[#FBBF24] via-[#F59E0B] to-[#D97706]'
    };
  };

  const scoreLevel = getScoreLevel(score);
  const progressWidth = `${(score / 80) * 100}%`;

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMotivationalMessage(prev => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleSendFeedback() {
    if (!currentUser?.uid) {
      setFeedbackError('Você precisa estar logado para enviar feedback.');
      return;
    }

    if (!feedbackRating) {
      setFeedbackError('Por favor, selecione uma avaliação.');
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');
    setFeedbackSuccess(false);

    try {
      await addDoc(collection(db, 'user_feedback'), {
        userId: currentUser.uid,
        rating: feedbackRating,
        text: feedbackText.trim(),
        createdAt: Timestamp.now(),
        userScore: score,
        updatedAt: Timestamp.now()
      });

      setFeedbackSuccess(true);
      setFeedbackText('');
      setFeedbackRating(0);
      
      // Aguarda 2 segundos antes de limpar a mensagem de sucesso
      setTimeout(() => {
        setFeedbackSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      setFeedbackError('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Card de Score */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${scoreLevel.gradient} rounded-2xl shadow-xl overflow-hidden relative`}
      >
        {/* Efeito de Blur */}
        <div className="absolute inset-0 backdrop-blur-[100px] mix-blend-overlay opacity-30"></div>
        
        <div className="relative p-8 text-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-3 bg-white/15 backdrop-blur-xl rounded-xl shadow-lg"
              >
                <TrophyIcon className="w-8 h-8" />
              </motion.div>
              <h2 className="text-3xl font-bold">Score Médio</h2>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-white/15 backdrop-blur-xl rounded-xl px-5 py-3 shadow-lg"
            >
              <StarIcon className="w-6 h-6" />
              <span className="text-3xl font-bold">{score.toFixed(0)}/80</span>
            </motion.div>
          </div>

          {/* Nível e Progresso */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xl font-medium">Nível Atual</span>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`font-bold text-xl`}
              >
                {scoreLevel.text}
              </motion.span>
            </div>
            <div className="relative h-4">
              <div className="absolute inset-0 bg-black/25 rounded-full backdrop-blur-xl"></div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progressWidth }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 bg-white rounded-full shadow-lg"
                style={{ width: progressWidth }}
              />
            </div>
          </div>

          {/* Mensagem Motivacional Animada */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={showMotivationalMessage ? 'msg1' : 'msg2'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-5 shadow-lg"
              >
                <p className="text-lg font-medium">
                  {scoreLevel.message}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Card de Feedback */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="p-3 bg-blue-50 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.036 4.125a.563.563 0 00.424.308l4.542.662a.563.563 0 01.312.96l-3.284 3.2a.563.563 0 00-.162.5l.775 4.52a.563.563 0 01-.817.594l-4.053-2.13a.563.563 0 00-.523 0l-4.053 2.13a.563.563 0 01-.817-.594l.775-4.52a.563.563 0 00-.162-.5l-3.284-3.2a.563.563 0 01.312-.96l4.542-.662a.563.563 0 00.424-.308l2.036-4.125z" />
              </svg>
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Feedback do Usuário</h3>
              <p className="text-gray-600">Sua opinião é muito importante para nós!</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFeedbackRating(star)}
                  className={`p-2 rounded-lg transition-all ${
                    feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              ))}
            </div>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Compartilhe sua experiência ou sugestões..."
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              rows={4}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendFeedback}
              disabled={feedbackLoading || !feedbackRating}
              className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all ${
                feedbackLoading || !feedbackRating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {feedbackLoading ? 'Enviando...' : 'Enviar Feedback'}
            </motion.button>

            <AnimatePresence>
              {(feedbackSuccess || feedbackError) && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center ${
                    feedbackSuccess ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {feedbackSuccess ? 'Feedback enviado com sucesso!' : feedbackError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalsCard;