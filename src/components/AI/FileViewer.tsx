import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FiMaximize2, FiMinimize2, FiDownload, FiExternalLink } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface FileViewerProps {
  file: {
    name: string;
    type: string;
    url: string;
    content?: string;
  };
  onClose: () => void;
  className?: string;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  file,
  onClose,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderFileContent = () => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isText = file.type.startsWith('text/') || file.type === 'application/json';

    if (isImage) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe
          src={file.url}
          title={file.name}
          className="w-full h-full"
        />
      );
    }

    if (isText && file.content) {
      return (
        <ScrollArea className="w-full h-full">
          <pre className="p-4 text-sm whitespace-pre-wrap font-mono">
            {file.content}
          </pre>
        </ScrollArea>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground text-center mb-4">
          Visualização não disponível para este tipo de arquivo.
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(file.url, '_blank')}
        >
          <FiExternalLink className="h-4 w-4 mr-2" />
          Abrir no navegador
        </Button>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'flex flex-col',
        isFullscreen
          ? 'fixed inset-4 z-50 bg-background/95 backdrop-blur'
          : 'h-full',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium truncate flex-1">{file.name}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(file.url, '_blank')}
          >
            <FiExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const link = document.createElement('a');
              link.href = file.url;
              link.download = file.name;
              link.click();
            }}
          >
            <FiDownload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <FiMinimize2 className="h-4 w-4" />
            ) : (
              <FiMaximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {renderFileContent()}
      </div>
    </Card>
  );
}; 