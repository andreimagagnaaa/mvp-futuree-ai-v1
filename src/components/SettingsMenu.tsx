import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Settings,
  User,
  Mail,
  Lock,
  ChevronDown,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCustomerPortalSession } from '../services/stripeService';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ProfileModal } from './settings/ProfileModal';
import { SecurityModal } from './settings/SecurityModal';
import { UsersModal } from './settings/UsersModal';

interface SettingsMenuProps {
  className?: string;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ className = '' }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      // Busca o customerId do usuário
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Verifica se o usuário tem uma assinatura ativa
      const hasActiveSubscription = userData?.isPremium === true && userData?.stripeCustomerId;
      
      if (!hasActiveSubscription) {
        toast.error(
          userData?.stripeCustomerId 
            ? 'Sua assinatura não está ativa. Por favor, faça upgrade para acessar esta função.'
            : 'Você ainda não tem uma assinatura. Por favor, faça upgrade para acessar esta função.'
        );
        return;
      }

      // Cria uma sessão do portal do Stripe
      const portalUrl = await createCustomerPortalSession(userData.stripeCustomerId);
      
      // Redireciona para o portal
      window.location.href = portalUrl;
    } catch (error: any) {
      console.error('Erro ao abrir portal de gerenciamento:', error);
      toast.error('Erro ao abrir portal de gerenciamento. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      label: 'Gerenciar Assinatura',
      icon: CreditCard,
      onClick: handleManageSubscription,
      disabled: isLoading
    },
    {
      label: 'Perfil',
      icon: User,
      onClick: () => setOpenModal('profile')
    },
    {
      label: 'Email',
      icon: Mail,
      onClick: () => setOpenModal('email')
    },
    {
      label: 'Senha',
      icon: Lock,
      onClick: () => setOpenModal('password')
    }
  ];

  return (
    <>
      <Menu as="div" className={`relative w-full sm:w-auto sm:inline-block text-left ${className}`}>
        <Menu.Button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full">
          <Settings className="w-5 h-5" />
          Configurações
          <ChevronDown className="w-4 h-4" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-1">
              {menuItems.map((item, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <button
                      onClick={item.onClick}
                      disabled={item.disabled}
                      className={`${
                        active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                      } group flex w-full items-center rounded-md px-3 py-2 text-sm gap-2 ${
                        item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Modais */}
      <ProfileModal
        isOpen={openModal === 'profile'}
        onClose={() => setOpenModal(null)}
      />

      <SecurityModal
        isOpen={openModal === 'email'}
        onClose={() => setOpenModal(null)}
        type="email"
      />

      <SecurityModal
        isOpen={openModal === 'password'}
        onClose={() => setOpenModal(null)}
        type="password"
      />

      <UsersModal
        isOpen={openModal === 'users'}
        onClose={() => setOpenModal(null)}
      />
    </>
  );
};

export default SettingsMenu; 