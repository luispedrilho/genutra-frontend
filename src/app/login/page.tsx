"use client";
import styles from './login.module.css';
import { Button } from '@/components/Button';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { useGoogleAuth } from '@/lib/useGoogleAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login, isLoggedIn, isInitialized } = useAuth();
  const { loginWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

  // Redirecionar se já estiver logado (após inicialização)
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      router.push('/painel');
    }
  }, [isLoggedIn, isInitialized, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login.');
      } else {
        setSuccess('Login realizado com sucesso! Redirecionando...');
        if (data.token) {
          login(data.token);
        }
        // O redirecionamento será feito pelo useEffect quando isLoggedIn mudar
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  function handleCadastroClick(e: React.MouseEvent) {
    e.preventDefault();
    router.push('/cadastro');
  }

  // Se não foi inicializado ainda, mostrar loading
  if (!isInitialized) {
    return (
      <div className={styles.loginBg}>
        <div className={styles.loginCard}>
          <div style={{ textAlign: 'center', padding: 20 }}>Carregando...</div>
        </div>
      </div>
    );
  }

  // Se já estiver logado, não renderiza nada (será redirecionado)
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className={styles.loginBg}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Genutra</h1>
        <p className={styles.subtitle}>Acesse sua conta</p>
        <form className={styles.form} autoComplete="off" onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            className={styles.input}
            type="email"
            id="email"
            name="email"
            placeholder="seu@email.com"
            autoComplete="username"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <label className={styles.label} htmlFor="password">Senha</label>
          <input
            className={styles.input}
            type="password"
            id="password"
            name="password"
            placeholder="********"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <div style={{ color: '#EF4444', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: '#10B981', marginBottom: 8 }}>{success}</div>}
          <Button type="submit" variant="primary" size="md" className={styles.loginButton} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className={styles.divider}>ou</div>
        <GoogleLoginButton 
          onClick={loginWithGoogle}
          loading={googleLoading}
          disabled={loading || googleLoading}
        />
        {googleError && <div style={{ color: '#EF4444', marginTop: 8, textAlign: 'center' }}>{googleError}</div>}
        <p className={styles.signupText}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" className={styles.signupLink} onClick={handleCadastroClick}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
} 