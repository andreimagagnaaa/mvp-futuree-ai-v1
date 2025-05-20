import { useState, useCallback } from 'react';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const addPrompt = useCallback((prompt: Omit<Prompt, 'id'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
    };
    setPrompts(prev => [...prev, newPrompt]);
  }, []);

  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts(prev =>
      prev.map(prompt =>
        prompt.id === id ? { ...prompt, ...updates } : prompt
      )
    );
  }, []);

  const deletePrompt = useCallback((id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id));
  }, []);

  const getPromptsByTag = useCallback(
    (tag: string) => {
      return prompts.filter(prompt => prompt.tags.includes(tag));
    },
    [prompts]
  );

  const searchPrompts = useCallback(
    (searchTerm: string) => {
      const term = searchTerm.toLowerCase();
      return prompts.filter(
        prompt =>
          prompt.title.toLowerCase().includes(term) ||
          prompt.content.toLowerCase().includes(term) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(term))
      );
    },
    [prompts]
  );

  return {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptsByTag,
    searchPrompts,
  };
}; 