"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
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

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/plano/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            window.dispatchEvent(new CustomEvent('auth:logout'));
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

  // Garante que o plano seja um objeto, mesmo se vier como string JSON
  let planoJson: any = null;
  if (plano?.plano) {
    if (typeof plano.plano === 'object') {
      planoJson = plano.plano;
    } else {
      try {
        planoJson = JSON.parse(plano.plano);
      } catch (e) {
        planoJson = null;
      }
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <NavBar showBack={true} showHome={true} />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando plano...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !plano) {
    return (
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
                    <div className={styles.headerRefeicao}>
                      <h3 className={styles.nomeRefeicao}>{row.refeicao}</h3>
                      {row.horario && (
                        <span className={styles.horarioRefeicao}>🕐 {row.horario}</span>
                      )}
                    </div>
                    <ul className={styles.listaAlimentos}>
                      {Array.isArray(row.alimentos)
                        ? row.alimentos.map((item: string, idx: number) => (
                            <li key={idx}>{item.trim()}</li>
                          ))
                        : String(row.alimentos).split(/\n|,|;/).map((item: string, idx: number) => (
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
          {/* Caso não consiga exibir, mostra mensagem amigável */}
          {!planoJson && (
            <div className={styles.planoTexto}>
              Não foi possível exibir o plano de forma estruturada. Tente gerar novamente ou contate o suporte.<br />
              <pre style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{plano?.plano}</pre>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 