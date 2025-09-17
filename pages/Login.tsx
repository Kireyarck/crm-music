import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await login();
    // No need to set loading to false, as the component will unmount on successful login
  };

  return (
    <div className="flex items-center justify-center h-screen bg-transparent text-cyber-text-primary">
      <div className="text-center w-full max-w-sm mx-auto p-8">
        <div className="flex items-center justify-center mb-8">
            <span className="text-6xl mr-4 filter grayscale brightness-200">🎵</span>
            <h1 className="text-5xl font-bold title-animate">Kirey<span className="text-neon-purple">Arck</span></h1>
        </div>
        <p className="text-cyber-text-secondary mb-10">Seu estúdio criativo, potencializado por IA.</p>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-cyber-surface/80 backdrop-blur-sm border border-cyber-border rounded-lg px-6 py-3 font-semibold text-cyber-text-primary hover:border-neon-cyan hover:text-neon-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.217-11.283-7.66l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.588 34.925 48 29.82 48 24c0-1.341-.138-2.65-.389-3.917z"></path>
              </svg>
              Entrar com Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;