import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Carregando' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-[#f8fbff] to-[#f0f7ff] overflow-hidden">
      {/* Container central com efeito de brilho */}
      <div className="relative">
        {/* Efeito de brilho suave */}
        <motion.div
          className="absolute -inset-10 bg-blue-100/20 rounded-full blur-[50px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Logo com movimento suave */}
        <motion.div
          className="relative flex items-center justify-center"
          animate={{
            y: [-2, 2, -2],
            scale: [1, 1.02, 1],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
        >
          <div className="w-24 h-24 flex items-center justify-center">
            <Logo />
          </div>
        </motion.div>
      </div>

      {/* Mensagem com fade */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-xl font-medium text-center"
      >
        <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          {message}
        </span>
        <motion.span
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ...
        </motion.span>
      </motion.div>

      {/* Barra de progresso sutil */}
      <motion.div
        className="mt-8 h-0.5 w-32 bg-gray-100 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner; 