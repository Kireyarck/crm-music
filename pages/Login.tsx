import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type FormState = 'login' | 'signup' | 'recover';

const Login: React.FC = () => {
  const { login, signUp, recoverPassword, hasUser } = useAuth();
  const [formState, setFormState] = useState<FormState>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');

  useEffect(() => {
    // On mount, check if a user exists. If not, force signup.
    if (!hasUser()) {
      setFormState('signup');
    }
  }, [hasUser]);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRecoveryPassword('');
    setError('');
    setMessage('');
  };

  const handleStateChange = (newState: FormState) => {
    resetForm();
    setFormState(newState);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const user = await login(username, password);
    if (!user) {
      setError('Nome de usuário ou senha inválidos.');
      setIsLoading(false);
    }
    // On successful login, the App component will redirect.
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!recoveryPassword) {
      setError('A contra-senha é obrigatória.');
      return;
    }

    setIsLoading(true);
    setError('');
    const success = await signUp(username, password, recoveryPassword);
    setIsLoading(false);

    if (success) {
      setMessage('Conta criada com sucesso! Faça o login para continuar.');
      handleStateChange('login');
    } else {
      setError('Não foi possível criar a conta. Talvez uma já exista.');
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await recoverPassword(username, recoveryPassword, password);
    setIsLoading(false);

    if (success) {
        setMessage('Senha redefinida com sucesso! Faça o login com sua nova senha.');
        handleStateChange('login');
    } else {
        setError('Usuário ou contra-senha incorretos.');
    }
  };
  
  const renderForm = () => {
    switch (formState) {
      case 'signup':
        return (
          <form onSubmit={handleSignUp} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-cyber-text-primary">Criar Conta</h2>
            {!hasUser() && <p className="text-sm text-center text-neon-cyan">Bem-vindo! Configure sua conta para começar.</p>}
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Usuário</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
             <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Confirmar Senha</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Contra-Senha (para recuperação)</label>
              <input type="password" value={recoveryPassword} onChange={e => setRecoveryPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-neon-purple hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-glow-purple disabled:opacity-50">
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
            {hasUser() && <p className="text-center text-sm">Já tem uma conta? <button type="button" onClick={() => handleStateChange('login')} className="font-semibold text-neon-cyan hover:underline">Entrar</button></p>}
          </form>
        );
      case 'recover':
        return (
          <form onSubmit={handleRecover} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-cyber-text-primary">Recuperar Senha</h2>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Usuário</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Contra-Senha</label>
              <input type="password" value={recoveryPassword} onChange={e => setRecoveryPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Nova Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-neon-purple hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-glow-purple disabled:opacity-50">
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
            <p className="text-center text-sm">Lembrou sua senha? <button type="button" onClick={() => handleStateChange('login')} className="font-semibold text-neon-cyan hover:underline">Voltar para Login</button></p>
          </form>
        );
      case 'login':
      default:
        return (
          <form onSubmit={handleLogin} className="space-y-4">
             <h2 className="text-2xl font-semibold text-center text-cyber-text-primary">Login</h2>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Usuário</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-cyber-text-secondary mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-neon-purple hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-glow-purple disabled:opacity-50">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="text-center text-sm space-x-4">
                <button type="button" onClick={() => handleStateChange('recover')} className="font-semibold text-neon-cyan hover:underline">Esqueceu a senha?</button>
            </div>
          </form>
        );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-transparent text-cyber-text-primary p-4">
      <div className="text-center w-full max-w-sm mx-auto mb-8">
        <div className="flex items-center justify-center mb-4">
          <span className="text-6xl mr-4 filter grayscale brightness-200">🎵</span>
          <h1 className="text-5xl font-bold title-animate">Kirey<span className="text-neon-purple">Arck</span></h1>
        </div>
        <p className="text-cyber-text-secondary">Seu estúdio criativo, potencializado por IA.</p>
      </div>

      <div className="w-full max-w-sm bg-cyber-surface/80 backdrop-blur-sm border border-cyber-border rounded-xl p-8 shadow-lg">
          {error && <div className="bg-red-900/50 border border-red-500/50 text-red-300 text-sm rounded-md p-3 mb-4 text-center">{error}</div>}
          {message && <div className="bg-green-900/50 border border-green-500/50 text-green-300 text-sm rounded-md p-3 mb-4 text-center">{message}</div>}
          {renderForm()}
      </div>
    </div>
  );
};

export default Login;