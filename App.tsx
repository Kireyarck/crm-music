import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Ideas from './pages/Ideas';
import Tasks from './pages/Tasks';
import PlaceholderPage from './pages/PlaceholderPage';
import Settings from './pages/Settings';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
import { Page, AppSettings } from './types';
import { getSettings } from './services/settingsService';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const mainContentRef = useRef<HTMLElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(getSettings());
    };
    window.addEventListener('settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('settings_updated', handleSettingsUpdate);
    };
  }, []);

  const handlePageChange = (page: Page) => {
    // Smooth scroll to top when page changes
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Projetos':
        return <Projects />;
      case 'Ideias':
        return <Ideas />;
      case 'Assistente':
        return <Assistant />;
      case 'Tarefas':
        return <Tasks />;
      case 'Contatos':
        return <PlaceholderPage title="Contatos" />;
      case 'Configurações':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const bgSettings = settings.backgroundSettings;
  const hasWallpaper = settings.backgroundWallpaper || settings.backgroundVideo;

  const bgStyle = {
    filter: `blur(${bgSettings?.blur ?? 0}px) grayscale(${bgSettings?.grayscale ?? 0}%) brightness(${bgSettings?.brightness ?? 1})`,
  };
  
  const overlayStyle = hasWallpaper 
    ? { backgroundColor: `rgba(13, 14, 18, ${bgSettings?.overlayOpacity ?? 0.8})` }
    : {};

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div 
      className="flex h-screen text-cyber-text-primary overflow-hidden relative bg-transparent"
    >
      {hasWallpaper && (
         <div className="absolute inset-0 z-0 overflow-hidden">
            {settings.backgroundVideo ? (
                <video
                    src={settings.backgroundVideo}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover transition-all duration-300"
                    style={bgStyle}
                ></video>
            ) : settings.backgroundWallpaper && (
                <div 
                    className="w-full h-full bg-cover bg-center transition-all duration-300" 
                    style={{
                        ...bgStyle,
                        backgroundImage: `url(${settings.backgroundWallpaper})`
                    }}
                ></div>
            )}
        </div>
      )}

      {hasWallpaper && 
        <div 
          className="absolute inset-0 bg-cyber-bg/80 z-0 transition-colors" 
          style={overlayStyle}
        ></div>
      }

       {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <Header 
          currentPage={currentPage} 
          onMenuClick={() => setIsSidebarOpen(true)}
          user={currentUser}
        />
        <main ref={mainContentRef} className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;