"use client";
import styles from './cadastro.module.css';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';

export default function CadastroPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    cpf_cnpj: '',
    profession: '',
    crn: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar.');
      } else {
        setSuccess('Cadastro realizado! Redirecionando para login...');
        setForm({ name: '', email: '', password: '', cpf_cnpj: '', profession: '', crn: '' });
        setTimeout(() => {
          router.push('/login');
        }, 1800);
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar showBack={true} showHome={true} />
      <div className={styles.cadastroBg}>
        <div className={styles.cadastroCard}>
          <h1 className={styles.title}>Criar Conta</h1>
          <p className={styles.subtitle}>Comece agora no Genutra</p>
          <form className={styles.form} autoComplete="off" onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="name">Nome completo</label>
            <input
              className={styles.input}
              type="text"
              id="name"
              name="name"
              placeholder="Seu nome completo"
              required
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              className={styles.input}
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            <label className={styles.label} htmlFor="password">Senha</label>
            <input
              className={styles.input}
              type="password"
              id="password"
              name="password"
              placeholder="********"
              required
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            <label className={styles.label} htmlFor="cpf_cnpj">CPF ou CNPJ</label>
            <input
              className={styles.input}
              type="text"
              id="cpf_cnpj"
              name="cpf_cnpj"
              placeholder="000.000.000-00"
              required
              value={form.cpf_cnpj}
              onChange={handleChange}
              disabled={loading}
            />
            <label className={styles.label} htmlFor="profession">Profissão</label>
            <input
              className={styles.input}
              type="text"
              id="profession"
              name="profession"
              placeholder="Nutricionista, Coach, etc."
              required
              value={form.profession}
              onChange={handleChange}
              disabled={loading}
            />
            <label className={styles.label} htmlFor="crn">CRN (opcional)</label>
            <input
              className={styles.input}
              type="text"
              id="crn"
              name="crn"
              placeholder="12345/P"
              value={form.crn}
              onChange={handleChange}
              disabled={loading}
            />
            {error && <div style={{ color: '#EF4444', marginBottom: 8 }}>{error}</div>}
            {success && <div style={{ color: '#10B981', marginBottom: 8 }}>{success}</div>}
            <Button type="submit" variant="primary" size="md" className={styles.cadastroButton} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          <p className={styles.loginText}>
            Já tem uma conta?{' '}
            <Link href="/login" className={styles.loginLink}>Entrar</Link>
          </p>
        </div>
      </div>
    </>
  );
} 