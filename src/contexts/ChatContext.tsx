import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePrompts } from '@/hooks/usePrompts';
import { useConfig } from '@/hooks/useConfig';
import { useFolders } from '@/hooks/useFolders';
import type { Prompt, ChatConfig, Folder, Chat, Message, Attachment } from '@/types/chat';
import { app } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { OPENAI_CONFIG, SYSTEM_PROMPT } from '@/config/openai';

// Configuração da API
const API_CONFIG = {
  development: {
    // Configuração alternativa para teste
    baseUrl: 'https://us-central1-teste-86bd7.cloudfunctions.net',
    endpoint: '/chat'
  },
  production: {
    baseUrl: 'https://us-central1-teste-86bd7.cloudfunctions.net',
    endpoint: '/chat'
  }
};

// Configuração de retry
const RETRY_CONFIG = {
  maxRetries: 3,
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000
};

// Função para verificar se a API está acessível
const checkApiHealth = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'omit'
    });
    return response.ok || response.status === 204;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

const getCurrentConfig = () => {
  const isDev = import.meta.env.DEV;
  const config = isDev ? API_CONFIG.development : API_CONFIG.production;
  return {
    ...config,
    fullUrl: `${config.baseUrl}${config.endpoint}`
  };
};

const API_URL = getCurrentConfig().fullUrl;

// Função de log aprimorada
const logger = {
  debug: (context: string, data: any) => {
    console.log(`[${new Date().toISOString()}] [DEBUG] ${context}:`, data);
  },
  error: (context: string, error: any) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${context}:`, {
      message: error?.message,
      stack: error?.stack,
      details: error
    });
  },
  info: (context: string, data: any) => {
    console.info(`[${new Date().toISOString()}] [INFO] ${context}:`, data);
  }
};

const db = getFirestore(app);
const auth = getAuth(app);

interface ChatContextValue {
  // Chat
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;

  // Prompts
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  getPromptsByTag: (tag: string) => Prompt[];
  searchPrompts: (searchTerm: string) => Prompt[];

  // Config
  config: ChatConfig;
  updateConfig: (updates: Partial<ChatConfig>) => void;
  resetConfig: () => void;
  validateApiKey: (apiKey: string) => Promise<boolean>;

  // Folders
  folders: Folder[];
  addFolder: (name: string, parentId?: string) => string;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  addChat: (folderId: string, chat: Omit<Chat, 'id'>) => string;
  moveChat: (chatId: string, sourceFolderId: string, targetFolderId: string) => void;
  deleteChat: (chatId: string, folderId: string) => void;
  getFolderById: (id: string) => Folder | undefined;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const getAuthToken = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 3;
  const retryDelay = 1000;

  while (attempts < maxAttempts) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const token = await user.getIdToken(true);
      if (!token) {
        throw new Error('Token não gerado');
      }

      return token;
    } catch (error) {
      attempts++;
      logger.error('Erro ao obter token de autenticação', error);
      
      if (attempts === maxAttempts) {
        throw new Error('Falha ao obter token de autenticação após várias tentativas');
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
    }
  }

  throw new Error('Falha ao obter token de autenticação');
};

// Função de delay exponencial
const getRetryDelay = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  return delay + Math.random() * 1000; // Adiciona jitter
};

// Função para fazer request com retry
const fetchWithRetry = async (url: string, options: RequestInit): Promise<Response> => {
  let attempt = 0;
  
  while (attempt < RETRY_CONFIG.maxAttempts) {
    try {
      const token = await getAuthToken();
      console.log('Tentando conexão com:', url, { 
        ...options, 
        headers: { 
          ...options.headers,
          Authorization: `Bearer ${token}`,
          Origin: window.location.origin
        } 
      });
      
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin,
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        console.error('Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error: unknown) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Tentativa ${attempt} falhou:`, errorMessage);
      
      if (attempt === RETRY_CONFIG.maxAttempts) {
        throw new Error(`Falha após ${RETRY_CONFIG.maxAttempts} tentativas: ${errorMessage}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
    }
  }
  
  throw new Error('Número máximo de tentativas excedido');
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptsByTag,
    searchPrompts,
  } = usePrompts();

  const {
    config,
    updateConfig,
    resetConfig,
  } = useConfig();

  const {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
  } = useFolders();

  const getFolderById = (id: string): Folder | undefined => {
    return folders.find(folder => folder.id === id);
  };

  // Carregar mensagens do chat atual
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId || !auth.currentUser) return;

      try {
        const messagesRef = collection(db, 'chats', currentChatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const loadedMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        setMessages(loadedMessages);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast.error('Erro ao carregar mensagens');
      }
    };

    loadMessages();
  }, [currentChatId]);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim() || !auth.currentUser) {
      throw new Error('Mensagem vazia ou usuário não autenticado');
    }

    setIsLoading(true);
    setError(null);

    const requestId = Date.now().toString();
    const config = getCurrentConfig();
    
    logger.info('Configuração atual', {
      isDev: import.meta.env.DEV,
      config,
      requestId,
      timestamp: new Date().toISOString()
    });

    try {
      // Verifica saúde da API antes de enviar
      logger.info('Verificando saúde da API', { 
        url: API_URL,
        timestamp: new Date().toISOString()
      });
      const isHealthy = await checkApiHealth(API_URL);
      if (!isHealthy) {
        throw new Error('API não está respondendo corretamente');
      }

      const token = await getAuthToken();
      logger.info('Token obtido com sucesso', {
        timestamp: new Date().toISOString()
      });

      const requestBody = { message: content };
      logger.info('Enviando requisição', {
        url: API_URL,
        method: 'POST',
        body: requestBody,
        timestamp: new Date().toISOString()
      });

      const response = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': requestId
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      logger.info('Resposta recebida', { 
        data,
        timestamp: new Date().toISOString()
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar mensagem');
      }

      // Adiciona mensagem do usuário
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date()
      };

      // Adiciona resposta da AI
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);

      // Salva no Firestore se houver um chat atual
      if (currentChatId) {
        try {
          const chatRef = doc(db, 'chats', currentChatId);
          const messagesRef = collection(chatRef, 'messages');
          
          await Promise.all([
            addDoc(messagesRef, userMessage),
            addDoc(messagesRef, aiMessage)
          ]);
          
          logger.info('Mensagens salvas no Firestore', {
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Erro ao salvar mensagens no Firestore', error);
          toast.error('Erro ao salvar histórico da conversa');
        }
      }

    } catch (error) {
      logger.error('Erro ao enviar mensagem', error);
      
      let errorMessage = 'Erro ao enviar mensagem';
      if (error instanceof Error) {
        if (error.message.includes('API não está respondendo')) {
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
        } else if (error.message.includes('token')) {
          errorMessage = 'Erro de autenticação. Por favor, faça login novamente.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Nossa equipe foi notificada.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Erro ao validar API key:', error);
      return false;
    }
  };

  const addChat = (folderId: string, chat: Omit<Chat, 'id'>): string => {
    // Implementação pendente
    return 'new-chat-id';
  };

  const moveChat = (chatId: string, sourceFolderId: string, targetFolderId: string) => {
    // Implementação pendente
  };

  const deleteChat = (chatId: string, folderId: string) => {
    // Implementação pendente
  };

  const value: ChatContextValue = {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    currentChatId,
    setCurrentChatId,
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptsByTag,
    searchPrompts,
    config,
    updateConfig,
    resetConfig,
    validateApiKey,
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    getFolderById,
    addChat,
    moveChat,
    deleteChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useGlobalChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useGlobalChat deve ser usado dentro de um ChatProvider');
  }
  return context;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 