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
exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
exports.stripeWebhook = functions.https.onRequest(async (request, response) => {
    const sig = request.headers['stripe-signature'];
    if (!sig) {
        response.status(400).send('Assinatura do webhook não encontrada');
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    }
    catch (err) {
        console.error('Erro ao verificar assinatura do webhook:', err.message);
        response.status(400).send(`Erro de assinatura do webhook: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { userId, mode } = session.metadata || {};
                if (!userId) {
                    throw new Error('userId não encontrado nos metadados da sessão');
                }
                const userRef = admin.firestore().collection('users').doc(userId);
                if (mode === 'subscription') {
                    await userRef.update({
                        isPremium: true,
                        stripeCustomerId: session.customer,
                        stripeSubscriptionId: session.subscription,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                else if (mode === 'add_collaborator') {
                    // Atualiza o número de colaboradores permitidos
                    await userRef.update({
                        collaboratorsLimit: admin.firestore.FieldValue.increment(1),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;
                const userSnapshot = await admin.firestore()
                    .collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .get();
                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    await userDoc.ref.update({
                        isPremium: false,
                        stripeSubscriptionId: null,
                        collaboratorsLimit: 0,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    // Remove todos os colaboradores
                    const collaboratorsSnapshot = await admin.firestore()
                        .collection('collaborators')
                        .where('ownerId', '==', userDoc.id)
                        .get();
                    const batch = admin.firestore().batch();
                    collaboratorsSnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                }
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = invoice.customer;
                const userSnapshot = await admin.firestore()
                    .collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .get();
                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    // Notificar o usuário sobre a falha no pagamento
                    await admin.firestore().collection('notifications').add({
                        userId: userDoc.id,
                        type: 'payment_failed',
                        title: 'Falha no pagamento',
                        message: 'Houve uma falha no processamento do seu pagamento. Por favor, atualize suas informações de pagamento.',
                        read: false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                break;
            }
        }
        response.json({ received: true });
    }
    catch (error) {
        console.error('Erro ao processar webhook:', error);
        response.status(500).send(`Erro ao processar webhook: ${error.message}`);
    }
});
//# sourceMappingURL=stripe-webhook.js.map