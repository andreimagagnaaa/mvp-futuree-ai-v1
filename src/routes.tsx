import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import DiagnosticPage from './pages/DiagnosticPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import DashboardPremium from './pages/DashboardPremium';
import AIPage from './pages/ai';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PremiumRoute from './components/auth/PremiumRoute';
import { AuthProvider } from './contexts/AuthContext';
import { DiagnosticProvider } from './contexts/DiagnosticContext';
import { MetricsProvider } from './contexts/MetricsContext';
import { CustomMetricsProvider } from './contexts/CustomMetricsContext';

const withProviders = (Component: React.ComponentType) => (
  <AuthProvider>
    <DiagnosticProvider>
      <MetricsProvider>
        <CustomMetricsProvider>
          <Component />
        </CustomMetricsProvider>
      </MetricsProvider>
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
  },
  {
    path: "/dashboard-premium",
    element: (
      <AuthProvider>
        <DiagnosticProvider>
          <MetricsProvider>
            <CustomMetricsProvider>
              <ProtectedRoute>
                <PremiumRoute>
                  <DashboardPremium />
                </PremiumRoute>
              </ProtectedRoute>
            </CustomMetricsProvider>
          </MetricsProvider>
        </DiagnosticProvider>
      </AuthProvider>
    )
  },
  {
    path: "/ai",
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <PremiumRoute>
            <AIPage />
          </PremiumRoute>
        </ProtectedRoute>
      </AuthProvider>
    )
  }
];

export const router = createBrowserRouter(routes); 