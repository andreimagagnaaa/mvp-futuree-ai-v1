import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'forgot-password';
}

interface ForgotPasswordFormProps {
  onBackToLoginClick: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'login' 
}) => {
  const [view, setView] = useState(initialView);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log('AuthModal: Usuário autenticado, fechando modal');
      onClose();
    }
  }, [currentUser, onClose]);

  const handleClose = () => {
    console.log('AuthModal: Fechando modal');
    onClose();
  };

  const handleViewChange = (newView: 'login' | 'signup') => {
    console.log('AuthModal: Mudando view para', newView);
    setView(newView);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-[95%] sm:max-w-md mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[95vh] sm:max-h-[90vh]"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 text-gray-400 hover:text-gray-600 z-10 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {view === 'login' && (
              <LoginForm
                onSignupClick={() => handleViewChange('signup')}
                onForgotPasswordClick={() => setView('forgot-password')}
                onClose={handleClose}
              />
            )}

            {view === 'signup' && (
              <SignupForm
                onLoginClick={() => handleViewChange('login')}
                onClose={handleClose}
              />
            )}

            {view === 'forgot-password' && (
              <ForgotPasswordForm
                onBackToLoginClick={() => setView('login')}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ForgotPasswordForm = ({ onBackToLoginClick }: ForgotPasswordFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recuperar Senha</h2>
        <button 
          onClick={onBackToLoginClick}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>
      <p className="text-gray-600">
        Digite seu e-mail abaixo e enviaremos instruções para redefinir sua senha.
      </p>
      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="seu@email.com"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Enviar instruções
        </button>
      </form>
    </div>
  );
}; 