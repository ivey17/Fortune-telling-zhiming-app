import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tab } from './types';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import FortunePage from './pages/FortunePage';
import ChartPage from './pages/ChartPage';
import CalendarPage from './pages/CalendarPage';
import DivinationPage from './pages/DivinationPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import OnboardingOverlay from './components/OnboardingOverlay';

import { fetchWithAuth } from './services/api';
import { useUser } from './contexts/UserContext';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<Tab>('fortune');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { profile, refreshAll, clearUser } = useUser();

  useEffect(() => {
    if (isLoggedIn) {
      refreshAll();
    }
  }, [isLoggedIn, refreshAll]);

  useEffect(() => {
    // Only show onboarding if logged in and profile is loaded but has no birth_date
    if (isLoggedIn && profile && !profile.birth_date) {
      setShowOnboarding(true);
    }
  }, [isLoggedIn, profile]);

  useEffect(() => {
    // Hide default scrollbar globally
    document.documentElement.style.scrollbarWidth = 'none';
    const style = document.createElement('style');
    style.innerHTML = `
      ::-webkit-scrollbar { display: none; }
      body { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
  }, []);

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'fortune': return <FortunePage />;
      case 'chart': return <ChartPage onGoToProfile={() => setActiveTab('profile')} />;
      case 'calendar': return <CalendarPage />;
      case 'divination': return <DivinationPage />;
      case 'profile': return <ProfilePage />;
      default: return <FortunePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Background Decorative Gradient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-20%] w-[100vw] h-[100vw] bg-surface-container-highest/10 rounded-full blur-[150px]"></div>
      </div>

      <TopBar 
        onProfileClick={() => setActiveTab('profile')} 
      />


      <main className="pt-24 pb-32 px-6 max-w-screen-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingOverlay onComplete={() => {
            setShowOnboarding(false);
            refreshAll();
          }} />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
