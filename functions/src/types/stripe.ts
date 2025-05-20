import { Request } from 'express';

// Tipo para a requisição do webhook do Stripe
export interface StripeWebhookRequest extends Request {
  rawBody: Buffer;
}

// Tipo para eventos do Stripe
export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
  id: string;
  object: string;
  api_version: string;
  created: number;
}

// Tipo para a sessão de checkout
export interface StripeCheckoutSession {
  id: string;
  customer: string;
  subscription: string;
  payment_status: string;
  metadata: {
    firebaseUID?: string;
    userId?: string;
  };
  mode: string;
}

// Tipo para a assinatura
export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
}

// Tipo para o pagamento
export interface StripePaymentIntent {
  id: string;
  customer: string;
  last_payment_error?: {
    message: string;
  };
}

// Tipo para atualizações do Firestore
export interface FirestoreUserUpdate {
  isPremium: boolean;
  stripeCustomerId: string;
  subscriptionId: string;
  subscriptionStatus: string;
  updatedAt: FirebaseFirestore.FieldValue;
  premiumStartDate?: FirebaseFirestore.FieldValue;
  premiumEndDate?: FirebaseFirestore.FieldValue;
  lastPaymentDate?: FirebaseFirestore.FieldValue;
  paymentStatus: string;
  lastWebhookEvent: {
    type: string;
    timestamp: FirebaseFirestore.FieldValue;
    sessionId?: string;
    eventId: string;
    subscriptionId?: string;
  };
} 