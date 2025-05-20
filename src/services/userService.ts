import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const checkUserPremiumStatus = async (userId: string): Promise<boolean> => {
  try {
    console.log('Verificando status premium para userId:', userId);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error('Documento do usuário não encontrado:', userId);
      return false;
    }
    
    const userData = userDoc.data();
    
    // Verificação robusta do status premium
    const isPremiumActive = 
      userData.isPremium === true && 
      (userData.subscriptionStatus === 'active' || userData.paymentStatus === 'succeeded') &&
      userData.stripeCustomerId && 
      userData.subscriptionId;
    
    console.log('Resultado da verificação de status premium:', {
      userId,
      isPremium: userData.isPremium,
      subscriptionStatus: userData.subscriptionStatus,
      paymentStatus: userData.paymentStatus,
      stripeCustomerId: userData.stripeCustomerId,
      subscriptionId: userData.subscriptionId,
      isPremiumActive
    });
    
    return isPremiumActive;
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return false;
  }
};

export const redirectBasedOnPremiumStatus = async (userId: string, navigate: any) => {
  try {
    const isPremium = await checkUserPremiumStatus(userId);
    if (isPremium) {
      navigate('/dashboard-premium');
    } else {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Erro ao redirecionar baseado no status premium:', error);
    navigate('/dashboard');
  }
}; 