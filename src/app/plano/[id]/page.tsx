"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/Button';
import styles from './plano.module.css';

interface Plano {
  id: string;
  paciente: string;
  objetivo: string;
  data: string;
  anamnese: any;
  plano: string;
  user_id: string;
}

export default function PlanoPage() {
  const params = useParams();
  const router = useRouter();
  const [plano, setPlano] = useState<Plano | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlano() {
      if (!params.id) return;
      
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`http://localhost:4000/plano/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
          setError(data.error || 'Erro ao carregar plano.');
        } else {
          setPlano(data.plano);
        }
      } catch (err) {
        setError('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    }

    fetchPlano();
  }, [params.id, router]);

  const planoJson: any = typeof plano?.plano === 'object' && plano?.plano !== null ? plano.plano : null;

  if (loading) {
    return (
      <>
        <NavBar showBack={true} showHome={true} />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando plano...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !plano) {
    return (
      <>
        <NavBar showBack={true} showHome={true} />
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error || 'Plano não encontrado.'}</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/painel')}
            >
              Voltar ao Painel
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar showBack={true} showHome={true} />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.info}>
            <h1 className={styles.titulo}>Plano Alimentar</h1>
            <div className={styles.meta}>
              <span><strong>Paciente:</strong> {plano.paciente}</span>
              <span><strong>Objetivo:</strong> {plano.objetivo}</span>
              <span><strong>Data:</strong> {new Date(plano.data).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className={styles.acoes}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/painel')}
            >
              Voltar ao Painel
            </Button>
          </div>
        </div>
        
        <div className={styles.plano}>
          {/* Resumo Nutricional */}
          {planoJson && planoJson.resumo && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Resumo Nutricional</h2>
              <div className={styles.planoTexto}>{planoJson.resumo}</div>
            </section>
          )}
          {/* Plano Alimentar do Dia - Cards por refeição */}
          {planoJson && Array.isArray(planoJson.tabela) && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Plano Alimentar do Dia</h2>
              <div className={styles.refeicoesGrid}>
                {planoJson.tabela.map((row: any, i: number) => (
                  <div key={i} className={styles.cardRefeicao}>
                    <h3 className={styles.nomeRefeicao}>{row.refeicao}</h3>
                    <ul className={styles.listaAlimentos}>
                      {row.alimentos.split(/\n|,|;/).map((item: string, idx: number) => (
                        <li key={idx}>{item.trim()}</li>
                      ))}
                    </ul>
                    {row.observacoes && (
                      <div className={styles.obsRefeicao}><strong>Obs:</strong> {row.observacoes}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Recomendações Finais */}
          {planoJson && planoJson.recomendacoes && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Recomendações Finais</h2>
              <div className={styles.planoTexto}>{planoJson.recomendacoes}</div>
            </section>
          )}
          {/* Notas do Nutricionista */}
          {planoJson && planoJson.notas && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Notas do Nutricionista</h2>
              <div className={styles.planoTexto}>{planoJson.notas}</div>
            </section>
          )}
          {/* Caso não consiga exibir, mostra o texto bruto */}
          {!planoJson && <pre className={styles.planoTexto}>{plano?.plano}</pre>}
        </div>
      </div>
    </>
  );
} 