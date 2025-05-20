import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

interface PremiumRouteProps {
  children: React.ReactNode;
}

const PremiumRoute: React.FC<PremiumRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Verificando seu acesso');

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    let isMounted = true;

    const checkPremiumStatus = async () => {
      if (!currentUser) {
        if (isMounted) {
          setIsPremium(false);
          setShouldRedirect(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Verifica se estamos vindo de um pagamento bem-sucedido
        const searchParams = new URLSearchParams(location.search);
        const isPaymentSuccess = searchParams.get('success') === 'true' || searchParams.get('payment_status') === 'success';
        const sessionId = searchParams.get('session_id');
        const isPaymentFlow = isPaymentSuccess && sessionId;

        // Função para verificar se o usuário é premium
        const checkIsPremiumActive = async (data: any) => {
          // Verifica todas as flags possíveis de status premium
          const isPremiumByFlags = 
            data?.isPremium === true || 
            data?.hasPremiumAccess === true ||
            data?.premiumVerified === true;

          // Verifica status de assinatura/pagamento
          const isPremiumByStatus =
            data?.subscriptionStatus === 'active' || 
            data?.paymentStatus === 'succeeded';

          // Verifica se tem assinatura válida
          const hasValidSubscription = 
            data?.stripeCustomerId && 
            data?.subscriptionId;

          // Log detalhado da verificação
          console.log('Verificação detalhada de status premium:', {
            userId: currentUser?.uid,
            isPremium: data?.isPremium,
            hasPremiumAccess: data?.hasPremiumAccess,
            premiumVerified: data?.premiumVerified,
            subscriptionStatus: data?.subscriptionStatus,
            paymentStatus: data?.paymentStatus,
            stripeCustomerId: data?.stripeCustomerId,
            subscriptionId: data?.subscriptionId,
            isPremiumByFlags,
            isPremiumByStatus,
            hasValidSubscription,
            isPaymentFlow
          });

          // Se estamos no fluxo de pagamento ou tem assinatura válida, atualiza o status premium
          if ((isPaymentFlow || hasValidSubscription) && !isPremiumByFlags) {
            await updateDoc(userRef, {
              isPremium: true,
              hasPremiumAccess: true,
              premiumVerified: true,
              lastVerification: new Date().toISOString(),
              verificationSource: isPaymentFlow ? 'payment_flow' : 'subscription_check'
            });
            return true;
          }

          return isPremiumByFlags || isPremiumByStatus || hasValidSubscription;
        };

        // Se já temos os dados do pagamento ou o usuário é premium, libera o acesso
        const isPremiumActive = await checkIsPremiumActive(userData);
        
        if (isPremiumActive) {
          console.log('Status premium confirmado:', {
            userId: currentUser.uid,
            isPremium: userData?.isPremium,
            subscriptionStatus: userData?.subscriptionStatus,
            paymentStatus: userData?.paymentStatus,
            isPaymentFlow
          });
          
          if (isMounted) {
            setIsPremium(true);
            setShouldRedirect(false);
            setIsLoading(false);
          }
          return;
        }

        // Se estamos no fluxo de pagamento, damos mais tempo para o webhook atualizar
        if (isPaymentFlow) {
          let attempts = 0;
          const maxAttempts = 5;
          
          console.log('Iniciando verificação de pagamento:', {
            userId: currentUser.uid,
            sessionId,
            isPaymentSuccess
          });

          // Se o pagamento foi bem-sucedido, libera o acesso temporariamente
          if (isPaymentSuccess) {
            // Força a atualização do status premium
            await updateDoc(userRef, {
              isPremium: true,
              hasPremiumAccess: true,
              premiumVerified: true,
              lastVerification: new Date().toISOString(),
              verificationSource: 'payment_success'
            });

            if (isMounted) {
              setIsPremium(true);
              setShouldRedirect(false);
              setIsLoading(false);
            }
            
            // Inicia verificação em background
            checkInterval = setInterval(async () => {
              try {
                const refreshedDoc = await getDoc(userRef);
                const refreshedData = refreshedDoc.data();

                const stillPremium = await checkIsPremiumActive(refreshedData);
                if (stillPremium) {
                  clearInterval(checkInterval);
                  return;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                  clearInterval(checkInterval);
                }
              } catch (error) {
                console.error('Erro na verificação em background:', error);
                clearInterval(checkInterval);
              }
            }, 2000);
            
            return;
          }
        }

        // Verificação normal (fora do fluxo de pagamento)
        if (!isPremiumActive) {
          // Tenta uma última verificação no Firestore
          const finalCheck = await getDoc(userRef);
          const finalData = finalCheck.data();
          
          if (finalData?.isPremium || finalData?.hasPremiumAccess || finalData?.premiumVerified) {
            // Se encontrou status premium, atualiza e libera acesso
            await updateDoc(userRef, {
              isPremium: true,
              hasPremiumAccess: true,
              premiumVerified: true,
              lastVerification: new Date().toISOString(),
              verificationSource: 'final_check'
            });
            
            if (isMounted) {
              setIsPremium(true);
              setShouldRedirect(false);
              setIsLoading(false);
            }
            return;
          }

          console.log('Usuário não é premium:', {
            userId: currentUser.uid,
            isPremium: finalData?.isPremium,
            subscriptionStatus: finalData?.subscriptionStatus,
            paymentStatus: finalData?.paymentStatus,
            finalCheck: true
          });
          
          if (isMounted) {
            setIsPremium(false);
            setShouldRedirect(true);
            setIsLoading(false);
          }
          
          toast.error('Você precisa ser um usuário premium para acessar esta página');
        } else {
          if (isMounted) {
            setIsPremium(true);
            setShouldRedirect(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status premium:', error);
        if (isMounted) {
          setIsPremium(false);
          setShouldRedirect(true);
          setIsLoading(false);
        }
        toast.error('Erro ao verificar seu acesso premium');
      }
    };

    checkPremiumStatus();

    return () => {
      isMounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [currentUser, location.search]);

  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  if (shouldRedirect) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default PremiumRoute; 