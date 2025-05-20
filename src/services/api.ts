import { ChatConfig } from '@/types/chat';

interface APIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const sendMessage = async (
  message: string,
  config: ChatConfig,
  attachments?: File[]
): Promise<APIResponse> => {
  try {
    // TODO: Implementar chamada à API real
    // Este é apenas um exemplo simulado
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      content: 'Esta é uma resposta simulada da API.',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new APIError(error.message);
    }
    throw new APIError('Erro desconhecido ao enviar mensagem');
  }
};

export const validateAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    // TODO: Implementar validação real da API key
    // Este é apenas um exemplo simulado
    await new Promise(resolve => setTimeout(resolve, 500));

    return apiKey.startsWith('sk-');
  } catch (error) {
    if (error instanceof Error) {
      throw new APIError(error.message);
    }
    throw new APIError('Erro desconhecido ao validar API key');
  }
};

export const uploadFile = async (
  file: File,
  config: ChatConfig
): Promise<string> => {
  try {
    // TODO: Implementar upload real do arquivo
    // Este é apenas um exemplo simulado
    await new Promise(resolve => setTimeout(resolve, 1000));

    return URL.createObjectURL(file);
  } catch (error) {
    if (error instanceof Error) {
      throw new APIError(error.message);
    }
    throw new APIError('Erro desconhecido ao fazer upload do arquivo');
  }
}; 