import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ArrowLeft, Rocket } from 'lucide-react';
import { createCheckoutSession, redirectToCheckout, verifyStripePrice } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Logo from '../components/Logo';
import LoadingSpinner from '../components/LoadingSpinner';

// Estilos de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 200% auto;
    animation: gradient 3s linear infinite;
  }
`;
document.head.appendChild(style);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [priceVerified, setPriceVerified] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    verifyPrice();
    
    // Verifica o status do pagamento
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment_status');
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');

    // Verifica se o pagamento foi bem-sucedido (aceita ambos os formatos)
    if ((paymentStatus === 'success' || success === 'true') && sessionId) {
      setIsCheckingPayment(true);
      setLoadingMessage('Processando seu pagamento');
      checkPaymentStatus();
    } else if (paymentStatus === 'canceled') {
      toast.error('Pagamento cancelado. Você pode tentar novamente quando quiser.');
      // Remove os parâmetros da URL
      navigate('/dashboard', { replace: true });
    }
  }, []);

  const checkPaymentStatus = async () => {
    if (!currentUser) return;

    let attempts = 0;
    const maxAttempts = 30;
    const interval = 2000;

    const checkStatus = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        console.log('Verificando status premium:', {
          userId: currentUser.uid,
          isPremium: userData?.isPremium,
          hasPremiumAccess: userData?.hasPremiumAccess,
          premiumVerified: userData?.premiumVerified,
          subscriptionStatus: userData?.subscriptionStatus,
          paymentStatus: userData?.paymentStatus,
          attempt: attempts + 1,
          maxAttempts
        });

        // Verifica todas as flags possíveis de status premium
        const isPremiumActive = 
          userData?.isPremium === true || 
          userData?.hasPremiumAccess === true ||
          userData?.premiumVerified === true ||
          userData?.subscriptionStatus === 'active' ||
          userData?.paymentStatus === 'succeeded';

        // Se encontrar o status premium, redireciona imediatamente
        if (isPremiumActive) {
          setIsCheckingPayment(false);
          toast.success('Pagamento confirmado! Bem-vindo ao Premium!');
          
          // Pequeno delay para mostrar a mensagem de sucesso
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Força a atualização do status premium antes de redirecionar
          await updateDoc(userRef, {
            isPremium: true,
            hasPremiumAccess: true,
            premiumVerified: true,
            lastVerification: new Date().toISOString()
          });

          // Redireciona com state para indicar que veio do pagamento
          navigate('/dashboard-premium', { 
            replace: true,
            state: { fromPayment: true }
          });
          return true;
        }

        // Verifica se houve erro no pagamento
        if (userData?.paymentStatus === 'failed') {
          setIsCheckingPayment(false);
          toast.error(`Erro no pagamento: ${userData.lastPaymentError || 'Tente novamente ou entre em contato com o suporte.'}`);
          navigate('/dashboard', { replace: true });
          return true;
        }

        attempts++;
        
        // Atualiza a mensagem de loading baseado no progresso
        setLoadingMessage(
          attempts <= 5 ? 'Processando seu pagamento' :
          attempts <= 10 ? 'Ativando seus recursos premium' :
          attempts <= 15 ? 'Configurando seu ambiente' :
          attempts <= 20 ? 'Verificando status do pagamento' :
          attempts <= 25 ? 'Aguardando confirmação do banco' :
          'Finalizando configuração'
        );

        // Se atingiu o número máximo de tentativas mas o pagamento foi iniciado
        if (attempts >= maxAttempts) {
          setIsCheckingPayment(false);
          
          // Verifica se há indícios de pagamento em andamento
          if (userData?.stripeCustomerId && userData?.subscriptionId) {
            // Força ativação do status premium
            await updateDoc(userRef, {
              isPremium: true,
              hasPremiumAccess: true,
              premiumVerified: true,
              lastVerification: new Date().toISOString(),
              activatedByTimeout: true
            });
            
            toast.success('Acesso premium ativado! O status será confirmado em breve.');
            navigate('/dashboard-premium', { replace: true });
          } else {
            toast.error('O pagamento está sendo processado. Você receberá uma confirmação em breve.');
            navigate('/dashboard', { replace: true });
          }
          return true;
        }

        // Feedback visual para o usuário durante a verificação
        if (attempts === 1) {
          toast.loading('Processando seu pagamento...', { duration: 4000 });
        } else if (attempts === 10) {
          toast.loading('Ativando seus recursos premium...', { duration: 4000 });
        } else if (attempts === 20) {
          toast.loading('Aguardando confirmação do banco...', { duration: 4000 });
        }

        return false;
      } catch (error) {
        console.error('Erro ao verificar status premium:', error);
        setIsCheckingPayment(false);
        toast.error('Erro ao verificar status do pagamento. Por favor, tente recarregar a página.');
        navigate('/dashboard', { replace: true });
        return true;
      }
    };

    const pollStatus = async () => {
      const shouldStop = await checkStatus();
      if (!shouldStop) {
        setTimeout(pollStatus, interval);
      }
    };

    pollStatus();
  };

  const verifyPrice = async () => {
    try {
      const result = await verifyStripePrice();
      if (result.status === 'success') {
        setPriceVerified(true);
        console.log('Preço verificado:', result.price);
      }
    } catch (error: any) {
      console.error('Erro ao verificar preço:', error);
      toast.error(
        error.environment === 'test' 
          ? 'Erro de configuração: Preço não encontrado no ambiente de teste do Stripe'
          : 'Erro ao verificar preço. Entre em contato com o suporte.'
      );
    }
  };

  const handleUpgradeClick = async () => {
    try {
      if (!priceVerified) {
        toast.error('Aguarde a verificação do preço');
        return;
      }

      setIsLoading(true);

      // Cria a sessão de checkout
      const session = await createCheckoutSession(
        currentUser.uid,
        currentUser.email || undefined
      );

      // Redireciona para o checkout
      await redirectToCheckout(session.id);
    } catch (error: any) {
      // Tratamento específico para erros conhecidos
      if (error.code === 'stripe_initialization_error') {
        toast.error('Erro ao conectar com o serviço de pagamento. Tente novamente mais tarde.');
      } else if (error.code === 'invalid_price_id') {
        if (error.environment === 'test') {
          toast.error('Erro de configuração: Preço não encontrado no ambiente de teste do Stripe');
        } else {
          toast.error('Plano inválido. Entre em contato com o suporte.');
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao processar pagamento. Tente novamente.');
      }
      
      console.error('Erro detalhado no checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingPayment) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-[#f8fbff] to-[#f0f7ff]">
      {/* Header com melhor contraste e interatividade */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-blue-50 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-[#007BFF] hover:opacity-90 transition-all duration-300">
            Futuree AI
          </a>
          <button
            onClick={() => navigate('/report')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#007BFF] transition-all duration-300 rounded-lg hover:bg-blue-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para o Relatório
          </button>
        </div>
      </header>

      {/* Hero Section com melhor hierarquia visual */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-2xl w-full text-center mb-12">
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="inline-flex items-center justify-center bg-gradient-to-tr from-[#007BFF] to-[#00C6FF] rounded-full p-3 shadow-lg mb-4 transform hover:scale-105 transition-all duration-300">
              <Lock className="w-7 h-7 text-white" />
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">Acesso Premium Futuree AI</h1>
            <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-xl mx-auto">Desbloqueie recursos avançados de IA para transformar seu marketing.</p>
            <button
              onClick={handleUpgradeClick}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-[#017CFF] via-[#34A2FF] to-[#017CFF] text-white shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group animate-shimmer hover:bg-[length:200%_100%] bg-[length:100%_100%] ease-out"
            >
              <Rocket className="w-5 h-5 mr-2 transform group-hover:rotate-12 transition-transform duration-300 ease-out" />
              {isLoading ? 'Processando...' : 'Fazer Upgrade Agora'}
            </button>
            <p className="mt-4 text-sm text-[#017CFF] font-medium opacity-90">Teste grátis por 7 dias • Cancele quando quiser</p>
          </div>
        </div>

        {/* Entregáveis Premium */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-50 max-w-4xl w-full mx-auto p-8 sm:p-10 mb-12">
          <h2 className="text-2xl font-bold text-center mb-10 gradient-text">O que você recebe no Premium</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Benchmarking avançado */}
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-[#EBF5FF] via-[#F0F7FF] to-[#F5FAFF] shadow-lg border border-blue-50 transform transition-all hover:scale-102 hover:shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-tr from-[#017CFF] to-[#34A2FF] rounded-full p-4 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2' /></svg>
              </div>
              <span className="font-semibold text-lg text-[#017CFF] mb-3">Benchmarking avançado</span>
              <span className="text-gray-600 text-sm leading-relaxed">Compare seu desempenho com o mercado e encontre oportunidades reais de crescimento.</span>
            </div>

            {/* Gestão de projetos */}
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-[#E1EFFF] via-[#EBF4FF] to-[#F0F7FF] shadow-lg border border-blue-50 transform transition-all hover:scale-102 hover:shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-tr from-[#017CFF] to-[#34A2FF] rounded-full p-4 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' /></svg>
              </div>
              <span className="font-semibold text-lg text-[#017CFF] mb-3">Gestão de projetos</span>
              <span className="text-gray-600 text-sm leading-relaxed">Organize, acompanhe e otimize todas as suas ações em um só lugar.</span>
            </div>

            {/* Funis de vendas */}
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-[#DCE9FF] via-[#E6F0FF] to-[#EBF4FF] shadow-lg border border-blue-50 transform transition-all hover:scale-102 hover:shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-tr from-[#017CFF] to-[#34A2FF] rounded-full p-4 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18' /></svg>
              </div>
              <span className="font-semibold text-lg text-[#017CFF] mb-3">Funis de vendas</span>
              <span className="text-gray-600 text-sm leading-relaxed">Visualize e otimize cada etapa do seu funil para vender mais.</span>
            </div>

            {/* Identificação de Persona */}
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-[#D7E5FF] via-[#E1EFFF] to-[#E6F0FF] shadow-lg border border-blue-50 transform transition-all hover:scale-102 hover:shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-tr from-[#017CFF] to-[#34A2FF] rounded-full p-4 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' /></svg>
              </div>
              <span className="font-semibold text-lg text-[#017CFF] mb-3">Identificação de Persona</span>
              <span className="text-gray-600 text-sm leading-relaxed">Descubra e entenda seu público ideal com precisão.</span>
            </div>

            {/* Relatórios customizados */}
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-[#D2E3FF] via-[#DCE9FF] to-[#E1EFFF] shadow-lg border border-blue-50 transform transition-all hover:scale-102 hover:shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-tr from-[#017CFF] to-[#34A2FF] rounded-full p-4 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' /></svg>
              </div>
              <span className="font-semibold text-lg text-[#017CFF] mb-3">Relatórios customizados</span>
              <span className="text-gray-600 text-sm leading-relaxed">Crie análises detalhadas e relatórios sob medida para seu negócio.</span>
            </div>

            {/* Suporte prioritário */}
            <div className="group flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-[#CDDEFF] via-[#D7E5FF] to-[#DCE9FF] shadow-lg border border-blue-50 transform transition-all hover:scale-102 hover:shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-tr from-[#017CFF] to-[#34A2FF] rounded-full p-4 mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' /></svg>
              </div>
              <span className="font-semibold text-lg text-[#017CFF] mb-3">Suporte prioritário</span>
              <span className="text-gray-600 text-sm leading-relaxed">Atendimento rápido e exclusivo para clientes premium.</span>
            </div>
          </div>
        </div>

        {/* Selo de confiança */}
        <div className="flex flex-col items-center mb-8">
          <div className="testimonial-card flex flex-col items-center bg-white/90 backdrop-blur-sm border border-blue-50 shadow-lg rounded-xl px-8 py-6 transform hover:scale-102 transition-all duration-300">
            <span className="text-lg sm:text-xl font-bold mb-2 bg-gradient-to-r from-[#017CFF] via-[#34A2FF] to-[#017CFF] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">+100 empresas já confiam</span>
            <span className="text-gray-600 text-sm sm:text-base">Junte-se a quem já está transformando resultados com a Futuree AI</span>
          </div>
        </div>
      </main>

      {/* Footer com gradiente sutil */}
      <footer className="w-full py-6 bg-gradient-to-t from-blue-50/20 to-transparent"></footer>
    </div>
  );
} 