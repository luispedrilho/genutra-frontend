"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só redirecionar após a inicialização e se não estiver logado
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isInitialized, router]);

  // Se não foi inicializado ainda, mostrar loading ou nada
  if (!isInitialized) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Carregando...</div>;
  }

  // Se não estiver logado, não renderiza nada (será redirecionado)
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
} 