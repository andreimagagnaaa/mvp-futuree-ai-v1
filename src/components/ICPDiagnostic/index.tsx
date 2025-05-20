import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  HeartIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Persona {
  id?: string;
  name: string;
  role: string;
  companySize: string;
  budget: string;
  location: string;
  painPoints: string[];
  goals: string[];
  interests: string[];
  challenges: string[];
  decisionFactors: string[];
  createdAt: Date;
}

interface PersonaFormData {
  name: string;
  role: string;
  companySize: string;
  budget: string;
  location: string;
  painPoints: string[];
  goals: string[];
  interests: string[];
  challenges: string[];
  decisionFactors: string[];
}

const PersonaFormComponent: React.FC<{
  initialData?: Persona;
  onSave: (data: PersonaFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}> = memo(({ initialData, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState<PersonaFormData>(() => ({
    name: initialData?.name || '',
    role: initialData?.role || '',
    companySize: initialData?.companySize || '',
    budget: initialData?.budget || '',
    location: initialData?.location || '',
    painPoints: initialData?.painPoints || [],
    goals: initialData?.goals || [],
    interests: initialData?.interests || [],
    challenges: initialData?.challenges || [],
    decisionFactors: initialData?.decisionFactors || [],
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInput = (field: keyof PersonaFormData, value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()],
    }));
  };

  const removeArrayItem = (field: keyof PersonaFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="space-y-6">
        <div>
          <label htmlFor="personaName" className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Persona
          </label>
          <input
            id="personaName"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Decisores de Marketing"
          />
        </div>

        <div>
          <label htmlFor="personaRole" className="block text-sm font-medium text-gray-700 mb-2">
            Cargo
          </label>
          <input
            id="personaRole"
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Diretor de Marketing"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho da Empresa
            </label>
            <select
              id="companySize"
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="1-10">1-10 funcionários</option>
              <option value="11-50">11-50 funcionários</option>
              <option value="51-200">51-200 funcionários</option>
              <option value="201-500">201-500 funcionários</option>
              <option value="501+">501+ funcionários</option>
            </select>
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Orçamento Anual
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="Até R$50k">Até R$50k</option>
              <option value="R$50k-R$200k">R$50k-R$200k</option>
              <option value="R$200k-R$500k">R$200k-R$500k</option>
              <option value="R$500k-R$1M">R$500k-R$1M</option>
              <option value="R$1M+">R$1M+</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Localização
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: São Paulo, SP"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pontos de Dor
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="Adicione um ponto de dor"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayInput('painPoints', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  handleArrayInput('painPoints', input.value);
                  input.value = '';
                  input.focus();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.painPoints.map((point, index) => (
              <span
                key={`pain-${index}-${point}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700"
              >
                {point}
                <button
                  type="button"
                  onClick={() => removeArrayItem('painPoints', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objetivos
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="Adicione um objetivo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayInput('goals', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  handleArrayInput('goals', input.value);
                  input.value = '';
                  input.focus();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.goals.map((goal, index) => (
              <span
                key={`goal-${index}-${goal}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => removeArrayItem('goals', index)}
                  className="ml-2 text-green-500 hover:text-green-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interesses
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              placeholder="Adicione um interesse"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayInput('interests', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  handleArrayInput('interests', input.value);
                  input.value = '';
                  input.focus();
                }
              }}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <span
                key={`interest-${index}-${interest}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeArrayItem('interests', index)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (!formData.name || !formData.role) {
                toast.error('Nome e Cargo são campos obrigatórios.');
                return;
              }
              onSave(formData);
            }}
            className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isEditing ? 'Atualizar' : 'Criar'} Persona
          </button>
        </div>
      </div>
    </div>
  );
});

PersonaFormComponent.displayName = 'PersonaFormComponent';

const ICPDiagnostic: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPersonas();
  }, [currentUser]);

  const fetchPersonas = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const personasRef = collection(db, `users/${currentUser.uid}/personas`);
      const snapshot = await getDocs(personasRef);
      const personasList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Persona[];
      setPersonas(personasList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setError('');
    } catch (err) {
      console.error('Erro ao buscar personas:', err);
      setError('Erro ao carregar personas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersona = async (formData: PersonaFormData) => {
    if (!currentUser) {
      toast.error('Você precisa estar logado para salvar uma persona.');
      return;
    }

    try {
      const personaData = {
        ...formData,
        updatedAt: new Date(),
        createdAt: isEditing ? personas.find(p => p.id === isEditing)?.createdAt || new Date() : new Date(),
      };

      if (isEditing) {
        const personaRef = doc(db, `users/${currentUser.uid}/personas`, isEditing);
        await updateDoc(personaRef, personaData);
        toast.success('Persona atualizada com sucesso!');
      } else {
        const personasRef = collection(db, `users/${currentUser.uid}/personas`);
        await addDoc(personasRef, personaData);
        toast.success('Persona criada com sucesso!');
      }

      setIsCreating(false);
      setIsEditing(null);
      fetchPersonas();
    } catch (err) {
      console.error('Erro ao salvar persona:', err);
      toast.error('Erro ao salvar persona. Tente novamente.');
    }
  };

  const handleDeletePersona = async (id: string) => {
    if (!currentUser || !window.confirm('Tem certeza que deseja excluir esta persona?')) return;
    
    try {
      const personaRef = doc(db, `users/${currentUser.uid}/personas`, id);
      await deleteDoc(personaRef);
      toast.success('Persona excluída com sucesso!');
      fetchPersonas();
    } catch (err) {
      console.error('Erro ao excluir persona:', err);
      toast.error('Erro ao excluir persona. Tente novamente.');
    }
  };

  const PersonaCard = useMemo(() => ({ persona }: { persona: Persona }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <UserCircleIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{persona.name}</h3>
            <p className="text-gray-600">{persona.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditing(persona.id);
              setIsCreating(true);
            }}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => persona.id && handleDeletePersona(persona.id)}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{persona.companySize}</span>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{persona.budget}</span>
        </div>
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{persona.location}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
            Pontos de Dor
          </h4>
          <div className="flex flex-wrap gap-2">
            {persona.painPoints.map((point, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-green-500" />
            Objetivos
          </h4>
          <div className="flex flex-wrap gap-2">
            {persona.goals.map((goal, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-blue-500" />
            Interesses
          </h4>
          <div className="flex flex-wrap gap-2">
            {persona.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  ), []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Diagnóstico de ICP</h2>
          <p className="text-gray-600">Crie e gerencie suas personas ideais</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nova Persona
          </button>
        )}
      </div>

      {error && personas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando personas...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {isCreating ? (
            <PersonaFormComponent
              initialData={isEditing ? personas.find(p => p.id === isEditing) : undefined}
              onSave={handleSavePersona}
              onCancel={() => {
                setIsCreating(false);
                setIsEditing(null);
              }}
              isEditing={!!isEditing}
            />
          ) : personas.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {personas.map(persona => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    onEdit={() => {
                      setIsEditing(persona.id);
                      setIsCreating(true);
                    }}
                    onDelete={() => persona.id && handleDeletePersona(persona.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma persona criada
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Crie sua primeira persona para começar a entender melhor seu cliente ideal
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Criar Primeira Persona
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ICPDiagnostic; 