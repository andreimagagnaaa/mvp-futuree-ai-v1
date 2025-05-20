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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPremiumStatus = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
// Função que será executada diariamente para verificar assinaturas expiradas
exports.checkPremiumStatus = (0, scheduler_1.onSchedule)({
    schedule: '0 0 * * *', // Executa todos os dias à meia-noite
    timeZone: 'America/Sao_Paulo',
    memory: '256MiB'
}, async (_context) => {
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    try {
        // Busca usuários premium com último pagamento há mais de 30 dias
        const usersSnapshot = await admin.firestore()
            .collection('users')
            .where('isPremium', '==', true)
            .where('lastPaymentDate', '<=', thirtyDaysAgo)
            .get();
        if (usersSnapshot.empty) {
            console.log('[PREMIUM-CHECK] Nenhum usuário premium expirado encontrado');
            return;
        }
        console.log(`[PREMIUM-CHECK] Encontrados ${usersSnapshot.size} usuários com premium expirado`);
        // Array para armazenar as promessas de atualização
        const updatePromises = usersSnapshot.docs.map(async (doc) => {
            const userData = doc.data();
            console.log('[PREMIUM-CHECK] Removendo acesso premium do usuário:', {
                userId: doc.id,
                lastPaymentDate: userData.lastPaymentDate,
                subscriptionStatus: userData.subscriptionStatus
            });
            return doc.ref.update({
                isPremium: false,
                hasPremiumAccess: false,
                premiumVerified: false,
                premiumEndDate: admin.firestore.FieldValue.serverTimestamp(),
                subscriptionStatus: 'expired',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastWebhookEvent: {
                    type: 'premium.expired',
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    details: 'Premium removido por falta de renovação após 30 dias'
                }
            });
        });
        // Executa todas as atualizações em paralelo
        await Promise.all(updatePromises);
        console.log('[PREMIUM-CHECK] Processamento concluído com sucesso');
    }
    catch (error) {
        console.error('[PREMIUM-CHECK] Erro ao processar verificação de premium:', error);
        throw error;
    }
});
//# sourceMappingURL=premium-check.js.map