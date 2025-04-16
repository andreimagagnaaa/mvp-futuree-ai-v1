import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import DiagnosticPage from './pages/DiagnosticPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { DiagnosticProvider } from './contexts/DiagnosticContext';

const withProviders = (Component: React.ComponentType) => (
  <AuthProvider>
    <DiagnosticProvider>
      {React.createElement(Component)}
    </DiagnosticProvider>
  </AuthProvider>
);

const routes: RouteObject[] = [
  {
    path: "/",
    element: withProviders(App),
    errorElement: <div>Página não encontrada</div>
  },
  {
    path: "/diagnostic",
    element: (
      <AuthProvider>
        <DiagnosticProvider>
          <ProtectedRoute>
            <DiagnosticPage />
          </ProtectedRoute>
        </DiagnosticProvider>
      </AuthProvider>
    )
  },
  {
    path: "/report",
    element: (
      <AuthProvider>
        <DiagnosticProvider>
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        </DiagnosticProvider>
      </AuthProvider>
    )
  },
  {
    path: "/dashboard",
    element: (
      <AuthProvider>
        <DiagnosticProvider>
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </DiagnosticProvider>
      </AuthProvider>
    )
  }
];

export const router = createBrowserRouter(routes); 