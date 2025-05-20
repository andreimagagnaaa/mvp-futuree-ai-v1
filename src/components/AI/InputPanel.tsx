import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FiSend, FiUpload, FiMic, FiImage, FiFile, FiX, FiPaperclip } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';

interface InputPanelProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  isProcessing: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  onSendMessage,
  isProcessing
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    onSendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <TooltipProvider>
      <Card className="relative">
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
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
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm"
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
                      className="h-5 w-5 hover:bg-background/50"
                      onClick={() => removeAttachment(index)}
                    >
                      <FiX className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 items-end">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.txt"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  showAttachMenu && "text-primary",
                  attachments.length > 0 && "text-primary"
                )}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <FiPaperclip className="h-4 w-4" />
              </Button>

              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 bg-popover rounded-lg shadow-lg border p-2 flex gap-1"
                  >
                    <Tooltip content="Enviar arquivo">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = "*/*";
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <FiUpload className="h-4 w-4" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Enviar imagem">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = "image/*";
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <FiImage className="h-4 w-4" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Enviar documento">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = "application/pdf,.doc,.docx,.txt";
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <FiFile className="h-4 w-4" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Gravar áudio (em breve)">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled
                      >
                        <FiMic className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[44px] max-h-[200px] resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={isProcessing || (!message.trim() && attachments.length === 0)}
              className={cn(
                "transition-all",
                isProcessing && "opacity-70"
              )}
            >
              <FiSend className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </TooltipProvider>
  );
}; 