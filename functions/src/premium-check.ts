import { onSchedule, ScheduledEvent } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// Função que será executada diariamente para verificar assinaturas expiradas
export const checkPremiumStatus = onSchedule({
  schedule: '0 0 * * *', // Executa todos os dias à meia-noite
  timeZone: 'America/Sao_Paulo',
  memory: '256MiB'
}, async (_context: ScheduledEvent): Promise<void> => {
  const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  try {
    // Busca usuários premium com último pagamento há mais de 30 dias
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('isPremium', '==', true)
      .where('lastPaymentDate', '<=', thirtyDaysAgo)
      .get();

    if (usersSnapshot.empty) {
      console.log('[PREMIUM-CHECK] Nenhum usuário premium expirado encontrado');
      return;
    }

    console.log(`[PREMIUM-CHECK] Encontrados ${usersSnapshot.size} usuários com premium expirado`);

    // Array para armazenar as promessas de atualização
    const updatePromises = usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      
      console.log('[PREMIUM-CHECK] Removendo acesso premium do usuário:', {
        userId: doc.id,
        lastPaymentDate: userData.lastPaymentDate,
        subscriptionStatus: userData.subscriptionStatus
      });

      return doc.ref.update({
        isPremium: false,
        hasPremiumAccess: false,
        premiumVerified: false,
        premiumEndDate: admin.firestore.FieldValue.serverTimestamp(),
        subscriptionStatus: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastWebhookEvent: {
          type: 'premium.expired',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: 'Premium removido por falta de renovação após 30 dias'
        }
      });
    });

    // Executa todas as atualizações em paralelo
    await Promise.all(updatePromises);

    console.log('[PREMIUM-CHECK] Processamento concluído com sucesso');
  } catch (error) {
    console.error('[PREMIUM-CHECK] Erro ao processar verificação de premium:', error);
    throw error;
  }
}); 