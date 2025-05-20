import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createApiRequestsMeter() {
  try {
    // Cria o medidor no Stripe
    const meter = await stripe.products.create({
      name: 'Solicitações de API',
      description: 'Medidor para contabilizar solicitações de API por usuário',
      metadata: {
        type: 'api_requests'
      }
    });

    // Cria a configuração de preço baseada em uso
    const price = await stripe.prices.create({
      product: meter.id,
      currency: 'brl',
      recurring: {
        interval: 'month',
        usage_type: 'metered',
        aggregate_usage: 'sum', // Soma todas as solicitações do mês
      },
      unit_amount: 1, // Valor por unidade em centavos
      metadata: {
        type: 'api_requests'
      }
    });

    return { meter, price };
  } catch (error) {
    console.error('Erro ao criar medidor no Stripe:', error);
    throw error;
  }
}

export async function reportApiUsage(subscriptionItemId: string, quantity: number = 1) {
  try {
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: 'now',
        action: 'increment',
      }
    );

    return usageRecord;
  } catch (error) {
    console.error('Erro ao reportar uso da API:', error);
    throw error;
  }
}

export async function getApiUsage(subscriptionItemId: string) {
  try {
    const usageRecordSummaries = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId
    );

    return usageRecordSummaries;
  } catch (error) {
    console.error('Erro ao obter uso da API:', error);
    throw error;
  }
}

export async function reportActiveUsers(subscriptionItemId: string, userCount: number) {
  try {
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity: userCount,
        timestamp: 'now',
        action: 'set', // Usa 'set' em vez de 'increment' para definir o valor absoluto
      }
    );

    return usageRecord;
  } catch (error) {
    console.error('Erro ao reportar número de usuários ativos:', error);
    throw error;
  }
} 