import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Inicializa o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { plano, userId } = req.body;

    if (!plano || !userId) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: 'plano e userId são obrigatórios'
      });
    }

    // Mapeia o plano para o priceId correto
    const precos = {
      basic: process.env.STRIPE_PRICE_ID_BASIC,
      pro: process.env.STRIPE_PRICE_ID_PRO,
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    };

    const priceId = precos[plano as keyof typeof precos];

    if (!priceId) {
      return res.status(400).json({ 
        error: 'Plano inválido',
        details: 'O plano especificado não existe'
      });
    }

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      customer_email: req.body.email, // opcional
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: userId,
        plano: plano,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plano: plano,
        },
      },
    });

    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({ 
      error: 'Erro ao criar sessão de pagamento',
      details: error.message 
    });
  }
} 