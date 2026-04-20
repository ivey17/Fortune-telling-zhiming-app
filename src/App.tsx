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
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<Tab>('fortune');
  const [prevTab, setPrevTab] = useState<Tab>('fortune');
  const [showSettings, setShowSettings] = useState(false);

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
    setPrevTab(activeTab);
    setActiveTab(newTab);
    setShowSettings(false); // Close settings drawer when switching tabs
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'fortune': return <FortunePage />;
      case 'chart': return <ChartPage />;
      case 'calendar': return <CalendarPage />;
      case 'divination': return <DivinationPage />;
      case 'profile': return <ProfilePage onSettingsClick={() => setShowSettings(true)} />;
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
        onMenuClick={() => setShowSettings(true)} 
        onProfileClick={() => setActiveTab('profile')} 
      />

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-background/95 backdrop-blur-xl border-r border-outline-variant/20 z-[70] shadow-2xl overflow-y-auto px-6 py-12 no-scrollbar"
            >
              <SettingsPage 
                onBack={() => setShowSettings(false)} 
                onLogout={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                  setShowSettings(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
