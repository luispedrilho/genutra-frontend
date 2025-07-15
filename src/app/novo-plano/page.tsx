"use client";
import styles from './novo-plano.module.css';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

const objetivos = [
  'Emagrecer',
  'Ganhar massa',
  'Manter',
  'Definir',
  'Reeducação alimentar',
];

const generos = ['Feminino', 'Masculino', 'Outro'];

export default function NovoPlanoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    idade: '',
    genero: '',
    altura: '',
    peso: '',
    gordura: '',
    imc: '',
    circ_abdominal: '',
    objetivo: '',
    restricoes: '',
    preferencias: '',
    estilo_vida: '',
    atividade: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'Dados Pessoais' },
    { label: 'Medidas' },
    { label: 'Objetivos' },
    { label: 'Restrições' },
    { label: 'Preferências' },
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleNext(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function handleBack(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/gerar-plano`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new CustomEvent('auth:logout'));
          router.push('/login');
          return;
        }
        setError(data.error || 'Erro ao gerar plano.');
        setLoading(false);
      } else {
        // Não resetar loading aqui, manter até o redirecionamento
        router.push(`/plano/${data.plano.id}`);
        return;
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <NavBar showBack={true} showHome={true} />
        <div className={styles.bg}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <h2 className={styles.loadingTitle}>Gerando seu plano alimentar...</h2>
              <p className={styles.loadingText}>
                Nossa IA está analisando os dados e criando um plano personalizado para {form.nome}.
                Isso pode levar alguns segundos.
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <NavBar showBack={true} showHome={true} />
      <div className={styles.bg}>
        <div className={styles.card}>
          <h1 className={styles.title}>Nova Anamnese</h1>
          <p className={styles.subtitle}>Vamos criar um plano nutricional personalizado em 5 etapas</p>
          <div className={styles.progressBarBox}>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.stepperModern}>
            {steps.map((s, i) => (
              <div key={s.label} className={styles.stepModernBox}>
                <div className={i === step ? styles.stepCircleActive : styles.stepCircle}>{i + 1}</div>
                <div className={styles.stepLabel}>{s.label}</div>
              </div>
            ))}
          </div>
          <form className={styles.form} onSubmit={step === steps.length - 1 ? handleSubmit : handleNext} autoComplete="off">
            {step === 0 && (
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Nome do paciente</label>
                  <input className={styles.input} name="nome" value={form.nome} onChange={handleChange} required />
                </div>
                <div>
                  <label className={styles.label}>Idade</label>
                  <input className={styles.input} name="idade" value={form.idade} onChange={handleChange} required type="number" min="0" />
                </div>
                <div>
                  <label className={styles.label}>Gênero</label>
                  <select className={styles.input} name="genero" value={form.genero} onChange={handleChange} required>
                    <option value="">Selecione</option>
                    {generos.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className={styles.grid2}>
                <div>
                  <label className={styles.label}>Altura (cm)</label>
                  <input className={styles.input} name="altura" value={form.altura} onChange={handleChange} required type="number" min="0" />
                </div>
                <div>
                  <label className={styles.label}>Peso (kg)</label>
                  <input className={styles.input} name="peso" value={form.peso} onChange={handleChange} required type="number" min="0" />
                </div>
                <div>
                  <label className={styles.label}>Gordura corporal (%)</label>
                  <input className={styles.input} name="gordura" value={form.gordura} onChange={handleChange} type="number" min="0" />
                </div>
                <div>
                  <label className={styles.label}>IMC</label>
                  <input className={styles.input} name="imc" value={form.imc} onChange={handleChange} type="number" min="0" />
                </div>
                <div>
                  <label className={styles.label}>Circunferência abdominal (cm)</label>
                  <input className={styles.input} name="circ_abdominal" value={form.circ_abdominal} onChange={handleChange} type="number" min="0" />
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <label className={styles.label}>Objetivo</label>
                <select className={styles.input} name="objetivo" value={form.objetivo} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {objetivos.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {step === 3 && (
              <div>
                <label className={styles.label}>Restrições alimentares e condições clínicas</label>
                <input className={styles.input} name="restricoes" value={form.restricoes} onChange={handleChange} placeholder="Ex: intolerância à lactose, diabetes..." />
              </div>
            )}
            {step === 4 && (
              <>
                <label className={styles.label}>Preferências alimentares, estilo de vida e nível de atividade física</label>
                <input className={styles.input} name="preferencias" value={form.preferencias} onChange={handleChange} placeholder="Ex: vegetariano, rotina corrida, sedentário..." />
                <label className={styles.label}>Observações extras</label>
                <textarea className={styles.input} name="observacoes" value={form.observacoes} onChange={handleChange} rows={2} placeholder="Observações adicionais" />
              </>
            )}
            {error && <div style={{ color: '#EF4444', marginBottom: 8 }}>{error}</div>}
            <div className={styles.stepButtons}>
              {step > 0 && (
                <Button type="button" variant="secondary" size="md" onClick={handleBack}>
                  Voltar
                </Button>
              )}
              {step < steps.length - 1 && (
                <Button type="button" variant="primary" size="md" onClick={handleNext}>
                  Próximo
                </Button>
              )}
              {step === steps.length - 1 && (
                <Button type="submit" variant="primary" size="md" disabled={loading} className={styles.gerarBtn}>
                  Gerar Plano
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 