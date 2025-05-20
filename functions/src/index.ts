import * as admin from 'firebase-admin';
import { stripeWebhook, createCheckoutSession, createCustomerPortalSession } from './stripe';
import { checkPremiumStatus } from './premium-check';

// Inicializa o Firebase Admin
admin.initializeApp();

// Exporta as funções
export {
  stripeWebhook,
  createCheckoutSession,
  createCustomerPortalSession,
  checkPremiumStatus
}; 