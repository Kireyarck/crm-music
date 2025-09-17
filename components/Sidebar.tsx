// Implemented the Sidebar component to render the main application navigation.
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Page, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, isOpen, onClose, user }) => {
  const { logout } = useAuth();

  const handleNavClick = (page: Page) => {
    onPageChange(page);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <aside className={`fixed lg:relative inset-y-0 left-0 bg-cyber-surface/90 backdrop-blur-sm border-r border-cyber-border w-64 p-6 flex flex-col transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
      <div className="flex items-center mb-10">
        <span className="text-3xl mr-3 filter grayscale brightness-200">🎵</span>
        <h1 className="text-2xl font-bold text-cyber-text-primary">Kirey<span className="text-neon-purple">Arck</span></h1>
      </div>
      <nav className="flex-1">
        <ul>
          {NAV_ITEMS.map(item => (
            <li key={item.name} className="mb-2">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavClick(item.name); }}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors relative sidebar-item-animate ${
                  currentPage === item.name 
                    ? 'bg-neon-purple/20 text-white active-sidebar-glow' 
                    : 'text-cyber-text-secondary hover:bg-cyber-border hover:text-cyber-text-primary'
                }`}
              >
                {currentPage === item.name && <div className="absolute left-0 top-0 h-full w-1 bg-neon-purple rounded-r-full active-indicator"></div>}
                <span className="mr-4 text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="flex items-center p-3 bg-cyber-border/50 rounded-lg">
            {user?.picture ? (
              <img src={user.picture} alt="Foto de Perfil" className="w-10 h-10 rounded-full object-cover mr-3" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neon-purple flex items-center justify-center font-bold mr-3">
                  {user?.name?.[0] || 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-cyber-text-primary truncate">{user?.name || 'Artista'}</p>
                <p className="text-sm text-cyber-text-secondary truncate">{user?.email || 'Plano Pro'}</p>
            </div>
            <button 
                onClick={logout}
                className="ml-2 p-2 rounded-full text-cyber-text-secondary hover:bg-neon-purple/20 hover:text-white transition-colors"
                aria-label="Sair"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;