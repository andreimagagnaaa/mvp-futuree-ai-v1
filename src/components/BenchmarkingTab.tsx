import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Search,
  Filter,
  Download,
  Share2,
  Info,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Settings,
  FolderPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { CompetitorData, Metric, SectorMetrics, CompetitorMetrics, CompetitorFormData } from '../types/benchmarking';
import { formatMetricValue, calculateSectorMetrics, validateMetricKey, generateDefaultMetrics } from '../utils/benchmarking';
import { MetricsModal } from './MetricsModal';
import { CompetitorForm } from './CompetitorForm';

export const BenchmarkingTab: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedSector, setSelectedSector] = useState("Tecnologia");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<keyof CompetitorMetrics>("marketShare");
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [sectorMetrics, setSectorMetrics] = useState<SectorMetrics>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<Metric>>({
    name: '',
    key: '',
    type: 'number',
    isActive: true
  });
  const [newCompetitor, setNewCompetitor] = useState<CompetitorFormData>({
    name: "",
    sector: "Tecnologia",
    metrics: {
      marketShare: 0,
      growth: 0
    }
  });
  const [newSector, setNewSector] = useState('');
  const [showSectorInput, setShowSectorInput] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    fetchInitialData();
  }, [currentUser]);

  useEffect(() => {
    // Atualizar métricas do setor quando mudar o setor selecionado ou os competidores
    const newSectorMetrics = calculateSectorMetrics(competitors, metrics, selectedSector);
    setSectorMetrics(newSectorMetrics);
  }, [selectedSector, competitors, metrics]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchCompetitors(),
        fetchSectors(),
        fetchMetrics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompetitors = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const competitorsRef = collection(db, 'users', currentUser.uid, 'competitors');
      const competitorsDoc = await getDoc(doc(competitorsRef, 'data'));

      if (competitorsDoc.exists()) {
        const data = competitorsDoc.data();
        setCompetitors(data.competitors || []);
      } else {
        // Inicializa com array vazio se não existir
        await setDoc(doc(competitorsRef, 'data'), { competitors: [] });
        setCompetitors([]);
      }
    } catch (error) {
      console.error('Erro ao buscar competidores:', error);
      toast.error('Erro ao carregar competidores');
    }
  };

  const fetchSectors = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const sectorsRef = collection(db, 'users', currentUser.uid, 'sectors');
      const sectorsDoc = await getDoc(doc(sectorsRef, 'data'));

      if (sectorsDoc.exists()) {
        const data = sectorsDoc.data();
        setSectors(data.sectors || []);
        if (data.sectors?.length > 0) {
          setSelectedSector(data.sectors[0]);
        }
      } else {
        // Inicializa com array vazio ao invés de setores padrão
        await setDoc(doc(sectorsRef, 'data'), { sectors: [] });
        setSectors([]);
      }
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      toast.error('Erro ao carregar setores');
    }
  };

  const fetchMetrics = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const metricsRef = collection(db, 'users', currentUser.uid, 'metrics');
      const metricsDoc = await getDoc(doc(metricsRef, 'data'));

      if (metricsDoc.exists()) {
        const data = metricsDoc.data();
        setMetrics(data.metrics || []);
      } else {
        const defaultMetrics = generateDefaultMetrics(currentUser.uid);
        await setDoc(doc(metricsRef, 'data'), { metrics: defaultMetrics });
        setMetrics(defaultMetrics);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast.error('Erro ao carregar métricas');
    }
  };

  const handleAddCompetitor = async (competitor: Partial<CompetitorData>) => {
    try {
      if (!currentUser?.uid || !competitor.name || !competitor.sector) {
        toast.error('Dados incompletos');
        return;
      }

      // Validar e preparar as métricas
      const validMetrics: CompetitorMetrics = {};
      metrics.forEach(metric => {
        const value = competitor.metrics?.[metric.key] || 0;
        if (metric.isRequired && value === 0) {
          throw new Error(`A métrica ${metric.name} é obrigatória`);
        }
        validMetrics[metric.key] = value;
      });

      const newCompetitor: CompetitorData = {
        id: crypto.randomUUID(),
        name: competitor.name,
        sector: competitor.sector,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: validMetrics
      };

      const competitorsRef = collection(db, 'users', currentUser.uid, 'competitors');
      const competitorsDoc = await getDoc(doc(competitorsRef, 'data'));
      const currentCompetitors = competitorsDoc.exists() ? competitorsDoc.data().competitors : [];

      const updatedCompetitors = [...currentCompetitors, newCompetitor];

      // Usar transaction para garantir atomicidade e atualizar lastUpdated
      await setDoc(doc(competitorsRef, 'data'), {
        competitors: updatedCompetitors,
        lastUpdated: new Date().toISOString()
      });

      // Atualizar o estado local
      setCompetitors(prevCompetitors => [...prevCompetitors, newCompetitor]);
      setShowAddForm(false);
      
      // Recalcular métricas do setor
      const newSectorMetrics = calculateSectorMetrics(updatedCompetitors, metrics, selectedSector);
      setSectorMetrics(newSectorMetrics);
      
      toast.success('Competidor adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar competidor:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar competidor');
      }
    }
  };

  const handleUpdateCompetitor = async (competitor: CompetitorData) => {
    try {
      if (!currentUser?.uid) {
        toast.error('Usuário não autenticado');
        return;
      }

      const competitorsRef = collection(db, 'users', currentUser.uid, 'competitors');
      const competitorsDoc = await getDoc(doc(competitorsRef, 'data'));
      const currentCompetitors = competitorsDoc.exists() ? competitorsDoc.data().competitors : [];

      const updatedCompetitors = currentCompetitors.map((comp: CompetitorData) =>
        comp.id === competitor.id ? { ...competitor, updatedAt: new Date().toISOString() } : comp
      );

      await setDoc(doc(competitorsRef, 'data'), {
        competitors: updatedCompetitors,
        lastUpdated: new Date().toISOString()
      });

      // Atualizar o estado local
      setCompetitors(updatedCompetitors);
      setIsEditing(false);
      setEditingCompetitor(null);

      // Recalcular métricas do setor
      const newSectorMetrics = calculateSectorMetrics(updatedCompetitors, metrics, selectedSector);
      setSectorMetrics(newSectorMetrics);

      toast.success('Competidor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar competidor:', error);
      toast.error('Erro ao atualizar competidor');
    }
  };

  const handleDeleteCompetitor = async (id: string) => {
    try {
      if (!currentUser?.uid) {
        toast.error('Usuário não autenticado');
        return;
      }

      const competitorsRef = collection(db, 'users', currentUser.uid, 'competitors');
      const competitorsDoc = await getDoc(doc(competitorsRef, 'data'));
      const currentCompetitors = competitorsDoc.exists() ? competitorsDoc.data().competitors : [];

      const updatedCompetitors = currentCompetitors.filter((comp: CompetitorData) => comp.id !== id);

      await setDoc(doc(competitorsRef, 'data'), {
        competitors: updatedCompetitors,
        lastUpdated: new Date().toISOString()
      });

      // Atualizar o estado local
      setCompetitors(updatedCompetitors);

      // Recalcular métricas do setor
      const newSectorMetrics = calculateSectorMetrics(updatedCompetitors, metrics, selectedSector);
      setSectorMetrics(newSectorMetrics);

      toast.success('Competidor removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover competidor:', error);
      toast.error('Erro ao remover competidor');
    }
  };

  const handleAddSector = async () => {
    try {
      if (!currentUser?.uid || !newSector.trim()) {
        toast.error('Nome do setor inválido');
        return;
      }

      const sectorsRef = collection(db, 'users', currentUser.uid, 'sectors');
      const sectorsDoc = await getDoc(doc(sectorsRef, 'data'));
      const currentSectors = sectorsDoc.exists() ? sectorsDoc.data().sectors : [];

      if (currentSectors.includes(newSector.trim())) {
        toast.error('Este setor já existe');
        return;
      }

      const updatedSectors = [...currentSectors, newSector.trim()];

      await setDoc(doc(sectorsRef, 'data'), {
        sectors: updatedSectors
      });

      setSectors(updatedSectors);
      setNewSector('');
      setShowSectorInput(false);
      toast.success('Setor adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar setor:', error);
      toast.error('Erro ao adicionar setor');
    }
  };

  const handleDeleteSector = async (sector: string) => {
    try {
      if (!currentUser?.uid) {
        toast.error('Usuário não autenticado');
        return;
      }

      const hasCompetitors = competitors.some(comp => comp.sector === sector);
      if (hasCompetitors) {
        toast.error('Não é possível excluir um setor que possui competidores');
        return;
      }

      const sectorsRef = collection(db, 'users', currentUser.uid, 'sectors');
      const sectorsDoc = await getDoc(doc(sectorsRef, 'data'));
      const currentSectors = sectorsDoc.exists() ? sectorsDoc.data().sectors : [];

      const updatedSectors = currentSectors.filter((s: string) => s !== sector);

      await setDoc(doc(sectorsRef, 'data'), {
        sectors: updatedSectors
      });

      setSectors(updatedSectors);
      if (selectedSector === sector) {
        setSelectedSector(updatedSectors[0] || '');
      }
      toast.success('Setor removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover setor:', error);
      toast.error('Erro ao remover setor');
    }
  };

  const handleUpdateMetrics = async (updatedMetrics: Metric[]) => {
    try {
      if (!currentUser?.uid) {
        toast.error('Usuário não autenticado');
        return;
      }

      const metricsRef = collection(db, 'users', currentUser.uid, 'metrics');
      await setDoc(doc(metricsRef, 'data'), { metrics: updatedMetrics });
      setMetrics(updatedMetrics);
      toast.success('Métricas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
      toast.error('Erro ao atualizar métricas');
    }
  };

  const filteredCompetitors = competitors.filter(comp =>
    comp.sector === selectedSector &&
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Benchmarking por Setor</h2>
          <p className="text-gray-600 mt-1">
            Compare seu desempenho com os principais players do mercado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetricsModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Métricas
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Competidor
          </button>
        </div>
      </div>

      {/* Modais */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
              <MetricsModal
                metrics={metrics}
                onSave={handleUpdateMetrics}
                onClose={() => setShowMetricsModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {(showAddForm || isEditing) && (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/30"></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full p-6">
              <CompetitorForm
                competitor={isEditing ? editingCompetitor : undefined}
                sectors={sectors}
                metrics={metrics}
                onSubmit={isEditing ? handleUpdateCompetitor : handleAddCompetitor}
                onCancel={() => {
                  setShowAddForm(false);
                  setIsEditing(false);
                  setEditingCompetitor(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <div className="flex gap-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            <button
              onClick={() => setShowSectorInput(true)}
              className="px-3 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg"
            >
              <FolderPlus className="w-5 h-5" />
            </button>
          </div>
          <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Visão Geral das Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.filter(m => m.isActive).map(metric => (
          <div key={metric.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">{metric.name} Médio</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatMetricValue(sectorMetrics[metric.key] || 0, { type: metric.type })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de Competidores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                {metrics.filter(m => m.isActive).map(metric => (
                  <th
                    key={metric.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {metric.name}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompetitors.map((competitor, index) => (
                <tr
                  key={competitor.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {competitor.name}
                    </div>
                  </td>
                  {metrics.filter(m => m.isActive).map(metric => (
                    <td key={metric.id} className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatMetricValue(competitor.metrics[metric.key] || 0, { type: metric.type })}
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingCompetitor(competitor);
                        setIsEditing(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompetitor(competitor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar Setor */}
      {showSectorInput && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Adicionar Setor</h3>
                <button
                  onClick={() => {
                    setShowSectorInput(false);
                    setNewSector('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Setor
                </label>
                <input
                  type="text"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o nome do setor"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowSectorInput(false);
                    setNewSector('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSector}
                  disabled={!newSector.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                    newSector.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-400 cursor-not-allowed'
                  }`}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 