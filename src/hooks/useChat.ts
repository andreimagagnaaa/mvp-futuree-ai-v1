import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';

interface ChatConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
  });

  const functions = getFunctions(app);
  const processAIMessage = httpsCallable(functions, 'processAIMessage');

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      try {
        setIsLoading(true);

        // Adiciona a mensagem do usuário
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          role: 'user',
          timestamp: new Date(),
          attachments: attachments?.map(file => ({
            type: file.type,
            url: URL.createObjectURL(file),
            name: file.name,
          })),
        };

        setMessages(prev => [...prev, userMessage]);

        // Chama a função do Firebase
        const result = await processAIMessage({
          message: content,
          messageHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        });

        // Adiciona a resposta da IA
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.data.response,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        // Você pode adicionar um toast ou notificação de erro aqui
      } finally {
        setIsLoading(false);
      }
    },
    [messages, processAIMessage]
  );

  const updateConfig = useCallback((newConfig: Partial<ChatConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    config,
    sendMessage,
    updateConfig,
    clearMessages,
  };
}; 