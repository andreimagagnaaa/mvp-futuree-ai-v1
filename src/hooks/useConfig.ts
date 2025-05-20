import { useState, useCallback, useEffect } from 'react';

interface Config {
  apiKey: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  saveHistory: boolean;
  privateMode: boolean;
}

const defaultConfig: Config = {
  apiKey: '',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  saveHistory: true,
  privateMode: false,
};

const CONFIG_STORAGE_KEY = 'ai-chat-config';

export const useConfig = () => {
  const [config, setConfig] = useState<Config>(() => {
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (storedConfig) {
      try {
        return JSON.parse(storedConfig);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }, [config]);

  const updateConfig = useCallback((updates: Partial<Config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  const validateApiKey = useCallback(async (apiKey: string) => {
    try {
      // TODO: Implementar validação da API key
      return true;
    } catch (error) {
      console.error('Erro ao validar API key:', error);
      return false;
    }
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
    validateApiKey,
  };
}; 