// Implemented the Header component to display the current page title and user actions.
import React from 'react';
import { Page, User } from '../types';

interface HeaderProps {
  currentPage: Page;
  onMenuClick: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onMenuClick, user }) => {
  return (
    <header className="bg-cyber-surface/80 backdrop-blur-sm border-b border-cyber-border p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-1 mr-3 text-cyber-text-secondary rounded-full hover:bg-cyber-border transition-colors md:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-cyber-text-primary">{currentPage}</h2>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 rounded-full hover:bg-cyber-border transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyber-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button className="p-2 rounded-full hover:bg-cyber-border transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyber-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          {user?.picture ? (
            <img src={user.picture} alt="Foto de Perfil" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neon-purple flex items-center justify-center font-bold">
              {user?.name?.[0] || 'A'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;