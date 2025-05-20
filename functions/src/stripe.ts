import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as express from 'express';
import {
  StripeWebhookRequest,
  StripeWebhookEvent,
  StripeCheckoutSession,
  StripeSubscription,
  StripePaymentIntent
} from './types/stripe';
import * as functions from 'firebase-functions';

// Função para obter configurações do Stripe de forma segura
const getStripeConfig = () => {
  const config = functions.config();
  
  if (!config.stripe?.secret_key) {
    throw new Error('STRIPE_SECRET_KEY não configurada');
  }
  if (!config.stripe?.webhook_secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurada');
  }
  if (!config.stripe?.price_id) {
    throw new Error('STRIPE_PRICE_ID não configurada');
  }

  return {
    secretKey: config.stripe.secret_key,
    webhookSecret: config.stripe.webhook_secret,
    priceId: config.stripe.price_id,
    publicKey: config.stripe.public_key
  };
};

// Inicialização do Stripe com tratamento de erro
let stripe: Stripe;
try {
  const config = getStripeConfig();
  stripe = new Stripe(config.secretKey, {
    apiVersion: '2023-10-16',
    typescript: true
  });
} catch (error) {
  console.error('Erro ao inicializar Stripe:', error);
  throw error;
}

// Endpoint do webhook
export const stripeWebhook = onRequest({
  cors: true,
  maxInstances: 10,
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB'
}, async (req: StripeWebhookRequest, res) => {
  console.log('[WEBHOOK] Requisição recebida:', {
    method: req.method,
    headers: req.headers,
    path: req.path,
    body: req.body
  });

  if (req.method !== 'POST') {
    console.error('[WEBHOOK] Método não permitido:', req.method);
    res.status(405).send('Método não permitido');
    return;
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('[WEBHOOK] Assinatura do webhook ausente');
    res.status(400).send('Webhook Error: Assinatura ausente');
    return;
  }

  try {
    const config = getStripeConfig();
    console.log('[WEBHOOK] Validando assinatura do webhook...');
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.webhookSecret
    ) as StripeWebhookEvent;

    console.log('[WEBHOOK] Evento construído com sucesso:', {
      type: event.type,
      id: event.id
    });

    await handleWebhook(event, res, stripe);
  } catch (err: any) {
    console.error('[WEBHOOK] Erro ao processar webhook:', {
      error: err.message,
      type: err.type,
      code: err.code,
      stack: err.stack
    });
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Função auxiliar para processar o webhook
const handleWebhook = async (
  event: StripeWebhookEvent,
  res: express.Response,
  stripe: Stripe
) => {
  const startTime = Date.now();
  console.log('[WEBHOOK] Iniciando processamento do evento:', {
    type: event.type,
    id: event.id,
    timestamp: new Date().toISOString()
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession;
        const userId = session.metadata?.firebaseUID || session.metadata?.userId;
        const customerId = session.customer;

        console.log('[WEBHOOK] Processando checkout completado:', {
          sessionId: session.id,
          userId,
          customer: customerId,
          metadata: session.metadata
        });

        if (!userId) {
          throw new Error('ID do usuário não encontrado nos metadados');
        }

        if (!customerId) {
          throw new Error('ID do cliente Stripe não encontrado na sessão');
        }

        // Busca o documento do usuário
        const userRef = admin.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          throw new Error(`Usuário não encontrado: ${userId}`);
        }

        // Verifica se o evento já foi processado
        const userData = userDoc.data();
        console.log('[WEBHOOK] Dados atuais do usuário:', {
          userId,
          stripeCustomerId: userData?.stripeCustomerId,
          isPremium: userData?.isPremium,
          sessionId: session.id
        });

        // Sempre atualiza o stripeCustomerId se ele não existir ou for diferente
        if (!userData?.stripeCustomerId || userData.stripeCustomerId !== customerId) {
          console.log('[WEBHOOK] Atualizando stripeCustomerId:', {
            userId,
            oldCustomerId: userData?.stripeCustomerId,
            newCustomerId: customerId
          });

          // Atualiza imediatamente o stripeCustomerId
          await userRef.update({
            stripeCustomerId: customerId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        if (userData?.lastWebhookEvent?.sessionId === session.id) {
          console.log('[WEBHOOK] Evento já processado anteriormente:', {
            userId,
            sessionId: session.id
          });
          res.json({ received: true, status: 'already_processed' });
          return;
        }

        // Prepara os dados para atualização com flags redundantes
        const updateData = {
          isPremium: true,
          stripeCustomerId: session.customer,
          subscriptionId: session.subscription,
          subscriptionStatus: 'active',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          premiumStartDate: admin.firestore.FieldValue.serverTimestamp(),
          lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
          paymentStatus: 'succeeded',
          // Flags redundantes para garantir o status premium
          hasPremiumAccess: true,
          premiumVerified: true,
          premiumActivationDate: admin.firestore.FieldValue.serverTimestamp(),
          lastWebhookEvent: {
            type: event.type,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            sessionId: session.id,
            eventId: event.id
          }
        };

        console.log('[WEBHOOK] Tentando atualizar usuário para premium:', {
          userId,
          sessionId: session.id,
          updateData
        });

        // Primeira tentativa com transação
        try {
          await admin.firestore().runTransaction(async (transaction) => {
            const freshUserDoc = await transaction.get(userRef);
            if (!freshUserDoc.exists) {
              throw new Error('Usuário não encontrado durante a transação');
            }
            transaction.update(userRef, updateData);
          });

          // Verifica imediatamente se a atualização foi bem-sucedida
          const verificationDoc = await userRef.get();
          const verificationData = verificationDoc.data();

          if (!verificationData?.isPremium || !verificationData?.hasPremiumAccess) {
            console.warn('[WEBHOOK] Primeira tentativa não confirmada, tentando novamente...');
            
            // Segunda tentativa com update direto
            await userRef.update({
              ...updateData,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              forceUpdate: true, // Flag adicional para forçar atualização
              lastWebhookEvent: {
                ...updateData.lastWebhookEvent,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                retryCount: 1
              }
            });

            // Verifica novamente
            const finalCheck = await userRef.get();
            const finalData = finalCheck.data();

            console.log('[WEBHOOK] Verificação final do status premium:', {
              userId,
              isPremium: finalData?.isPremium,
              hasPremiumAccess: finalData?.hasPremiumAccess,
              premiumVerified: finalData?.premiumVerified
            });
          }

          console.log('[WEBHOOK] Usuário atualizado com sucesso para premium');
        } catch (error) {
          console.error('[WEBHOOK] Erro ao atualizar status premium:', error);
          throw error;
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscription;
        const customerId = subscription.customer;

        console.log('[WEBHOOK] Processando atualização de assinatura:', {
          customerId,
          status: subscription.status,
          subscriptionId: subscription.id
        });

        const usersSnapshot = await admin.firestore()
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (usersSnapshot.empty) {
          console.warn('[WEBHOOK] Usuário não encontrado para o customerId:', customerId);
          res.json({ received: true, status: 'customer_not_found' });
          return;
        }

        const userDoc = usersSnapshot.docs[0];
        const updates: Record<string, any> = {
          subscriptionStatus: subscription.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastWebhookEvent: {
            type: event.type,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionId: subscription.id,
            eventId: event.id
          }
        };

        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          updates.isPremium = false;
          updates.premiumEndDate = admin.firestore.FieldValue.serverTimestamp();
        }

        // Atualiza o documento em uma transação
        await admin.firestore().runTransaction(async (transaction) => {
          const freshUserDoc = await transaction.get(userDoc.ref);
          if (!freshUserDoc.exists) {
            throw new Error('Usuário não encontrado durante a transação');
          }
          
          transaction.update(freshUserDoc.ref, updates);
        });

        console.log('[WEBHOOK] Status da assinatura atualizado:', {
          userId: userDoc.id,
          customerId,
          status: subscription.status,
          updates
        });
        break;
      }

      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as StripePaymentIntent;
        const customerId = paymentIntent.customer;

        if (!customerId) {
          console.warn('[WEBHOOK] Customer ID não encontrado no payment intent');
          res.json({ received: true, status: 'no_customer_id' });
          return;
        }

        console.log('[WEBHOOK] Processando evento de pagamento:', {
          customerId,
          status: event.type,
          paymentIntentId: paymentIntent.id
        });

        const userSnapshots = await admin.firestore()
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get();

        if (userSnapshots.empty) {
          console.warn('[WEBHOOK] Usuário não encontrado para o customerId:', customerId);
          res.json({ received: true, status: 'customer_not_found' });
          return;
        }

        const userDoc = userSnapshots.docs[0];
        const updates: Record<string, any> = {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastWebhookEvent: {
            type: event.type,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            eventId: event.id
          }
        };

        if (event.type === 'payment_intent.succeeded') {
          updates.paymentStatus = 'succeeded';
          updates.lastPaymentDate = admin.firestore.FieldValue.serverTimestamp();
        } else {
          updates.paymentStatus = 'failed';
          if (paymentIntent.last_payment_error?.message) {
            updates.lastPaymentError = paymentIntent.last_payment_error.message;
          }
        }

        // Atualiza o documento em uma transação
        await admin.firestore().runTransaction(async (transaction) => {
          const freshUserDoc = await transaction.get(userDoc.ref);
          if (!freshUserDoc.exists) {
            throw new Error('Usuário não encontrado durante a transação');
          }
          
          transaction.update(freshUserDoc.ref, updates);
        });

        console.log('[WEBHOOK] Status do pagamento atualizado:', {
          userId: userDoc.id,
          customerId,
          status: event.type,
          updates
        });
        break;
      }

      default: {
        console.log('[WEBHOOK] Evento não processado:', event.type);
        res.json({ received: true, status: 'event_ignored' });
        return;
      }
    }

    const processingTime = Date.now() - startTime;
    console.log('[WEBHOOK] Processamento concluído com sucesso:', {
      type: event.type,
      id: event.id,
      processingTime: `${processingTime}ms`
    });

    res.json({ received: true, status: 'success' });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('[WEBHOOK] Erro no processamento:', {
      type: event.type,
      id: event.id,
      error: error.message,
      stack: error.stack,
      processingTime: `${processingTime}ms`
    });
    throw error; // Propaga o erro para ser tratado pelo handler principal
  }
};

// Endpoint de checkout
export const createCheckoutSession = onRequest({
  cors: true,
  maxInstances: 10,
  region: 'us-central1',
  memory: '256MiB'
}, async (req: express.Request, res: express.Response) => {
  try {
    console.log('[CHECKOUT] Requisição recebida:', {
      method: req.method,
      body: req.body
    });

    if (req.method !== 'POST') {
      console.error('[CHECKOUT] Método não permitido:', req.method);
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { userId, email } = req.body;

    if (!userId) {
      console.error('[CHECKOUT] userId não fornecido');
      res.status(400).json({ error: 'userId é obrigatório' });
      return;
    }

    // Criar ou recuperar o customer do Stripe
    const userSnapshot = await admin.firestore().collection('users').doc(userId).get();
    const userData = userSnapshot.data();
    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      console.log('[CHECKOUT] Criando novo customer no Stripe');
      const customer = await stripe.customers.create({
        email,
        metadata: {
          firebaseUID: userId
        }
      });
      customerId = customer.id;
      
      await admin.firestore().collection('users').doc(userId).update({
        stripeCustomerId: customerId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('[CHECKOUT] Customer criado e salvo:', customerId);
    }

    const config = getStripeConfig();
    const domain = process.env.FUNCTIONS_EMULATOR
      ? 'http://localhost:5174'
      : 'https://app.futuree.org';

    console.log('[CHECKOUT] Criando sessão de checkout');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: config.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${domain}/dashboard-premium?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/dashboard?payment_status=canceled`,
      metadata: {
        firebaseUID: userId
      },
      allow_promotion_codes: true
    });

    console.log('[CHECKOUT] Sessão criada com sucesso:', session.id);
    res.status(200).json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('[CHECKOUT] Erro ao criar sessão:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor',
      code: error.code || 'unknown_error',
      type: error.type || 'server_error'
    });
  }
});

export const createCustomerPortalSession = onRequest({
  cors: true,
  maxInstances: 10,
  region: 'us-central1',
  memory: '256MiB'
}, async (req: express.Request, res: express.Response) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({ error: 'customerId é obrigatório' });
      return;
    }

    console.log('[PORTAL] Criando sessão do portal para o cliente:', customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: req.body.return_url || 'https://app.futuree.org/dashboard-premium'
    });

    console.log('[PORTAL] Sessão criada com sucesso:', session.id);
    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('[PORTAL] Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}); 