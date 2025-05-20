import OpenAI from 'openai';
import * as functions from 'firebase-functions';

// Log das variáveis de ambiente
console.log('Variáveis de ambiente:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Presente' : 'Ausente',
  FIREBASE_CONFIG: functions.config().openai?.key ? 'Presente' : 'Ausente'
});

// Configuração da OpenAI
const openai = new OpenAI({
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

// Interface para mensagens do chat
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Função para limitar o histórico de mensagens
export const limitMessageHistory = (messages: ChatMessage[]): ChatMessage[] => {
  if (messages.length <= MAX_MESSAGES_HISTORY) return messages;
  
  // Mantém o system prompt e as últimas mensagens
  return [
    messages[0],
    ...messages.slice(-MAX_MESSAGES_HISTORY + 1) // Últimas mensagens
  ];
};

// Função principal para gerar resposta da IA
export const generateAIResponse = async (
  messages: ChatMessage[],
  presetContext?: string
): Promise<string> => {
  try {
    // Log detalhado da configuração
    console.log('Iniciando generateAIResponse:', {
      hasApiKey: !!openai.apiKey,
      messagesCount: messages.length,
      hasPresetContext: !!presetContext
    });

    // Adiciona o preset ao contexto se fornecido
    const contextualizedMessages: ChatMessage[] = presetContext 
      ? [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: presetContext },
          ...messages.slice(1)
        ]
      : messages;

    // Limita o histórico
    const limitedMessages = limitMessageHistory(contextualizedMessages);

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

  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao processar sua mensagem. Por favor, tente novamente.');
  }
};

// Presets para diferentes contextos de marketing
export const marketingPresets: Record<string, string> = {
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