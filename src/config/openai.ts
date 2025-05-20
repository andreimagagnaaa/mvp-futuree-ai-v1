import OpenAI from 'openai';

// Configuração da OpenAI
export const OPENAI_CONFIG = {
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7,
  presencePenalty: 0.6,
  frequencyPenalty: 0.5,
  timeout: 10000,
};

// Prompt do sistema que define o comportamento do assistente
export const SYSTEM_PROMPT = `Você é um assistente de marketing especializado em ajudar empresas a melhorar suas estratégias digitais.
Seja direto e conciso em suas respostas, focando nos pontos mais importantes.
Limite suas respostas a no máximo 3-4 parágrafos.

Conhecimentos:
- Marketing Digital
- SEO
- Mídia Paga
- Analytics
- Automação de Marketing
- Growth Hacking

Diretrizes:
1. Respostas objetivas e práticas
2. Foco em resultados rápidos
3. Sugestões acionáveis
4. Adaptação ao contexto`;

// Função para criar a configuração da OpenAI
export const createOpenAIConfig = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('API Key da OpenAI não encontrada nas variáveis de ambiente');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

// Função para validar a API Key
export const validateApiKey = async (): Promise<boolean> => {
  try {
    const openai = createOpenAIConfig();
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('Erro ao validar API Key:', error);
    return false;
  }
}; 