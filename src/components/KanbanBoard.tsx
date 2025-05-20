import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { format, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import confetti from 'canvas-confetti';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { supabase } from '../config/supabase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  FirestoreError
} from 'firebase/firestore';
import {
  PlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  PaperClipIcon,
  TrashIcon,
  TrophyIcon,
  ChartBarIcon,
  FunnelIcon,
  Bars4Icon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { PostgrestError } from '@supabase/supabase-js';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  due_date: string;
  checklist: { id: string; item: string; completed: boolean }[];
  status: 'A Fazer' | 'Em Progresso' | 'Concluído';
  files: { id: string; name: string; url: string }[];
  points: number;
  history: { action: string; date: string }[];
  firebase_user_id?: string;
}

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
}

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: {
    x?: number;
    y?: number;
  };
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !editedTask) return;
    
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${editedTask.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      setEditedTask({
        ...editedTask,
        files: [...editedTask.files, { id: Date.now().toString(), name: file.name, url: publicUrl }]
      });

      toast.success('Arquivo anexado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao anexar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!editedTask) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        
        <div className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
          <div className="space-y-4">
            {/* Título */}
            <input
              type="text"
              value={editedTask?.title || ''}
              onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full text-xl font-semibold border-0 focus:ring-2 focus:ring-blue-500 rounded-lg"
              placeholder="Título da tarefa"
            />

            {/* Status da Tarefa */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Status:</span>
              <select
                value={editedTask?.status || 'A Fazer'}
                onChange={(e) => setEditedTask(prev => prev ? { 
                  ...prev, 
                  status: e.target.value as Task['status'],
                  history: [
                    ...prev.history,
                    {
                      action: `Status alterado para ${e.target.value}`,
                      date: new Date().toISOString()
                    }
                  ]
                } : null)}
                className="rounded-lg border-gray-300 focus:ring-blue-500"
              >
                <option value="A Fazer">A Fazer</option>
                <option value="Em Progresso">Em Progresso</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>

            {/* Descrição */}
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da tarefa..."
            />

            {/* Prioridade */}
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Prioridade:</span>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ 
                  ...editedTask, 
                  priority: e.target.value as Task['priority']
                })}
                className="rounded-lg border-gray-300 focus:ring-blue-500"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            {/* Data de Vencimento */}
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={editedTask.due_date}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                className="rounded-lg border-gray-300 focus:ring-blue-500"
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Checklist</h3>
                <button
                  onClick={() => setEditedTask({
                    ...editedTask,
                    checklist: [...editedTask.checklist, { 
                      id: Date.now().toString(),
                      item: '',
                      completed: false
                    }]
                  })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              {editedTask.checklist.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => {
                      const newChecklist = [...editedTask.checklist];
                      newChecklist[index].completed = e.target.checked;
                      setEditedTask({ ...editedTask, checklist: newChecklist });
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => {
                      const newChecklist = [...editedTask.checklist];
                      newChecklist[index].item = e.target.value;
                      setEditedTask({ ...editedTask, checklist: newChecklist });
                    }}
                    className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newChecklist = editedTask.checklist.filter((_, i) => i !== index);
                      setEditedTask({ ...editedTask, checklist: newChecklist });
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Arquivos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Arquivos Anexados</h3>
                <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                  <PaperClipIcon className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="space-y-2">
                {editedTask.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Visualizar
                      </a>
                      <button
                        onClick={() => {
                          setEditedTask({
                            ...editedTask,
                            files: editedTask.files.filter((f) => f.id !== file.id)
                          });
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico */}
            <div className="space-y-2">
              <h3 className="font-medium">Histórico</h3>
              <div className="space-y-1">
                {editedTask.history.map((entry, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {entry.action} - {format(new Date(entry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => onSave(editedTask)}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

const KanbanBoard = () => {
  const auth = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');

  // Contadores de tarefas por status
  const taskCounts = {
    total: tasks.length,
    aFazer: tasks.filter(t => t.status === 'A Fazer').length,
    emProgresso: tasks.filter(t => t.status === 'Em Progresso').length,
    concluido: tasks.filter(t => t.status === 'Concluído').length
  };

  useEffect(() => {
    if (!auth?.currentUser?.uid) {
      toast.error('Você precisa estar autenticado para acessar o quadro Kanban.');
      return;
    }
    fetchTasks();
  }, [auth?.currentUser]);

  const handleFirebaseError = (error: PostgrestError | Error | unknown): string => {
    if (!error) return 'Ocorreu um erro desconhecido';
    
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && 'code' in error && 'message' in error) {
      const { code, message } = error as { code: string; message: string };
      switch (code) {
        case 'PGRST301':
          return 'Erro de autenticação';
        case 'PGRST302':
          return 'Permissão negada';
        default:
          return message || 'Erro desconhecido';
      }
    }

    return 'Ocorreu um erro desconhecido';
  };

  const fetchTasks = async () => {
    if (!auth?.currentUser?.uid) return;

    try {
      setIsLoading(true);
      const tasksRef = collection(db, 'projects');
      const tasksQuery = query(
        tasksRef,
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(tasksQuery);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        ...(doc.data() as Task),
        id: doc.id
      }));

      setTasks(fetchedTasks);
    } catch (error) {
      toast.error(handleFirebaseError(error as PostgrestError | Error | unknown));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSave = async (updatedTask: Task) => {
    if (!auth?.currentUser?.uid) {
      toast.error('Você precisa estar autenticado para salvar tarefas.');
      return;
    }

    try {
      const taskData = {
        ...updatedTask,
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
        // Garantir que todos os campos necessários estejam presentes
        title: updatedTask.title || 'Nova Tarefa',
        description: updatedTask.description || '',
        priority: updatedTask.priority || 'Média',
        status: updatedTask.status || 'A Fazer',
        checklist: updatedTask.checklist || [],
        files: updatedTask.files || [],
        points: updatedTask.points || 0,
        history: updatedTask.history || []
      };

      // Se é uma nova tarefa
      if (!tasks.find(t => t.id === updatedTask.id)) {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...taskData,
          createdAt: serverTimestamp()
        });

        const newTask = {
          ...taskData,
          id: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setTasks([newTask, ...tasks]);
        toast.success('Tarefa criada com sucesso!');
      } else {
        // Se é uma atualização
        const taskRef = doc(db, 'projects', updatedTask.id);
        await updateDoc(taskRef, {
          ...taskData,
          updatedAt: serverTimestamp()
        });

        setTasks(tasks.map(task => 
          task.id === updatedTask.id ? {...taskData, id: task.id} : task
        ));
        toast.success('Tarefa atualizada com sucesso!');
      }

      setIsModalOpen(false);

      if (updatedTask.status === 'Concluído') {
        const confettiOptions: ConfettiOptions = {
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        };
        confetti(confettiOptions);
      }
    } catch (error) {
      toast.error(handleFirebaseError(error as PostgrestError | Error | unknown));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'projects', taskId);
      await deleteDoc(taskRef);
      
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      toast.error(handleFirebaseError(error as PostgrestError | Error | unknown));
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    try {
      // Se a origem e destino são iguais, não faz nada
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      // Encontra a tarefa que está sendo movida
      const taskToMove = tasks.find(task => task.id === draggableId);
      if (!taskToMove) return;

      // Cria uma cópia das tarefas e remove a tarefa da posição original
      const newTasks = Array.from(tasks);
      const taskIndex = newTasks.findIndex(t => t.id === draggableId);
      newTasks.splice(taskIndex, 1);

      // Encontra o índice onde a tarefa deve ser inserida
      const insertIndex = newTasks.reduce((acc, task, index) => {
        if (task.status === destination.droppableId && index <= destination.index) {
          return index + 1;
        }
        return acc;
      }, 0);

      // Cria a tarefa atualizada
      const updatedTask = {
        ...taskToMove,
        status: destination.droppableId as Task['status'],
        history: [
          ...taskToMove.history,
          {
            action: `Movido para ${destination.droppableId}`,
            date: new Date().toISOString()
          }
        ]
      };

      // Insere a tarefa na nova posição
      newTasks.splice(insertIndex, 0, updatedTask);

      // Atualiza o estado
      setTasks(newTasks);

      // Atualiza no banco de dados
      await updateDoc(doc(db, 'projects', taskToMove.id), {
        status: destination.droppableId,
        updatedAt: serverTimestamp(),
        history: updatedTask.history
      });

      // Dispara confetti se moveu para Concluído
      if (destination.droppableId === 'Concluído') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast.error('Erro ao mover tarefa. Tentando reverter...');
      
      // Recarrega as tarefas em caso de erro
      fetchTasks();
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Baixa': return 'bg-[#10B981]';
      case 'Média': return 'bg-[#FBBF24]';
      case 'Alta': return 'bg-[#EF4444]';
      default: return 'bg-gray-400';
    }
  };

  const handleCreateTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      title: 'Nova Tarefa',
      description: '',
      priority: 'Média',
      due_date: format(new Date(), 'yyyy-MM-dd'),
      checklist: [],
      status: 'A Fazer',
      files: [],
      points: 0,
      history: [{
        action: 'Tarefa criada',
        date: new Date().toISOString()
      }]
    };
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'priority':
          const priorityWeight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6 font-sans">
      {/* Header com Estatísticas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Projetos</h2>
            <p className="text-gray-600">Gerencie suas tarefas e acompanhe o progresso</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">A Fazer</div>
              <div className="text-xl font-semibold text-gray-600">{taskCounts.aFazer}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Em Progresso</div>
              <div className="text-xl font-semibold text-yellow-600">{taskCounts.emProgresso}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Concluídas</div>
              <div className="text-xl font-semibold text-green-600">{taskCounts.concluido}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Total de Tarefas</div>
              <div className="text-xl font-semibold text-blue-600">{taskCounts.total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          {/* Barra de Busca */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Filtros e Botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Grupo de Filtros */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Task['priority'] | 'all')}
                className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 min-w-[140px] flex-1 sm:flex-none"
              >
                <option value="all">Todas Prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'title')}
                className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 min-w-[100px] flex-1 sm:flex-none"
              >
                <option value="date">Data</option>
                <option value="priority">Prioridade</option>
                <option value="title">Título</option>
              </select>
            </div>

            {/* Botões de Visualização e Nova Tarefa */}
            <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('board')}
                  className={`p-2 rounded ${viewMode === 'board' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <Bars4Icon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <TableCellsIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nova Tarefa
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A73E8]" />
        </div>
      ) : viewMode === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['A Fazer', 'Em Progresso', 'Concluído'].map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-h-[500px] transition-all ${
                      snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {status}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {filteredTasks.filter(t => t.status === status).length}
                        </span>
                      </h3>
                      {status === 'A Fazer' && (
                        <button
                          onClick={handleCreateTask}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <PlusIcon className="w-5 h-5 text-gray-600" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 min-h-[400px]">
                      {filteredTasks
                        .filter((task) => task.status === status)
                        .map((task, index) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`group bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-move ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-[#1A73E8]/50 rotate-2' : ''
                                }`}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsModalOpen(true);
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                      {task.title}
                                    </h4>
                                    {task.points > 0 && (
                                      <TrophyIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getPriorityColor(task.priority)} ml-2 flex-shrink-0`}>
                                    {task.priority}
                                  </span>
                                </div>
                                
                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {task.due_date && (
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                    {format(new Date(task.due_date), 'dd/MM/yyyy')}
                                    {isBefore(new Date(task.due_date), addDays(new Date(), 2)) && (
                                      <ExclamationCircleIcon className="w-4 h-4 ml-1 text-yellow-500 flex-shrink-0" />
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <CheckCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                    {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {task.files.length > 0 && (
                                      <div className="flex items-center text-gray-600">
                                        <PaperClipIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                        {task.files.length}
                                      </div>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                    >
                                      <TrashIcon className="w-4 h-4 flex-shrink-0" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr 
                    key={task.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                        task.status === 'Em Progresso' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(task.due_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ 
                              width: `${task.checklist.length ? 
                                (task.checklist.filter(item => item.completed).length / task.checklist.length) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
};

export default KanbanBoard;