import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';

const LoginPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

  // Se o usuário já estiver autenticado, não mostra a página de login
  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </div>
  );
};

export default LoginPage; 