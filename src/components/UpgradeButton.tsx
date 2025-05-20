import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession, redirectToCheckout } from '../services/stripeService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface UpgradeButtonProps {
  plano?: string;
  className?: string;
}

export function UpgradeButton({ plano, className }: UpgradeButtonProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);

      if (!currentUser) {
        toast.error('Você precisa estar logado para fazer upgrade');
        navigate('/login');
        return;
      }

      // Verifica se o usuário já é premium
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      if (userData?.isPremium) {
        // Se já é premium, redireciona para o dashboard premium
        navigate('/dashboard-premium');
        return;
      }

      // Se não é premium e está na página de report, redireciona para o dashboard
      if (window.location.pathname.includes('/report')) {
        navigate('/dashboard');
        return;
      }

      // Se está no dashboard, inicia o processo de checkout
      try {
        const { id: sessionId } = await createCheckoutSession(
          currentUser.uid,
          currentUser.email || undefined
        );
        await redirectToCheckout(sessionId);
      } catch (error: any) {
        console.error('Erro no checkout:', error);
        toast.error(error.message || 'Erro ao processar o pagamento');
      }
    } catch (error: any) {
      console.error('Erro ao verificar status premium:', error);
      toast.error('Erro ao verificar seu status premium');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleUpgradeClick}
      disabled={isLoading}
      className={`px-4 py-2 font-semibold text-white bg-[#007BFF] rounded-lg hover:bg-[#0062cc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${className}`}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5,
          ease: "linear"
        }}
      />
      <motion.div className="flex items-center justify-center gap-2 relative">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -2, 2, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
        >
          <Rocket className="w-5 h-5" />
        </motion.div>
        {isLoading ? 'Processando...' : 'Fazer Upgrade'}
      </motion.div>
    </motion.button>
  );
} 