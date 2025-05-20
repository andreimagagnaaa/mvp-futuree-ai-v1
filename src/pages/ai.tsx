import React, { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/AI/ChatInterface';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from '@/lib/firebase';

const AIPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    
    // Faz login anônimo se não houver usuário
    if (!auth.currentUser) {
      signInAnonymously(auth)
        .then(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Erro ao fazer login:', error);
          setError('Erro ao inicializar o chat. Por favor, recarregue a página.');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen p-4">
      <ChatInterface />
    </div>
  );
};

export default AIPage; 