import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { api } from '../lib/api';
import { checkUserPremiumStatus } from './userService';

export interface FunnelStage {
  id: string;
  name: string;
  type: 'lead' | 'opportunity' | 'sale';
  metrics: {
    count: number;
    conversionRate: number;
    revenue?: number;
    averageTicket?: number;
  };
}

export interface Funnel {
  id?: string;
  name: string;
  stages: FunnelStage[];
  created_at?: Date;
  updated_at?: Date;
  user_id?: string;
}

export interface FunnelData {
  id: string;
  name: string;
  stages: FunnelStage[];
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

class FunnelService {
  private readonly COLLECTION_NAME = 'funnels';

  // Método para verificar autenticação
  private async checkAuth() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
    }
    return currentUser;
  }

  // Validar dados do funil
  private validateFunnel(funnel: Partial<Funnel>): boolean {
    if (!funnel.name || funnel.name.trim() === '') {
      throw new Error('Nome do funil é obrigatório');
    }

    if (!Array.isArray(funnel.stages) || funnel.stages.length === 0) {
      throw new Error('Funil deve ter pelo menos uma etapa');
    }

    funnel.stages.forEach((stage, index) => {
      if (!stage.name || stage.name.trim() === '') {
        throw new Error(`Nome da etapa ${index + 1} é obrigatório`);
      }
      if (!stage.type || !['lead', 'opportunity', 'sale'].includes(stage.type)) {
        throw new Error(`Tipo da etapa ${index + 1} é inválido`);
      }
    });

    return true;
  }

  // Formatar dados para o Firestore
  private formatFunnelForFirestore(funnel: Partial<Funnel>, userId: string) {
    return {
      name: funnel.name,
      stages: funnel.stages?.map(stage => ({
        ...stage,
        metrics: {
          count: Number(stage.metrics.count) || 0,
          conversionRate: Number(stage.metrics.conversionRate) || 0,
          revenue: Number(stage.metrics.revenue) || 0,
          averageTicket: Number(stage.metrics.averageTicket) || 0
        }
      })),
      user_id: userId,
      userId: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
  }

  // Formatar dados do Firestore
  private formatFunnelFromFirestore(doc: any): Funnel {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      stages: data.stages || [],
      user_id: data.userId || data.user_id,
      created_at: data.created_at?.toDate(),
      updated_at: data.updated_at?.toDate()
    };
  }

  // Buscar todos os funis do usuário
  async getFunnels(userId: string): Promise<Funnel[]> {
    try {
      const currentUser = await this.checkAuth();
      
      console.log('Buscando funis para usuário:', {
        requestedUserId: userId,
        currentUserId: currentUser.uid
      });

      const funnelsRef = collection(db, this.COLLECTION_NAME);
      
      // Simplificando a query para evitar necessidade de índice composto
      const q = query(
        funnelsRef,
        where('userId', '==', currentUser.uid)
        // Removendo temporariamente o orderBy para evitar necessidade de índice
      );

      const querySnapshot = await getDocs(q);
      console.log('Funis encontrados:', querySnapshot.size);

      const funis = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processando funil:', {
          id: doc.id,
          name: data.name,
          userId: data.userId
        });
        return this.formatFunnelFromFirestore(doc);
      });

      // Ordenando no cliente
      return funis.sort((a, b) => {
        const dateA = a.created_at?.getTime() || 0;
        const dateB = b.created_at?.getTime() || 0;
        return dateB - dateA; // ordem decrescente
      });

    } catch (error) {
      console.error('Erro ao buscar funis:', error);
      if (error instanceof Error && error.message.includes('index')) {
        try {
          const simpleQuery = query(
            collection(db, this.COLLECTION_NAME),
            where('userId', '==', userId)
          );
          const snapshot = await getDocs(simpleQuery);
          return snapshot.docs.map(doc => this.formatFunnelFromFirestore(doc));
        } catch (fallbackError) {
          console.error('Erro na query alternativa:', fallbackError);
        }
      }
      return []; // Retorna array vazio em caso de erro
    }
  }

  // Buscar funis da API
  async getFunnelsFromAPI(): Promise<FunnelData[]> {
    try {
      const response = await api.get('/funnels');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar funis da API:', error);
      throw error;
    }
  }

  // Criar novo funil
  async createFunnel(funnel: Omit<Funnel, 'id'>, userId: string): Promise<Funnel> {
    try {
      const currentUser = await this.checkAuth();
      this.validateFunnel(funnel);

      const funnelData = {
        name: funnel.name,
        stages: funnel.stages.map(stage => ({
          ...stage,
          metrics: {
            count: 0,
            conversionRate: 0,
            revenue: 0,
            averageTicket: 0
          }
        })),
        userId: currentUser.uid,        // Campo principal para queries
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      console.log('Criando funil:', funnelData);

      const funnelsRef = collection(db, this.COLLECTION_NAME);
      const docRef = await addDoc(funnelsRef, funnelData);
      
      const newDoc = await getDoc(docRef);
      if (!newDoc.exists()) {
        throw new Error('Erro ao criar funil: documento não encontrado');
      }

      const createdFunnel = this.formatFunnelFromFirestore(newDoc);
      console.log('Funil criado com sucesso:', createdFunnel);
      
      return createdFunnel;

    } catch (error) {
      console.error('Erro ao criar funil:', error);
      throw error instanceof Error ? error : new Error('Erro ao criar funil. Tente novamente.');
    }
  }

  // Atualizar funil existente
  async updateFunnel(funnel: Funnel): Promise<void> {
    try {
      // Validar dados do funil
      this.validateFunnel(funnel);
      
      if (!funnel.id) {
        throw new Error('ID do funil é obrigatório para atualização');
      }

      // Verificar autenticação
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar documento atual
      const funnelRef = doc(db, this.COLLECTION_NAME, funnel.id);
      const docSnap = await getDoc(funnelRef);
      
      if (!docSnap.exists()) {
        throw new Error('Funil não encontrado');
      }

      // Verificar permissão - apenas o criador pode editar
      const currentData = docSnap.data();
      if (currentData.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para editar este funil');
      }

      // Preparar dados para atualização
      const updateData = {
        name: funnel.name,
        stages: funnel.stages,
        updated_at: serverTimestamp(),
        userId: currentUser.uid // Mantém o userId original
      };

      // Atualizar documento
      await updateDoc(funnelRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar funil:', error);
      throw error instanceof Error ? error : new Error('Erro ao atualizar funil. Tente novamente.');
    }
  }

  // Excluir funil
  async deleteFunnel(funnelId: string, userId: string): Promise<void> {
    try {
      // Verificar autenticação
      const currentUser = await this.checkAuth();

      const funnelRef = doc(db, this.COLLECTION_NAME, funnelId);
      const docSnap = await getDoc(funnelRef);
      
      if (!docSnap.exists()) {
        throw new Error('Funil não encontrado');
      }

      const funnelData = docSnap.data();
      
      // Verifica tanto userId quanto user_id para compatibilidade
      if (funnelData.userId !== currentUser.uid && funnelData.user_id !== currentUser.uid) {
        console.log('Erro de permissão:', {
          docUserId: funnelData.userId,
          docUser_id: funnelData.user_id,
          currentUserId: currentUser.uid
        });
        throw new Error('Você não tem permissão para excluir este funil');
      }
      
      await deleteDoc(funnelRef);
      console.log('Funil excluído com sucesso:', funnelId);
      
    } catch (error) {
      console.error('Erro ao excluir funil:', error);
      throw error instanceof Error ? error : new Error('Erro ao excluir funil. Tente novamente.');
    }
  }

  // Adicione o método getFunnel
  async getFunnel(funnelId: string): Promise<Funnel> {
    try {
      const currentUser = await this.checkAuth();
      
      const funnelRef = doc(db, this.COLLECTION_NAME, funnelId);
      const docSnap = await getDoc(funnelRef);
      
      if (!docSnap.exists()) {
        throw new Error('Funil não encontrado');
      }

      const funnelData = docSnap.data();
      if (funnelData.userId !== currentUser.uid) {
        throw new Error('Você não tem permissão para acessar este funil');
      }

      return this.formatFunnelFromFirestore(docSnap);
    } catch (error) {
      console.error('Erro ao buscar funil:', error);
      throw error;
    }
  }
}

export const funnelService = new FunnelService(); 