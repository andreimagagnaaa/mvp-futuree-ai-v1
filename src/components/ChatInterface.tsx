import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Alert, Button, TextField, CircularProgress, Box, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isLoading, error } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setLocalError(null);
      await sendMessage(input.trim());
      setInput('');
      setRetryCount(0);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      
      if (retryCount < maxRetries && errorMessage.includes('404')) {
        setRetryCount(prev => prev + 1);
        console.log(`Tentativa ${retryCount + 1} de ${maxRetries}`);
        setTimeout(() => handleSubmit(e), 1000); // Retry after 1 second
        return;
      }
      
      setLocalError(errorMessage);
      if (retryCount >= maxRetries) {
        setLocalError(`${errorMessage} (Máximo de tentativas atingido)`);
      }
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      maxWidth: '800px', 
      margin: '0 auto', 
      p: 2 
    }}>
      {(error || localError) && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            retryCount > 0 && (
              <Typography variant="caption" sx={{ ml: 2 }}>
                Tentativa {retryCount} de {maxRetries}
              </Typography>
            )
          }
        >
          {error || localError}
        </Alert>
      )}

      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        mb: 2, 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 1 
      }}>
        {messages.map((message, index) => (
          <Box
            key={message.id || index}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: message.role === 'user' ? 'primary.light' : 'secondary.light',
              color: 'text.primary',
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
            <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>
              {message.timestamp.toLocaleString()}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          error={!!error || !!localError}
          sx={{ bgcolor: 'background.paper' }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !input.trim()}
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Enviar
        </Button>
      </form>
    </Box>
  );
}; 