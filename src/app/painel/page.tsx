"use client";
import styles from './painel.module.css';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { PlanoCard } from '@/components/PlanoCard';

interface DashboardData {
  totalPlanos: number;
  planosPorMes: { [mes: string]: number };
  totalPacientes: number;
  planosPorObjetivo: { [objetivo: string]: number };
  ultimoPlano: { data: string; paciente: string; objetivo: string } | null;
  planosUltimos7Dias: number;
  topObjetivos: { objetivo: string; count: number }[];
}

interface Plano {
  id: string;
  paciente: string;
  objetivo: string;
  data: string;
  status?: string;
}

export default function PainelPage() {
  const router = useRouter();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentes, setRecentes] = useState<Plano[]>([]);
  const [recentesPage, setRecentesPage] = useState(1);
  const [recentesTotal, setRecentesTotal] = useState(0);
  const RECENTES_LIMIT = 6;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // Buscar dados do dashboard
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setDashboard(data);
      } catch {}
    }
    fetchDashboard();
  }, []);

  // Buscar planos recentes paginados
  useEffect(() => {
    async function fetchRecentes() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const offset = (recentesPage - 1) * RECENTES_LIMIT;
        const res = await fetch(`${apiUrl}/planos/recentes?limit=${RECENTES_LIMIT}&offset=${offset}`, {
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

  // Buscar todos os planos
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
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/planos`, {
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

  // Filtrar planos
  const filteredPlanos = planos.filter(plano => {
    const matchesSearch = plano.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plano.objetivo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'todos' || plano.objetivo === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Gráfico de barras moderno
  function GraficoBarras({ data }: { data: { [mes: string]: number } }) {
    const meses = Object.keys(data).sort();
    const max = Math.max(...Object.values(data), 1);
    
    return (
      <div className={styles.graficoContainer}>
        {meses.map(mes => {
          const valor = data[mes];
          const altura = (valor / max) * 100;
          return (
            <div key={mes} className={styles.barraContainer}>
              <div 
                className={styles.barra}
                style={{ height: `${altura}%` }}
                title={`${valor} planos`}
              />
              <div className={styles.barraLabel}>
                {mes.slice(5, 7)}/{mes.slice(2, 4)}
              </div>
              <div className={styles.barraValor}>{valor}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // Skeleton loader
  function SkeletonCard() {
    return (
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonContent} />
        <div className={styles.skeletonActions} />
      </div>
    );
  }

  // Objetivos únicos para filtro
  const objetivosUnicos = Array.from(new Set(planos.map(p => p.objetivo)));

  return (
    <ProtectedRoute>
      <NavBar showBack={false} showHome={true} />
      <div className={styles.dashboardContainer}>
        {/* Header com métricas principais */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerContent}>
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Bem-vindo de volta!</h1>
              <p className={styles.welcomeSubtitle}>
                Aqui está o resumo dos seus planos nutricionais
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className={styles.createButton}
              onClick={() => router.push('/novo-plano')}
            >
              <span className={styles.buttonIcon}>✨</span>
              Criar Novo Plano
            </Button>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>📊</div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{dashboard?.totalPlanos ?? '--'}</h3>
              <p className={styles.metricLabel}>Total de Planos</p>
            </div>
            <div className={styles.metricTrend}>
              <span className={styles.trendUp}>↗</span>
              <span className={styles.trendValue}>+12%</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>👥</div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{dashboard?.totalPacientes ?? '--'}</h3>
              <p className={styles.metricLabel}>Pacientes Únicos</p>
            </div>
            <div className={styles.metricTrend}>
              <span className={styles.trendUp}>↗</span>
              <span className={styles.trendValue}>+8%</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>📈</div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{dashboard?.planosUltimos7Dias ?? '--'}</h3>
              <p className={styles.metricLabel}>Últimos 7 Dias</p>
            </div>
            <div className={styles.metricTrend}>
              <span className={styles.trendUp}>↗</span>
              <span className={styles.trendValue}>+15%</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>🎯</div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>
                {dashboard?.ultimoPlano ? dashboard.ultimoPlano.paciente : '--'}
              </h3>
              <p className={styles.metricLabel}>Último Paciente</p>
            </div>
            <div className={styles.metricTrend}>
              <span className={styles.trendNeutral}>•</span>
              <span className={styles.trendValue}>Hoje</span>
            </div>
          </div>
        </div>

        {/* Seção principal com gráficos e planos recentes */}
        <div className={styles.mainContent}>
          {/* Coluna esquerda - Gráficos */}
          <div className={styles.chartsSection}>
            {/* Planos Recentes acima do gráfico */}
            <div className={styles.recentSection}>
              <div className={styles.recentHeader}>
                <h3 className={styles.recentTitle}>Planos Recentes</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/planos')}
                >
                  Ver Todos
                </Button>
              </div>
              
              <div className={styles.recentCards}>
                {recentes.length > 0 ? (
                  <>
                    {recentes.map((plano) => (
                      <PlanoCard
                        key={plano.id}
                        plano={plano}
                        onVisualizar={(id) => router.push(`/plano/${id}`)}
                      />
                    ))}
                    <div className={styles.paginationContainer}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRecentesPage((p) => Math.max(1, p - 1))}
                        disabled={recentesPage === 1}
                      >
                        Anterior
                      </Button>
                      <span className={styles.paginationInfo}>
                        Página {recentesPage} de {Math.ceil(recentesTotal / RECENTES_LIMIT) || 1}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRecentesPage((p) => p + 1)}
                        disabled={recentesPage * RECENTES_LIMIT >= recentesTotal}
                      >
                        Próxima
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h4 className={styles.emptyTitle}>Nenhum plano recente</h4>
                    <p className={styles.emptyText}>
                      Crie seu primeiro plano nutricional para começar
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => router.push('/novo-plano')}
                    >
                      Criar Primeiro Plano
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Planos por Mês ocupando toda a largura */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Planos por Mês</h3>
                <div className={styles.chartActions}>
                  <button className={styles.chartAction}>📊</button>
                  <button className={styles.chartAction}>⚙️</button>
                </div>
              </div>
              <div className={styles.chartContent}>
                {dashboard ? (
                  <GraficoBarras data={dashboard.planosPorMes} />
                ) : (
                  <div className={styles.chartSkeleton} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de todos os planos com filtros */}
        <div className={styles.allPlansSection}>
          <div className={styles.allPlansHeader}>
            <h3 className={styles.allPlansTitle}>Todos os Planos</h3>
            <div className={styles.filtersContainer}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Buscar por paciente ou objetivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="todos">Todos os objetivos</option>
                {objetivosUnicos.map(objetivo => (
                  <option key={objetivo} value={objetivo}>{objetivo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.plansTable}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <p>Carregando planos...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <div className={styles.errorIcon}>⚠️</div>
                <p>{error}</p>
              </div>
            ) : filteredPlanos.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.modernTable}>
                  <thead>
                    <tr>
                      <th>Paciente</th>
                      <th>Objetivo</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlanos.map((plano) => (
                      <tr key={plano.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.patientInfo}>
                            <div className={styles.patientAvatar}>
                              {plano.paciente.charAt(0).toUpperCase()}
                            </div>
                            <span>{plano.paciente}</span>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.objectiveTag}>{plano.objetivo}</span>
                        </td>
                        <td className={styles.tableCell}>
                          {new Date(plano.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.statusBadge}>Ativo</span>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => router.push(`/plano/${plano.id}`)}
                            >
                              Ver
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/plano/${plano.id}/editar`)}
                            >
                              Editar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h4 className={styles.emptyTitle}>Nenhum plano encontrado</h4>
                <p className={styles.emptyText}>
                  Tente ajustar os filtros ou criar um novo plano
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 