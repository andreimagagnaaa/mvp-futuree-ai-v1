import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface InputPanelProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua mensagem..."
        className="resize-none"
        disabled={isLoading}
        rows={1}
      />
      <Button 
        onClick={handleSend} 
        disabled={!message.trim() || isLoading}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}; 