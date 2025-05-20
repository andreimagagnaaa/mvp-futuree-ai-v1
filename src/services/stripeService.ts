import { getStripe, getStripeApiUrl, stripeConfig } from '../config/stripe';

interface CheckoutSessionResponse {
  id: string;
  url: string;
}

interface StripeError {
  error: string;
  code: string;
  details: string;
  environment?: 'test' | 'live';
}

export async function createCheckoutSession(
  userId: string, 
  email?: string
): Promise<CheckoutSessionResponse> {
  try {
    // Validação dos parâmetros
    if (!userId) {
      throw new Error('userId é obrigatório');
    }

    // Obtém o PRICE_ID do ambiente
    const priceId = stripeConfig.priceId;
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID não está configurado');
    }

    // Determina o domínio baseado no ambiente
    const domain = import.meta.env.PROD 
      ? stripeConfig.productionDomain
      : stripeConfig.developmentDomain;

    // Define as URLs de sucesso e cancelamento
    const successUrl = `${domain}/dashboard-premium?payment_status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${domain}/dashboard?payment_status=canceled`;

    console.log('Iniciando checkout com:', { 
      userId, 
      email, 
      priceId,
      domain,
      successUrl,
      cancelUrl 
    });

    const response = await fetch(getStripeApiUrl('checkout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        priceId,
        successUrl,
        cancelUrl,
        metadata: {
          firebaseUID: userId,
          userId: userId,
          email: email,
          timestamp: new Date().toISOString()
        },
        subscription_data: {
          metadata: {
            firebaseUID: userId,
            userId: userId,
            email: email,
            timestamp: new Date().toISOString()
          }
        }
      }),
    });

    // Verifica se a resposta está vazia
    const text = await response.text();
    if (!text) {
      console.error('Resposta vazia do servidor de checkout');
      throw new Error('Resposta vazia do servidor');
    }

    // Tenta fazer o parse do JSON
    let data;
    try {
      data = JSON.parse(text);
      console.log('Resposta do servidor de checkout:', data);
    } catch (e) {
      console.error('Erro ao fazer parse da resposta:', text);
      throw new Error('Resposta inválida do servidor');
    }

    // Verifica se há erro na resposta
    if (!response.ok) {
      const error = data as StripeError;
      throw {
        message: error.error,
        code: error.code,
        details: error.details,
        environment: error.environment
      };
    }

    // Verifica se os dados necessários estão presentes
    if (!data.id || !data.url) {
      throw new Error('Resposta incompleta do servidor');
    }

    return {
      id: data.id,
      url: data.url
    };
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);

    // Formata o erro para ser mais amigável
    const formattedError = {
      message: error.message || 'Erro desconhecido',
      code: error.code,
      details: error.details,
      environment: error.environment
    };

    throw formattedError;
  }
}

export async function verifyStripePrice(): Promise<any> {
  try {
    const response = await fetch(getStripeApiUrl('verify-price'));
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  } catch (error: any) {
    console.error('Erro ao verificar preço:', error);
    throw error;
  }
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Não foi possível inicializar o Stripe');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Erro ao redirecionar para checkout:', error);
    throw {
      message: error.message || 'Erro ao redirecionar para o checkout',
      code: 'redirect_error',
      details: error.message
    };
  }
}

export async function createCustomerPortalSession(customerId: string): Promise<string> {
  try {
    const response = await fetch(getStripeApiUrl('customer-portal'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        return_url: window.location.origin + '/dashboard-premium'
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar sessão do portal do cliente');
    }

    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error('Erro ao criar sessão do portal:', error);
    throw error;
  }
} 