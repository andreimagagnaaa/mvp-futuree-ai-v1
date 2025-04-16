import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'forgot-password';
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-[90%] sm:max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
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