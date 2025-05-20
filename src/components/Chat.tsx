import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageList } from './AI/MessageList';
import { InputPanel } from './InputPanel';
import { useChat } from '@/contexts/ChatContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export const Chat: React.FC = () => {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <TooltipProvider>
      <Card className="w-full h-[600px] flex flex-col">
        <MessageList messages={messages} isProcessing={isLoading} />
        <InputPanel onSendMessage={sendMessage} isLoading={isLoading} />
      </Card>
    </TooltipProvider>
  );
}; 