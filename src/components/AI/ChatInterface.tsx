import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'react-hot-toast';
import {
  FiSend,
  FiPaperclip,
  FiImage,
  FiFile,
  FiMic,
  FiMaximize2,
  FiMinimize2,
  FiX,
  FiDownload,
  FiCopy,
  FiShare2,
  FiRefreshCw
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useGlobalChat } from '@/contexts/ChatContext';
import type { Message } from '@/types/chat';

export const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isLoading, error } = useGlobalChat();
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Limpa o timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && attachments.length === 0) return;

    try {
      // Limpa qualquer timeout anterior
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }

      // Define um timeout de 30 segundos
      messageTimeoutRef.current = setTimeout(() => {
        toast.error('Tempo limite excedido. Tente novamente.');
        setRetryCount(prev => prev + 1);
      }, 30000);

      await sendMessage(inputMessage, attachments);
      setInputMessage('');
      setAttachments([]);
      setRetryCount(0);

      // Limpa o timeout após sucesso
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetry = async () => {
    if (!messages.length) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      try {
        await sendMessage(lastMessage.content, []);
      } catch (error) {
        console.error('Erro ao reenviar mensagem:', error);
        toast.error('Erro ao reenviar mensagem. Tente novamente.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const MessageActions = () => (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Tooltip content="Copiar">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FiCopy className="h-4 w-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Baixar">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FiDownload className="h-4 w-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Compartilhar">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FiShare2 className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );

  return (
    <TooltipProvider>
      <Card className={cn(
        "flex flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold" style={{ color: '#0066FF' }}>Futuree AI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <FiMinimize2 className="h-4 w-4" />
            ) : (
              <FiMaximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center space-y-8">
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#007BFF] to-[#00A3FF] bg-clip-text text-transparent">
                      Bem-vindo à Futuree AI
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Sou sua assistente de marketing inteligente.
                    </p>
                    <p className="text-gray-600 text-lg">
                      Como posso ajudar você hoje? Digite sua mensagem abaixo para começarmos!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 group",
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <Avatar>
                    {message.role === 'assistant' ? (
                      <>
                        <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                        <AvatarFallback>AI</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>U</AvatarFallback>
                    )}
                  </Avatar>

                  <div className={cn(
                    "flex flex-col gap-2 max-w-[80%]",
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{message.role === 'user' ? 'Você' : 'Assistente'}</span>
                      <span>•</span>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                    </div>

                    <div className={cn(
                      "p-4 rounded-lg",
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                message.role === 'user'
                                  ? 'bg-blue-500 hover:bg-blue-400'
                                  : 'bg-white hover:bg-gray-50'
                              )}
                            >
                              {attachment.type.startsWith('image/') ? (
                                <FiImage className="h-4 w-4" />
                              ) : (
                                <FiFile className="h-4 w-4" />
                              )}
                              <span className="truncate max-w-[150px]">
                                {attachment.name}
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <MessageActions />
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar>
                  <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-500">
                    Assistente está digitando...
                  </div>
                  <div className="p-4 rounded-lg bg-gray-100">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                  {retryCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleRetry}
                    >
                      <FiRefreshCw className="h-4 w-4 mr-2" />
                      Tentar novamente
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-50 text-red-600 text-sm"
              >
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={handleRetry}
                >
                  <FiRefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="space-y-4">
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
                    >
                      {file.type.startsWith('image/') ? (
                        <FiImage className="h-4 w-4" />
                      ) : (
                        <FiFile className="h-4 w-4" />
                      )}
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-gray-200"
                        onClick={() => removeAttachment(index)}
                      >
                        <FiX className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />

              <Tooltip content="Anexar arquivo">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[44px] max-h-[200px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              <Button
                type="submit"
                disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
                className={cn(
                  "transition-all",
                  isLoading && "opacity-70"
                )}
              >
                <FiSend className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </TooltipProvider>
  );
}; 