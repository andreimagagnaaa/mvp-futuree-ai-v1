import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Se ainda estiver carregando, mostra um loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página inicial
  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute; 