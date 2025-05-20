import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '@/types/chat';
import { FiFile, FiImage, FiMusic } from 'react-icons/fi';

interface MessageListProps {
  messages: Message[];
  isProcessing: boolean;
}

const getAttachmentIcon = (type: string) => {
  if (type.startsWith('image/')) return <FiImage className="h-4 w-4" />;
  if (type.startsWith('audio/')) return <FiMusic className="h-4 w-4" />;
  return <FiFile className="h-4 w-4" />;
};

export const MessageList: React.FC<MessageListProps> = ({ messages, isProcessing }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full pr-4" ref={scrollRef}>
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start gap-3 mb-6 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="w-8 h-8">
              {message.role === 'assistant' ? (
                <AvatarImage src="/ai-avatar.png" alt="AI" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  U
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className={`flex flex-col gap-2 max-w-[80%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">
                  {message.role === 'user' ? 'Você' : 'Assistente'}
                </span>
                <span className="text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <Card className={`p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs ${
                          message.role === 'user'
                            ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                            : 'bg-background/50 hover:bg-background/80'
                        } transition-colors`}
                      >
                        {getAttachmentIcon(attachment.type)}
                        <span className="truncate max-w-[150px]">
                          {attachment.name}
                        </span>
                        {attachment.size && (
                          <span className="text-xs opacity-70">
                            ({Math.round(attachment.size / 1024)} KB)
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 mb-6"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src="/ai-avatar.png" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Assistente</span>
            </div>
            <Card className="bg-muted p-4">
              <div className="flex gap-2">
                <Skeleton className="w-2 h-2 rounded-full animate-bounce" />
                <Skeleton className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" />
                <Skeleton className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </ScrollArea>
  );
}; 