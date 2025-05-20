import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInterface } from './ChatInterface';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  FiMessageSquare,
  FiCode,
  FiImage,
  FiCpu,
  FiTrendingUp,
  FiLayout,
  FiPieChart,
  FiTarget,
  FiBookmark,
  FiChevronRight,
  FiSearch,
  FiTool,
  FiCopy,
  FiPenTool,
  FiFolder,
  FiFile,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
  FiBriefcase,
  FiUpload,
  FiUsers,
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiMove,
  FiChevronDown
} from 'react-icons/fi';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useGlobalChat } from '@/contexts/ChatContext';

// Estrutura de pastas simulada
const folders = [
  {
    id: 'marketing',
    name: 'Marketing',
    icon: FiFolder,
    files: [
      { id: 'social', name: 'Social Media', icon: FiFile },
      { id: 'email', name: 'Email Marketing', icon: FiFile }
    ]
  },
  {
    id: 'vendas',
    name: 'Vendas',
    icon: FiFolder,
    files: [
      { id: 'crm', name: 'CRM', icon: FiFile },
      { id: 'propostas', name: 'Propostas', icon: FiFile }
    ]
  }
];

const marketingTemplates = [
  {
    id: 'social-media',
    title: 'Estratégia de Redes Sociais',
    description: 'Desenvolva uma estratégia completa para suas redes sociais',
    icon: FiLayout,
    prompts: [
      {
        title: 'Criar Calendário de Conteúdo',
        prompt: `Crie um calendário de conteúdo detalhado para o próximo mês seguindo estas diretrizes:

1. Público-alvo: [descreva seu público]
2. Objetivos principais: [liste seus objetivos]
3. Redes sociais utilizadas: [liste as redes]
4. Tom de voz da marca: [descreva o tom]

Por favor, inclua:
- 20 ideias de posts com copywriting
- Melhores horários para postagem
- Hashtags relevantes
- Tipos de conteúdo (vídeo, imagem, texto)
- Temas e campanhas sazonais`
      },
      {
        title: 'Gerar Posts Engajadores',
        prompt: `Crie uma série de posts altamente engajadores para minha marca:

Informações da marca:
- Nome: [nome da marca]
- Setor: [setor de atuação]
- Diferencial: [principal diferencial]
- Público: [público-alvo]

Necessito de:
1. 5 posts informativos
2. 5 posts de storytelling
3. 5 posts promocionais
4. 5 posts interativos

Para cada post, forneça:
- Texto principal
- Call-to-action
- Hashtags sugeridas
- Tipo de mídia recomendada`
      },
      {
        title: 'Análise de Métricas',
        prompt: `Analise as seguintes métricas de redes sociais e forneça recomendações estratégicas:

Métricas atuais:
- Alcance: [número]
- Engajamento: [taxa]
- Conversões: [número]
- Melhor horário: [horários]
- Posts mais populares: [temas]

Por favor, forneça:
1. Análise detalhada do desempenho
2. Pontos de melhoria
3. Estratégias recomendadas
4. Metas sugeridas para próximo mês
5. Táticas para aumentar engajamento`
      }
    ]
  },
  {
    id: 'ads',
    title: 'Campanhas de Anúncios',
    description: 'Otimize suas campanhas de marketing digital',
    icon: FiTarget,
    prompts: [
      {
        title: 'Criar Copy para Anúncios',
        prompt: `Desenvolva copies persuasivos para uma campanha de anúncios:

Informações do produto/serviço:
- Nome: [nome]
- Benefícios principais: [liste 3-5]
- Preço: [valor]
- Público-alvo: [descrição]
- Objeções comuns: [liste as principais]

Necessito de:
1. 5 headlines chamativas (max. 30 caracteres)
2. 5 descrições persuasivas (max. 90 caracteres)
3. 3 call-to-actions diferentes
4. 5 variações de texto principal
5. Palavras-chave emocionais sugeridas`
      },
      {
        title: 'Definir Público-Alvo',
        prompt: `Ajude-me a definir e segmentar o público-alvo ideal para minha campanha:

Sobre o produto/serviço:
- Descrição: [descreva]
- Preço médio: [valor]
- Benefícios: [liste]
- Localização: [região]

Por favor, defina:
1. Perfil demográfico detalhado
2. Interesses e comportamentos
3. Dores e necessidades
4. Objeções comuns
5. Canais preferidos
6. Critérios de segmentação para ads
7. Lookalike audiences sugeridas`
      },
      {
        title: 'Otimizar Palavras-Chave',
        prompt: `Ajude-me a otimizar as palavras-chave para minha campanha:

Informações da campanha:
- Produto/Serviço: [descreva]
- Orçamento mensal: [valor]
- Objetivo principal: [objetivo]
- Concorrentes principais: [liste]

Necessito de:
1. 20 palavras-chave principais
2. 10 palavras-chave long-tail
3. 10 palavras-chave negativas
4. Sugestões de match types
5. Estimativa de lance por palavra-chave
6. Grupos de anúncios sugeridos
7. Estrutura de campanha recomendada`
      }
    ]
  },
  {
    id: 'performance',
    title: 'Marketing de Performance',
    description: 'Atraia leads qualificados com campanhas otimizadas',
    icon: FiTrendingUp,
    prompts: [
      {
        title: 'Criação de Campanhas para Geração de Leads',
        prompt: `Desenvolva uma campanha completa de geração de leads com foco em performance:

Informações da empresa:
- Nicho: [segmento de atuação]
- Produto/Serviço: [oferta principal]
- Público-alvo: [perfil de cliente ideal]
- Objetivo: [meta de geração de leads ou CPL desejado]
- Orçamento disponível: [valor estimado]

Por favor, forneça:
1. Estratégia de mídia paga (plataformas, formatos, verba sugerida)
2. Estrutura de funil de conversão (Topo, Meio, Fundo)
3. Ganchos e propostas de valor para os anúncios
4. Sugestões de criativos (imagens, vídeos, variações de texto)
5. Página de destino ideal (estrutura e elementos-chave)
6. Estratégia de follow-up com automação (email, WhatsApp, etc.)
7. Métricas principais para mensurar resultados
8. Sugestões de testes A/B para otimização contínua`
      },
      {
        title: 'Otimização de Landing Pages para Conversão',
        prompt: `Otimize a seguinte landing page com foco em geração de leads:

URL da landing page: [url]
Público-alvo: [ICP]
Objetivo da página: [captura, agendamento, download, etc.]

Por favor, forneça:
1. Análise do título principal e sugestão otimizada
2. Sugestões de copy para aumentar a taxa de conversão
3. Propostas de valor mais atrativas
4. Recomendações visuais (imagens, vídeos, provas sociais)
5. Ajustes no formulário (campos, layout, CTA)
6. Elementos de confiança e urgência
7. Otimizações para mobile
8. Sugestões de testes A/B`
      }
    ]
  }
];

