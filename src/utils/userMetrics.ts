import { reportActiveUsers } from './stripe';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function updateActiveUsersMetric(organizationId: string, subscriptionItemId: string) {
  try {
    // Consulta usuários ativos nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersRef = collection(db, 'users', organizationId, 'team');
    const activeUsersQuery = query(
      usersRef,
      where('lastActivityAt', '>=', thirtyDaysAgo)
    );

    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsersCount = activeUsersSnapshot.size;

    // Reporta o número de usuários ativos para o Stripe
    await reportActiveUsers(subscriptionItemId, activeUsersCount);

    return activeUsersCount;
  } catch (error) {
    console.error('Erro ao atualizar métrica de usuários ativos:', error);
    throw error;
  }
} 