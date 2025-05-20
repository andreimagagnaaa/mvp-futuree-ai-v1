import { loadStripe } from '@stripe/stripe-js';

// Garante que o Stripe é inicializado apenas uma vez
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Stripe publishable key não está configurada');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}; 