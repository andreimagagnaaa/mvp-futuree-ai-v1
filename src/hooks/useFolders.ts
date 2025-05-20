import { useState, useCallback } from 'react';

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  chats: Chat[];
}

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);

  const addFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      children: [],
      chats: [],
    };

    setFolders(prev => {
      if (!parentId) {
        return [...prev, newFolder];
      }

      const addToChildren = (folders: Folder[]): Folder[] => {
        return folders.map(folder => {
          if (folder.id === parentId) {
            return {
              ...folder,
              children: [...folder.children, newFolder],
            };
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: addToChildren(folder.children),
            };
          }
          return folder;
        });
      };

      return addToChildren(prev);
    });

    return newFolder.id;
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setFolders(prev => {
      const updateInChildren = (folders: Folder[]): Folder[] => {
        return folders.map(folder => {
          if (folder.id === id) {
            return { ...folder, ...updates };
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: updateInChildren(folder.children),
            };
          }
          return folder;
        });
      };

      return updateInChildren(prev);
    });
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => {
      const deleteFromChildren = (folders: Folder[]): Folder[] => {
        return folders
          .filter(folder => folder.id !== id)
          .map(folder => ({
            ...folder,
            children: deleteFromChildren(folder.children),
          }));
      };

      return deleteFromChildren(prev);
    });
  }, []);

  const addChat = useCallback((folderId: string, chat: Omit<Chat, 'id'>) => {
    const chatId = Date.now().toString();
    const newChat: Chat = { ...chat, id: chatId };

    setFolders(prev => {
      const addToFolder = (folders: Folder[]): Folder[] => {
        return folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              chats: [...folder.chats, newChat],
            };
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: addToFolder(folder.children),
            };
          }
          return folder;
        });
      };

      return addToFolder(prev);
    });

    return chatId;
  }, []);

  const moveChat = useCallback(
    (chatId: string, sourceFolderId: string, targetFolderId: string) => {
      setFolders(prev => {
        let chatToMove: Chat | undefined;

        const removeFromSource = (folders: Folder[]): Folder[] => {
          return folders.map(folder => {
            if (folder.id === sourceFolderId) {
              const [chat] = folder.chats.filter(c => c.id === chatId);
              chatToMove = chat;
              return {
                ...folder,
                chats: folder.chats.filter(c => c.id !== chatId),
              };
            }
            if (folder.children.length > 0) {
              return {
                ...folder,
                children: removeFromSource(folder.children),
              };
            }
            return folder;
          });
        };

        const addToTarget = (folders: Folder[]): Folder[] => {
          return folders.map(folder => {
            if (folder.id === targetFolderId && chatToMove) {
              return {
                ...folder,
                chats: [...folder.chats, chatToMove],
              };
            }
            if (folder.children.length > 0) {
              return {
                ...folder,
                children: addToTarget(folder.children),
              };
            }
            return folder;
          });
        };

        const foldersWithoutChat = removeFromSource(prev);
        return addToTarget(foldersWithoutChat);
      });
    },
    []
  );

  const deleteChat = useCallback((chatId: string, folderId: string) => {
    setFolders(prev => {
      const deleteFromFolder = (folders: Folder[]): Folder[] => {
        return folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              chats: folder.chats.filter(chat => chat.id !== chatId),
            };
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: deleteFromFolder(folder.children),
            };
          }
          return folder;
        });
      };

      return deleteFromFolder(prev);
    });
  }, []);

  return {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    addChat,
    moveChat,
    deleteChat,
  };
}; 