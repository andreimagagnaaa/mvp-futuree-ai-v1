import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FiFolder, FiFolderPlus, FiEdit2, FiTrash2, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface Folder {
  id: string;
  name: string;
  children: Folder[];
  chats: Array<{
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
  }>;
}

interface FolderStructureProps {
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({
  selectedFolder,
  onFolderSelect,
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      children: [],
      chats: [],
    };

    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const renderFolder = (folder: Folder, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
            isSelected && 'bg-muted',
            depth > 0 && 'ml-4'
          )}
          onClick={() => onFolderSelect(folder.id)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
          >
            {isExpanded ? (
              <FiChevronDown className="h-4 w-4" />
            ) : (
              <FiChevronRight className="h-4 w-4" />
            )}
          </Button>

          <FiFolder className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{folder.name}</span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <FiEdit2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
              <FiTrash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-4 space-y-1">
            {folder.children.map((child) => renderFolder(child, depth + 1))}
            {folder.chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="w-4" />
                <span className="text-sm truncate">{chat.title}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between p-2">
        <h3 className="text-lg font-semibold">Pastas</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreatingFolder(true)}
        >
          <FiFolderPlus className="h-4 w-4 mr-2" />
          Nova Pasta
        </Button>
      </div>

      {isCreatingFolder && (
        <div className="px-2 flex gap-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nome da pasta"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              } else if (e.key === 'Escape') {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleCreateFolder}>
            Criar
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {folders.map((folder) => renderFolder(folder))}
        </div>
      </ScrollArea>
    </div>
  );
}; 