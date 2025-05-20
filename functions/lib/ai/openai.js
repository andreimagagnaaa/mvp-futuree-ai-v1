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
exports.marketingPresets = exports.generateAIResponse = exports.limitMessageHistory = void 0;
const openai_1 = __importDefault(require("openai"));
const functions = __importStar(require("firebase-functions"));
// Log das variáveis de ambiente
console.log('Variáveis de ambiente:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Presente' : 'Ausente',
    FIREBASE_CONFIG: functions.config().openai?.key ? 'Presente' : 'Ausente'
});
// Configuração da OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || functions.config().openai?.key,
});
// Limite de tokens para controle de custo
const MAX_TOKENS = 4000;
const MAX_MESSAGES_HISTORY = 10;
// System prompt base para marketing digital
const SYSTEM_PROMPT = `Você é um assistente especializado em marketing digital, focado em ajudar profissionais e empresas a melhorarem suas estratégias de marketing online. Suas respostas devem ser:
1. Práticas e acionáveis
2. Baseadas em dados e melhores práticas atuais
3. Adaptadas ao contexto do usuário
4. Focadas em resultados mensuráveis`;
// Função para limitar o histórico de mensagens
const limitMessageHistory = (messages) => {
    if (messages.length <= MAX_MESSAGES_HISTORY)
        return messages;
    // Mantém o system prompt e as últimas mensagens
    return [
        messages[0],
        ...messages.slice(-MAX_MESSAGES_HISTORY + 1) // Últimas mensagens
    ];
};
exports.limitMessageHistory = limitMessageHistory;
// Função principal para gerar resposta da IA
const generateAIResponse = async (messages, presetContext) => {
    try {
        // Log detalhado da configuração
        console.log('Iniciando generateAIResponse:', {
            hasApiKey: !!openai.apiKey,
            messagesCount: messages.length,
            hasPresetContext: !!presetContext
        });
        // Adiciona o preset ao contexto se fornecido
        const contextualizedMessages = presetContext
            ? [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'system', content: presetContext },
                ...messages.slice(1)
            ]
            : messages;
        // Limita o histórico
        const limitedMessages = (0, exports.limitMessageHistory)(contextualizedMessages);
        console.log('Preparando requisição OpenAI:', {
            modelConfig: {
                model: 'gpt-3.5-turbo',
                max_tokens: MAX_TOKENS,
                temperature: 0.7,
                presence_penalty: 0.6,
                frequency_penalty: 0.5,
            },
            messagesCount: limitedMessages.length
        });
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: limitedMessages,
            max_tokens: MAX_TOKENS,
            temperature: 0.7,
            presence_penalty: 0.6,
            frequency_penalty: 0.5,
        });
        if (!completion.choices[0].message?.content) {
            console.error('Resposta vazia da OpenAI:', completion);
            throw new Error('A API retornou uma resposta vazia');
        }
        console.log('Resposta OpenAI recebida com sucesso:', {
            responseLength: completion.choices[0].message?.content.length,
            usage: completion.usage
        });
        return completion.choices[0].message?.content || 'Desculpe, não consegui gerar uma resposta.';
    }
    catch (error) {
        console.error('Erro ao gerar resposta:', error);
        throw new functions.https.HttpsError('internal', 'Erro ao processar sua mensagem. Por favor, tente novamente.');
    }
};
exports.generateAIResponse = generateAIResponse;
// Presets para diferentes contextos de marketing
exports.marketingPresets = {
    googleAds: `Contexto: Criação de campanhas no Google Ads
Foco em:
- Estrutura de campanhas
- Seleção de palavras-chave
- Otimização de orçamento
- Métricas importantes`,
    salesFunnel: `Contexto: Otimização de funil de vendas
Foco em:
- Análise de conversão
- Pontos de atrito
- Automação de marketing
- Nutrição de leads`,
};
//# sourceMappingURL=openai.js.map