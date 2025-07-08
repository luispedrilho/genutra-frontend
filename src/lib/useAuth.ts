import { useState, useEffect } from 'react';
import { auth } from './auth';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Verificar estado inicial apenas no cliente
    if (typeof window !== 'undefined') {
      setIsLoggedIn(auth.isLoggedIn());
      setIsInitialized(true);
    }

    // Listener para mudanças de autenticação
    const handleAuthChange = () => {
      setIsLoggedIn(auth.isLoggedIn());
    };

    // Adicionar listeners para eventos de login/logout
    window.addEventListener('auth:login', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('auth:login', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
    };
  }, []);

  return {
    isLoggedIn,
    isInitialized,
    logout: auth.logout,
    login: auth.login,
    getToken: auth.getToken
  };
} 