type SectionType = 'templates' | 'data' | 'folders';

interface PromptTemplateProps {
  template: typeof marketingTemplates[0];
  onSelectPrompt: (prompt: string) => void;
}

const PromptTemplate: React.FC<PromptTemplateProps> = ({
  template,
  onSelectPrompt
}) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow border-blue-100 hover:border-blue-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <template.icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{template.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
          <div className="mt-3 space-y-4">
            {template.prompts.map((prompt, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onSelectPrompt(prompt.prompt)}
                  >
                    <FiCopy className="h-4 w-4 mr-2" />
                    Copiar Prompt
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {prompt.prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

interface ChatItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface FolderItem {
  id: string;
  name: string;
  chats: ChatItem[];
  isOpen?: boolean;
}

interface CompanyProfile {
  name: string;
  industry: string;
  marketContext: string;
  description: string;
}

interface CustomerPersona {
  name: string;
  description: string;
  painPoints: string[];
  goals: string[];
}

interface ReferenceDocument {
  id: string;
  name: string;
  type: string;
  url: string;
}

const initialCompanyProfile: CompanyProfile = {
  name: "Empresa Exemplo",
  industry: "Tecnologia",
  marketContext: "B2B SaaS",
  description: "Empresa focada em soluções de marketing digital"
};

const initialPersona: CustomerPersona = {
  name: "Gerente de Marketing",
  description: "Profissional responsável pela estratégia digital",
  painPoints: [
    "Dificuldade em medir ROI",
    "Tempo limitado para análise de dados",
    "Necessidade de automação"
  ],
  goals: [
    "Aumentar conversão",
    "Otimizar campanhas",
    "Melhorar engagement"
  ]
};

export const AIChat: React.FC = () => {
  const {
    currentChatId,
    setCurrentChatId,
    folders: globalFolders,
    addFolder,
    deleteFolder,
    addChat,
    deleteChat,
    moveChat
  } = useGlobalChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>('templates');
  const [movingChat, setMovingChat] = useState<{chatId: string, fromFolderId: string} | null>(null);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(initialCompanyProfile);
  const [persona, setPersona] = useState<CustomerPersona>(initialPersona);
  const [documents, setDocuments] = useState<ReferenceDocument[]>([]);
  const [isEditingFolder, setIsEditingFolder] = useState<string | null>(null);
  const [isEditingChat, setIsEditingChat] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsLeftSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
        setShowMoveMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredTemplates = marketingTemplates.filter(
    template =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.prompts.some(prompt =>
        prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handlePromptSelect = async (prompt: string) => {
    try {
      // Copiar para a área de transferência
      await navigator.clipboard.writeText(prompt);
      
      // Feedback visual para o usuário
      toast.success('Prompt copiado para a área de transferência!', {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Erro ao copiar prompt:', error);
      toast.error('Erro ao copiar prompt. Tente novamente.', {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder(newFolderName);
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta pasta?')) {
      deleteFolder(folderId);
    }
  };

  const handleCreateChat = (folderId: string) => {
    const chatId = addChat(folderId, {
      title: 'Novo Chat',
      lastMessage: '',
      timestamp: new Date()
    });
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (folderId: string, chatId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este chat?')) {
      deleteChat(chatId, folderId);
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    }
  };

  const handleMoveChat = (chatId: string, fromFolderId: string, toFolderId: string) => {
    moveChat(chatId, fromFolderId, toFolderId);
    setMovingChat(null);
    setShowMoveMenu(false);
  };

  const handleRenameChat = (folderId: string, chatId: string, newTitle: string) => {
    const folder = globalFolders.find(f => f.id === folderId);
    if (!folder) return;

    const chat = folder.chats.find(c => c.id === chatId);
    if (!chat) return;

    // Atualiza o título do chat
    chat.title = newTitle;
    // TODO: Implementar atualização no Firestore
  };

  const FolderItem: React.FC<{ folder: FolderItem }> = ({ folder }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg group">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                const updatedFolder = { ...folder, isOpen: !folder.isOpen };
                // TODO: Implementar atualização no Firestore
              }}
            >
              {folder.isOpen ? (
                <FiChevronDown className="h-4 w-4" />
              ) : (
                <FiChevronRight className="h-4 w-4" />
              )}
            </Button>

            {isEditingFolder === folder.id ? (
              <Input
                value={folder.name}
                onChange={(e) => {
                  const updatedFolder = { ...folder, name: e.target.value };
                  // TODO: Implementar atualização no Firestore
                }}
                onBlur={() => setIsEditingFolder(null)}
                className="h-7 text-sm"
                autoFocus
              />
            ) : (
              <div
                className="flex-1 text-sm text-gray-700"
                onDoubleClick={() => setIsEditingFolder(folder.id)}
              >
                {folder.name}
              </div>
            )}
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-blue-600 hover:text-blue-700"
              onClick={() => handleCreateChat(folder.id)}
            >
              <FiPlus className="h-4 w-4" />
            </Button>
            {folder.id !== 'default' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600"
                onClick={() => handleDeleteFolder(folder.id)}
              >
                <FiTrash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {folder.isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-8 space-y-1"
            >
              {folder.chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg group relative",
                    currentChatId === chat.id && "bg-blue-50"
                  )}
                  onClick={() => setCurrentChatId(chat.id)}
                >
                  <FiMessageSquare className="h-4 w-4 text-gray-400" />
                  
                  {isEditingChat === chat.id ? (
                    <Input
                      value={chat.title}
                      onChange={(e) => handleRenameChat(folder.id, chat.id, e.target.value)}
                      onBlur={() => setIsEditingChat(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameChat(folder.id, chat.id, (e.target as HTMLInputElement).value);
                          setIsEditingChat(null);
                        }
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div
                      className="flex-1 text-sm text-gray-700 cursor-pointer"
                      onDoubleClick={() => setIsEditingChat(chat.id)}
                    >
                      <div>{chat.title}</div>
                      <div className="text-xs text-gray-500">{chat.lastMessage}</div>
                    </div>
                  )}

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMovingChat({ chatId: chat.id, fromFolderId: folder.id });
                        setShowMoveMenu(true);
                      }}
                    >
                      <FiMove className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(folder.id, chat.id);
                      }}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {showMoveMenu && movingChat?.chatId === chat.id && (
                    <div
                      ref={moveMenuRef}
                      className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      {globalFolders
                        .filter(f => f.id !== folder.id)
                        .map(targetFolder => (
                          <button
                            key={targetFolder.id}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={() => handleMoveChat(chat.id, folder.id, targetFolder.id)}
                          >
                            Mover para {targetFolder.name}
                          </button>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderDataSection = () => {
    return (
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6 pr-4">
          {/* Perfil da Empresa */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FiBriefcase className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Perfil da Empresa</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Nome</label>
                <Input 
                  value={companyProfile.name}
                  onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Indústria</label>
                <Input 
                  value={companyProfile.industry}
                  onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Contexto de Mercado</label>
                <Input 
                  value={companyProfile.marketContext}
                  onChange={(e) => setCompanyProfile({...companyProfile, marketContext: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Persona */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FiUsers className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Persona</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Nome</label>
                <Input 
                  value={persona.name}
                  onChange={(e) => setPersona({...persona, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Descrição</label>
                <Input 
                  value={persona.description}
                  onChange={(e) => setPersona({...persona, description: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Documentos */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <FiFile className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Documentos</h3>
            </div>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FiFile className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{doc.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={() => {
                      setDocuments(docs => docs.filter(d => d.id !== doc.id));
                    }}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {/* TODO: Implementar upload de documento */}}
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Adicionar Documento
              </Button>
            </div>
          </Card>
        </div>
      </ScrollArea>
    );
  };

  const renderFoldersSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Chats</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => handleCreateChat('default')}
            >
              <FiMessageSquare className="h-4 w-4 mr-1" />
              Novo Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => setShowNewFolderInput(true)}
            >
              <FiPlus className="h-4 w-4 mr-1" />
              Nova Pasta
            </Button>
          </div>
        </div>

        {showNewFolderInput && (
          <div className="flex items-center gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome da pasta"
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateFolder}
              className="text-green-600 hover:text-green-700"
            >
              <FiCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
              className="text-red-500 hover:text-red-600"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {globalFolders.map((folder) => (
            <FolderItem key={folder.id} folder={folder} />
          ))}
        </div>
      </div>
    );
  };

  const renderSidebarContent = () => {
    switch (activeSection) {
      case 'templates':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Templates</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => {/* TODO: Implementar criação de template */}}
              >
                <FiPlus className="h-4 w-4 mr-1" />
                Novo Template
              </Button>
            </div>
            {/* TODO: Implementar lista de templates */}
          </div>
        );
      case 'data':
        return renderDataSection();
      case 'folders':
        return renderFoldersSection();
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <>
        <Toaster position="bottom-right" />
        <div className="flex h-full relative">
          {/* Toggle Button for Left Sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute z-30 bg-white shadow-md border-y",
              isMobile 
                ? "top-16 left-2 rounded-lg border" 
                : "left-0 top-16 rounded-r-lg border-r"
            )}
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          >
            {isLeftSidebarOpen ? <FiChevronLeft className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
          </Button>

          {/* Unified Left Sidebar */}
          <AnimatePresence>
            {isLeftSidebarOpen && (
              <motion.div
                initial={{ 
                  [isMobile ? 'x' : 'width']: isMobile ? -420 : 0,
                  opacity: 0 
                }}
                animate={{ 
                  [isMobile ? 'x' : 'width']: isMobile ? 0 : 420,
                  opacity: 1 
                }}
                exit={{ 
                  [isMobile ? 'x' : 'width']: isMobile ? -420 : 0,
                  opacity: 0 
                }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative",
                  isMobile && "fixed inset-y-0 left-0 z-40"
                )}
              >
                <Card className={cn(
                  "h-full overflow-hidden",
                  isMobile ? "w-[380px]" : "w-[420px]"
                )}>
                  <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        {isMobile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsLeftSidebarOpen(false)}
                          >
                            <FiX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant={activeSection === 'templates' ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "flex-1 justify-start",
                            isMobile && "py-3 px-4 text-base rounded-xl hover:shadow-md transition-all duration-200"
                          )}
                          onClick={() => setActiveSection('templates')}
                        >
                          <FiTool className={cn("h-4 w-4 mr-2", isMobile && "h-5 w-5")} />
                          Templates
                        </Button>
                        <Button
                          variant={activeSection === 'data' ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "flex-1 justify-start",
                            isMobile && "py-3 px-4 text-base rounded-xl hover:shadow-md transition-all duration-200"
                          )}
                          onClick={() => setActiveSection('data')}
                        >
                          <FiBriefcase className={cn("h-4 w-4 mr-2", isMobile && "h-5 w-5")} />
                          Dados
                        </Button>
                        <Button
                          variant={activeSection === 'folders' ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "flex-1 justify-start",
                            isMobile && "py-3 px-4 text-base rounded-xl hover:shadow-md transition-all duration-200"
                          )}
                          onClick={() => setActiveSection('folders')}
                        >
                          <FiFolder className={cn("h-4 w-4 mr-2", isMobile && "h-5 w-5")} />
                          Pastas
                        </Button>
                      </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-hidden p-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeSection}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          {renderSidebarContent()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </Card>
                {isMobile && (
                  <div 
                    className="fixed inset-0 bg-black/20 -z-10"
                    onClick={() => setIsLeftSidebarOpen(false)}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className={cn(
            "flex-1",
            isMobile ? "mx-0" : "mx-4"
          )}>
            <ChatInterface />
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}; 