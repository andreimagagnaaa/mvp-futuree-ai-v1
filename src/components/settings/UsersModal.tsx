import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Users, UserPlus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
}

export const UsersModal: React.FC<UsersModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [newUser, setNewUser] = useState({
    email: ''
  });

  useEffect(() => {
    if (isOpen && currentUser?.uid) {
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const fetchUsers = async () => {
    if (!currentUser?.uid) return;

    try {
      setIsLoading(true);
      const usersRef = collection(db, 'users', currentUser.uid, 'team');
      const usersDoc = await getDoc(doc(usersRef, 'data'));

      if (usersDoc.exists()) {
        setUsers(usersDoc.data().users || []);
      } else {
        await setDoc(doc(usersRef, 'data'), { users: [] });
        setUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!currentUser?.uid) return;

    try {
      const usersRef = collection(db, 'users', currentUser.uid, 'team');
      const usersDoc = await getDoc(doc(usersRef, 'data'));
      const currentUsers = usersDoc.exists() ? usersDoc.data().users : [];
      
      const updatedUsers = currentUsers.filter((user: User) => user.id !== id);
      
      await setDoc(doc(usersRef, 'data'), {
        users: updatedUsers,
        lastUpdated: new Date().toISOString()
      });

      setUsers(updatedUsers);
      toast.success('Usuário removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !newUser.email.trim()) return;

    try {
      const usersRef = collection(db, 'users', currentUser.uid, 'team');
      const usersDoc = await getDoc(doc(usersRef, 'data'));
      const currentUsers = usersDoc.exists() ? usersDoc.data().users : [];

      // Verificar se o email já existe
      if (currentUsers.some((user: User) => user.email === newUser.email)) {
        toast.error('Este email já foi convidado');
        return;
      }

    const newUserData: User = {
        id: crypto.randomUUID(),
      name: newUser.email.split('@')[0],
      email: newUser.email,
      status: 'pending'
    };

      const updatedUsers = [...currentUsers, newUserData];

      await setDoc(doc(usersRef, 'data'), {
        users: updatedUsers,
        lastUpdated: new Date().toISOString()
      });

      setUsers(updatedUsers);
    setShowInvite(false);
      setNewUser({ email: '' });
      toast.success('Convite enviado com sucesso');
    } catch (error) {
      console.error('Erro ao convidar usuário:', error);
      toast.error('Erro ao enviar convite');
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 mb-4"
                >
                  <Users className="w-5 h-5" />
                  Gerenciar Usuários
                </Dialog.Title>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      Gerencie os usuários que têm acesso ao sistema
                    </p>
                    <button
                      onClick={() => setShowInvite(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                      <UserPlus className="w-4 h-4" />
                      Convidar Usuário
                    </button>
                  </div>

            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado. Convide alguém para começar!
              </div>
            ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                    <div className="flex items-center gap-4">
                          {user.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
              </div>
            )}
                  </div>

                  {/* Modal de Convite */}
                  {showInvite && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium text-gray-900">Convidar Usuário</h4>
                          <button
                    onClick={() => {
                      setShowInvite(false);
                      setNewUser({ email: '' });
                    }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleInviteUser} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={newUser.email}
                      onChange={(e) => setNewUser({ email: e.target.value })}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2"
                              placeholder="usuario@exemplo.com"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                      onClick={() => {
                        setShowInvite(false);
                        setNewUser({ email: '' });
                      }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                              Enviar Convite
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

          <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
        </div>
      </Dialog>
  );
}; 