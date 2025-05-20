"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerPortalSession = exports.createCheckoutSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const functions = __importStar(require("firebase-functions/v2"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const PRICE_ID = process.env.STRIPE_PRICE_ID;
const COLLABORATOR_PRICE_ID = process.env.STRIPE_COLLABORATOR_PRICE_ID;
exports.createCheckoutSession = functions.https.onCall(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    const { userId, userEmail, mode = 'subscription' } = data;
    const user = await admin.firestore().collection('users').doc(userId).get();
    const userData = user.data();
    if (!userData) {
        throw new functions.https.HttpsError('not-found', 'Usuário não encontrado');
    }
    try {
        let session;
        if (mode === 'subscription') {
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [
                    {
                        price: PRICE_ID,
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.WEBAPP_URL}/dashboard-premium?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.WEBAPP_URL}/dashboard`,
                customer_email: userEmail || userData.email,
                metadata: {
                    userId,
                    mode: 'subscription'
                },
            });
        }
        else if (mode === 'add_collaborator') {
            // Verifica se o usuário já tem uma assinatura
            const customer = await stripe.customers.list({
                email: userData.email,
                limit: 1,
            });
            if (!customer.data.length) {
                throw new functions.https.HttpsError('failed-precondition', 'Usuário não possui uma assinatura ativa');
            }
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [
                    {
                        price: COLLABORATOR_PRICE_ID,
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.WEBAPP_URL}/dashboard-premium/settings?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.WEBAPP_URL}/dashboard-premium/settings`,
                customer: customer.data[0].id,
                metadata: {
                    userId,
                    mode: 'add_collaborator'
                },
            });
        }
        if (!session) {
            throw new functions.https.HttpsError('internal', 'Erro ao criar sessão de checkout');
        }
        return { sessionId: session.id };
    }
    catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Erro ao criar sessão de checkout');
    }
});
exports.createCustomerPortalSession = (0, https_1.onRequest)({
    cors: true,
    maxInstances: 10,
    region: 'us-central1',
    memory: '256MiB'
}, async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Método não permitido' });
            return;
        }
        const { customerId } = req.body;
        if (!customerId) {
            res.status(400).json({ error: 'customerId é obrigatório' });
            return;
        }
        console.log('[PORTAL] Criando sessão do portal para o cliente:', customerId);
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: req.body.return_url || 'https://app.futuree.org/dashboard-premium'
        });
        console.log('[PORTAL] Sessão criada com sucesso:', session.id);
        res.status(200).json({ url: session.url });
    }
    catch (error) {
        console.error('[PORTAL] Erro ao criar sessão:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
//# sourceMappingURL=stripe.js.map