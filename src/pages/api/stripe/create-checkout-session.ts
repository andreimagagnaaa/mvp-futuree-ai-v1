import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getBaseUrl } from '../../../utils/url';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${getBaseUrl()}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/dashboard?upgrade=cancel`,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    return res.status(200).json({ checkoutUrl: session.url });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({ error: error.message });
  }
} 