import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from './auth';

// Definições de tipos para o Google Sign-In
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
        };
      };
    };
  }
}

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const loginWithGoogle = async () => {
    setLoading(true);
    setError('');

    try {
      // Verificar se o Google Sign-In está disponível
      if (typeof window === 'undefined' || !window.google) {
        setError('Google Sign-In não está disponível. Verifique sua conexão.');
        return;
      }

      // Inicializar o Google Sign-In
      const google = window.google;
      
      // Configurar o cliente do Google
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Mostrar o popup de login
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError('Não foi possível mostrar o popup do Google. Tente novamente.');
          setLoading(false);
        }
      });

    } catch (err) {
      console.error('Erro ao iniciar login do Google:', err);
      setError('Erro ao conectar com o Google. Tente novamente.');
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      // Decodificar o token JWT do Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleUser: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };

      // Enviar para o backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential,
          user: googleUser,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao autenticar com Google');
      }

      // Fazer login com o token retornado
      if (data.token) {
        auth.login(data.token);
        router.push('/painel');
      } else {
        throw new Error('Token não recebido do servidor');
      }

    } catch (err) {
      console.error('Erro no callback do Google:', err);
      setError(err instanceof Error ? err.message : 'Erro ao autenticar com Google');
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithGoogle,
    loading,
    error,
  };
} 