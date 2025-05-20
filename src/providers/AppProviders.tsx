import React, { ReactNode } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from 'react-hot-toast';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ChatProvider>
      {children}
      <Toaster position="top-right" />
    </ChatProvider>
  );
}; 