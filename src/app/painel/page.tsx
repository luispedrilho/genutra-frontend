"use client";
import styles from './painel.module.css';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { useEffect, useState } from 'react';

interface DashboardData {
  totalPlanos: number;
  planosPorMes: { [mes: string]: number };
  totalPacientes: number;
  planosPorObjetivo: { [objetivo: string]: number };
  ultimoPlano: { data: string; paciente: string; objetivo: string } | null;
  planosUltimos7Dias: number;
  topObjetivos: { objetivo: string; count: number }[];
}

export default function PainelPage() {
  const router = useRouter();
  const [planos, setPlanos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentes, setRecentes] = useState<any[]>([]);
  const [recentesTotal, setRecentesTotal] = useState(0);
  const [recentesPage, setRecentesPage] = useState(0);
  const RECENTES_LIMIT = 3;

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:4000/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDashboard(data);
      } catch {}
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    async function fetchRecentes() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`http://localhost:4000/planos/recentes?limit=${RECENTES_LIMIT}&offset=${recentesPage * RECENTES_LIMIT}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setRecentes(data.planos || []);
          setRecentesTotal(data.total || 0);
        }
      } catch {}
    }
    fetchRecentes();
  }, [recentesPage]);

  useEffect(() => {
    async function fetchPlanos() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token não encontrado. Faça login novamente.');
          router.push('/login');
          return;
        }
        
        const res = await fetch('http://localhost:4000/planos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            // Token inválido, limpar e redirecionar
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
          setError(data.error || 'Erro ao buscar planos.');
        } else {
          setPlanos(data.planos || []);
        }
      } catch (err) {
        setError('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    }
    fetchPlanos();
  }, [router]);

  // Gráfico de barras simples para planos por mês
  function GraficoBarras({ data }: { data: { [mes: string]: number } }) {
    const meses = Object.keys(data).sort();
    const max = Math.max(...Object.values(data), 1);
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80, marginTop: 8 }}>
        {meses.map(mes => (
          <div key={mes} style={{ textAlign: 'center' }}>
            <div style={{ background: '#3b82f6', width: 24, height: `${(data[mes] / max) * 60 + 10}px`, borderRadius: 4, marginBottom: 4 }} />
            <div style={{ fontSize: 12, color: '#6b7280' }}>{mes.slice(5, 7)}/{mes.slice(2, 4)}</div>
            <div style={{ fontSize: 12, color: '#374151' }}>{data[mes]}</div>
          </div>
        ))}
      </div>
    );
  }

  // Paginação dos planos recentes
  const totalPages = Math.ceil(recentesTotal / RECENTES_LIMIT);

  return (
    <>
      <NavBar showBack={false} showHome={true} />
      <div className={styles.bg}>
        {/* TOPO: Título e botão Novo Plano */}
        <div className={styles.topBar}>
          <h1 className={styles.title}>Painel</h1>
          <Button
            variant="primary"
            size="md"
            className={styles.novoPlanoBtn}
            onClick={() => router.push('/novo-plano')}
          >
            + Novo Plano
          </Button>
        </div>
        {/* GRID PRINCIPAL: Cards dos planos e dashboard */}
        <div className={styles.gridPainel}>
          {/* Cards dos últimos planos (2 linhas x 3 colunas) */}
          <div className={styles.cardsRecentesGrid}>
            <h2 className={styles.recentesTitulo}>Últimos Planos</h2>
            <div className={styles.recentesCardsGrid}>
              {recentes.map((plano) => (
                <div key={plano.id} className={styles.cardPlanoRecente}>
                  <div className={styles.cardPlanoHeader}>
                    <span className={styles.cardPlanoPaciente}>{plano.paciente}</span>
                    <span className={styles.cardPlanoData}>{new Date(plano.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className={styles.cardPlanoObjetivo}>{plano.objetivo}</div>
                  <div className={styles.cardPlanoAcoes}>
                    <button className={styles.viewBtn} onClick={() => router.push(`/plano/${plano.id}`)}>Visualizar</button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.paginacaoRecentes}>
                <button disabled={recentesPage === 0} onClick={() => setRecentesPage(recentesPage - 1)}>&lt;</button>
                <span>Página {recentesPage + 1} de {totalPages}</span>
                <button disabled={recentesPage >= totalPages - 1} onClick={() => setRecentesPage(recentesPage + 1)}>&gt;</button>
              </div>
            )}
          </div>
          {/* Dashboard cards à direita */}
          <div className={styles.dashboardCardsCol}>
            <div className={styles.dashboardCardModern}>
              <div className={styles.dashboardLabel}>Planos gerados</div>
              <div className={styles.dashboardValue}>{dashboard?.totalPlanos ?? '--'}</div>
            </div>
            <div className={styles.dashboardCardModern}>
              <div className={styles.dashboardLabel}>Pacientes únicos</div>
              <div className={styles.dashboardValue}>{dashboard?.totalPacientes ?? '--'}</div>
            </div>
            <div className={styles.dashboardCardModern}>
              <div className={styles.dashboardLabel}>Último plano</div>
              <div className={styles.dashboardValue} style={{ fontSize: 14 }}>
                {dashboard?.ultimoPlano ? (
                  <>
                    <span style={{ color: '#3366ff', fontWeight: 600 }}>{dashboard.ultimoPlano.paciente}</span><br />
                    {dashboard.ultimoPlano.objetivo}<br />
                    <span style={{ color: '#6b7280' }}>{new Date(dashboard.ultimoPlano.data).toLocaleDateString('pt-BR')}</span>
                  </>
                ) : '---'}
              </div>
            </div>
          </div>
        </div>
        {/* Cards grandes abaixo: objetivos e gráfico */}
        <div className={styles.gridPainelBottom}>
          <div className={styles.dashboardCardModern}>
            <div className={styles.dashboardLabel}>Planos por objetivo</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {dashboard && Object.entries(dashboard.planosPorObjetivo).map(([obj, count]) => (
                <div key={obj} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>
                  {obj}: {count}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.dashboardCardModern}>
            <div className={styles.dashboardLabel}>Planos por mês</div>
            {dashboard && <GraficoBarras data={dashboard.planosPorMes} />}
          </div>
        </div>
        {/* Tabela de todos os planos */}
        <div className={styles.card}>
          <h2 className={styles.subtitle}>Todos os Planos</h2>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>Carregando...</div>
          ) : error ? (
            <div style={{ color: '#EF4444', padding: 24, textAlign: 'center' }}>{error}</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Objetivo</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.map((plano) => (
                    <tr key={plano.id}>
                      <td>{plano.paciente}</td>
                      <td>{plano.objetivo}</td>
                      <td>{plano.data}</td>
                      <td>
                        <button 
                          className={styles.viewBtn}
                          onClick={() => router.push(`/plano/${plano.id}`)}
                        >
                          Visualizar
                        </button>
                        <button className={styles.editBtn}>Editar</button>
                        <button className={styles.deleteBtn}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {planos.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>
                  Nenhum plano cadastrado ainda.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 