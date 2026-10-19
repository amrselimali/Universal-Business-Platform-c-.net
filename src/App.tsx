import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { ubpStore } from './services/store';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { SettingsGeneral } from './pages/SettingsGeneral';
import { Branches } from './pages/Branches';
import { Warehouses } from './pages/Warehouses';
import { Currencies } from './pages/Currencies';
import { CustomFields } from './pages/CustomFields';
import { Users } from './pages/Users';
import { Roles } from './pages/Roles';
import { AuditLog } from './pages/AuditLog';
import { QaCenter } from './pages/QaCenter';
import { DatabaseAdmin } from './pages/DatabaseAdmin';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Forbidden } from './pages/Forbidden';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const actor = ubpStore.getActor();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
  };

  // If not logged in and not on login page, redirect to login
  if (!actor && currentRoute !== '/login') {
    return <Login onLoginSuccess={() => navigate('/')} />;
  }

  // If on login page
  if (currentRoute === '/login') {
    return (
      <Login
        onLoginSuccess={() => {
          navigate('/');
        }}
      />
    );
  }

  const renderScreen = () => {
    switch (currentRoute) {
      case '/':
        return <Dashboard onNavigate={navigate} />;
      case '/settings/general':
        return <SettingsGeneral />;
      case '/settings/branches':
        return <Branches />;
      case '/settings/warehouses':
        return <Warehouses />;
      case '/settings/currencies':
        return <Currencies />;
      case '/settings/custom-fields':
        return <CustomFields />;
      case '/users':
        return <Users />;
      case '/roles':
        return <Roles />;
      case '/audit':
        return <AuditLog />;
      case '/qa':
        return <QaCenter />;
      case '/admin/database':
        return <DatabaseAdmin />;
      case '/change-password':
        return <ChangePassword onSuccess={() => navigate('/')} />;
      case '/forbidden':
        return <Forbidden onBack={() => navigate('/')} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <MainLayout currentRoute={currentRoute} onNavigate={navigate}>
      {renderScreen()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
