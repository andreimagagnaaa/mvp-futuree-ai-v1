import { loadStripe } from '@stripe/stripe-js';

// Função para validar variáveis de ambiente
const validateEnvVariables = () => {
  // Log do ambiente de execução
  console.log('Ambiente de execução:', {
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    developmentDomain: import.meta.env.VITE_DEVELOPMENT_DOMAIN,
    productionDomain: import.meta.env.VITE_PRODUCTION_DOMAIN
  });

  const requiredVars = {
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_STRIPE_PRICE_ID: import.meta.env.VITE_STRIPE_PRICE_ID,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_DEVELOPMENT_DOMAIN: import.meta.env.VITE_DEVELOPMENT_DOMAIN,
    VITE_PRODUCTION_DOMAIN: import.meta.env.VITE_PRODUCTION_DOMAIN
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      `Variáveis de ambiente não encontradas: ${missingVars.join(', ')}\n` +
      'Usando valores padrão.'
    );
  }

  return requiredVars;
};

// Configurações do Stripe
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51REXAs2L5tedmwK49WRGo9tU35ObX0rbFZGKplm1fBI4aJ4F4WEOZe7MXrShiLbI8TOpVfw8v0uchLZehdYlaesR00oOw1pxAl',
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1ROQqH2L5tedmwK4XAkS1LWO',
  apiUrl: import.meta.env.VITE_API_URL || 'https://us-central1-futuree-ai.cloudfunctions.net',
  developmentDomain: import.meta.env.VITE_DEVELOPMENT_DOMAIN || 'http://localhost:5173',
  productionDomain: import.meta.env.VITE_PRODUCTION_DOMAIN || 'https://app.futuree.org'
};

// Validar configurações ao importar o módulo
validateEnvVariables();

// Singleton para o cliente Stripe
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey);
  }
  return stripePromise;
};

// Função para obter URL da API do Stripe
export const getStripeApiUrl = (endpoint: string) => {
  return `${stripeConfig.apiUrl}/api/stripe/${endpoint}`;
};

// Determina o domínio baseado no ambiente
const domain = import.meta.env.PROD
  ? stripeConfig.productionDomain
  : stripeConfig.developmentDomain;

// Log do valor final do domain
console.log('Valor final do domain:', domain); 