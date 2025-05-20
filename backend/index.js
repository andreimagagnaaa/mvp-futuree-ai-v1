import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Validação inicial das variáveis de ambiente
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Erro: Variáveis de ambiente obrigatórias não encontradas:', missingVars.join(', '));
  process.exit(1);
}

const app = express();

// Inicialização do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging detalhado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
    code: 'internal_server_error'
  });
});

// Rota raiz para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor Futuree AI está funcionando!',
    endpoints: {
      checkout: '/api/stripe/checkout',
      verifyPrice: '/api/stripe/verify-price'
    }
  });
});

// Rota para verificar o preço no Stripe
app.get('/api/stripe/verify-price', async (req, res) => {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    console.log('Verificando preço:', priceId);

    const price = await stripe.prices.retrieve(priceId);
    
    res.json({
      status: 'success',
      price: {
        id: price.id,
        active: price.active,
        currency: price.currency,
        unit_amount: price.unit_amount,
        recurring: price.recurring,
        product: price.product
      }
    });
  } catch (error) {
    console.error('Erro ao verificar preço:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Preço não encontrado ou inválido',
        code: 'invalid_price',
        details: error.message,
        environment: error.message.includes('test mode') ? 'test' : 'live'
      });
    }

    res.status(500).json({
      error: 'Erro ao verificar preço',
      code: 'price_verification_error',
      details: error.message
    });
  }
});

// Rota para criar sessão de checkout
app.post('/api/stripe/checkout', async (req, res) => {
  console.log('Iniciando criação de sessão de checkout');
  
  try {
    const { userId, email, priceId } = req.body;

    // Validação dos parâmetros
    if (!userId || !priceId) {
      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'missing_parameters',
        details: 'userId e priceId são obrigatórios'
      });
    }

    // Validação do preço no Stripe
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active) {
        return res.status(400).json({
          error: 'Preço inativo no Stripe',
          code: 'inactive_price',
          details: 'O preço especificado está inativo'
        });
      }
      
      console.log('Preço validado com sucesso:', {
        id: price.id,
        active: price.active,
        currency: price.currency
      });

    } catch (priceError) {
      console.error('Erro ao validar preço:', priceError);
      return res.status(400).json({
        error: 'Price ID inválido ou não encontrado no Stripe',
        code: 'invalid_price_id',
        details: priceError.message,
        environment: priceError.message.includes('test mode') ? 'test' : 'live'
      });
    }

    // Criação da sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      customer_email: email,
      line_items: [
        {
          price: priceId,
        },
      ],
      success_url: `${process.env.APP_URL || 'https://app.futuree.org'}/dashboard-premium?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.APP_URL || 'https://app.futuree.org'}/dashboard`,
      metadata: {
        firebaseUID: userId,
        userId: userId
      },
      subscription_data: {
        metadata: {
          firebaseUID: userId,
          userId: userId
        },
      },
    });

    console.log('Sessão de checkout criada com sucesso:', {
      sessionId: session.id,
      userId,
      metadata: session.metadata,
      subscription_data: session.subscription_data
    });

    res.json({
      id: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    
    // Tratamento de erros específicos do Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Requisição inválida para o Stripe',
        code: error.code || 'stripe_invalid_request',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'internal_server_error',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Configurações do Stripe carregadas com sucesso');
}); 