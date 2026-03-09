import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdvisorStore } from '../store/useAdvisorStore';
import LoginPage from '../pages/LoginPage';
import OnboardingPage from '../pages/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import CRMPage from '../pages/CRMPage';
import ClientsPage from '../pages/ClientsPage';
import ClientDetailPage from '../pages/ClientDetailPage';
import CalendarPage from '../pages/CalendarPage';
import MessagesPage from '../pages/MessagesPage';
import EngagementsPage from '../pages/EngagementsPage';
import DocumentsPage from '../pages/DocumentsPage';
import EarningsPage from '../pages/EarningsPage';
import SettingsPage from '../pages/SettingsPage';
import RecordingsPage from '../pages/RecordingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function RequireAuth() {
  const { isAuthenticated } = useAdvisorStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function PublicRoute() {
  return <><ScrollToTop /><Outlet /></>;
}

export const router = createBrowserRouter([
  { element: <PublicRoute />, children: [
    { path: '/login', element: <LoginPage /> },
    { path: '/', element: <Navigate to="/login" replace /> },
  ]},
  { element: <RequireAuth />, children: [
    { path: '/onboarding', element: <OnboardingPage /> },
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/crm', element: <CRMPage /> },
    { path: '/clients', element: <ClientsPage /> },
    { path: '/clients/:id', element: <ClientDetailPage /> },
    { path: '/calendar', element: <CalendarPage /> },
    { path: '/recordings', element: <RecordingsPage /> },
    { path: '/messages', element: <MessagesPage /> },
    { path: '/engagements', element: <EngagementsPage /> },
    { path: '/documents', element: <DocumentsPage /> },
    { path: '/earnings', element: <EarningsPage /> },
    { path: '/settings', element: <SettingsPage /> },
  ]},
]);
