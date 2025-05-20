import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { userId, eventType, quantity = 1 } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({ error: 'userId e eventType são obrigatórios' });
    }

    // Reporta o uso do medidor para o Stripe
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      userId, // Este deve ser o ID do item da assinatura do Stripe
      {
        quantity,
        timestamp: 'now',
        action: 'increment',
      }
    );

    return res.status(200).json({ success: true, usageRecord });
  } catch (error: any) {
    console.error('Erro ao registrar uso no Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
} 