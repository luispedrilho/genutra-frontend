"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar, ProtectedRoute, PlanoCard, Button } from "@/components";
import styles from "../painel/painel.module.css";

interface Plano {
  id: string;
  paciente: string;
  objetivo: string;
  data: string;
}

export default function PlanosPage() {
  const router = useRouter();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const LIMIT = 12;

  useEffect(() => {
    async function fetchPlanos() {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const offset = (page - 1) * LIMIT;
      const res = await fetch(`${apiUrl}/planos/recentes?limit=${LIMIT}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setPlanos(data.planos || []);
        setTotal(data.total || 0);
      }
      setLoading(false);
    }
    fetchPlanos();
  }, [page]);

  // Filtros locais
  const objetivosUnicos = Array.from(new Set(planos.map(p => p.objetivo)));
  const planosFiltrados = planos.filter(p => {
    const matchSearch = p.paciente.toLowerCase().includes(search.toLowerCase()) ||
      p.objetivo.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || p.objetivo === filter;
    return matchSearch && matchFilter;
  });

  return (
    <ProtectedRoute>
      <NavBar showBack={true} showHome={true} />
      <div className={styles.dashboardContainer + ' ' + styles.topSpacing}>
        <div className={styles.mainContent}>
          <div className={styles.allPlansSection}>
            <div className={styles.allPlansHeader}>
              <h3 className={styles.allPlansTitle}>Todos os Planos</h3>
              <div className={styles.filtersContainer}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Buscar por paciente ou objetivo..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                  <span className={styles.searchIcon}>🔍</span>
                </div>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="todos">Todos os objetivos</option>
                  {objetivosUnicos.map(obj => (
                    <option key={obj} value={obj}>{obj}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.recentCards}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner} />
                  <p>Carregando planos...</p>
                </div>
              ) : planosFiltrados.length > 0 ? (
                planosFiltrados.map(plano => (
                  <PlanoCard
                    key={plano.id}
                    plano={plano}
                    onVisualizar={id => router.push(`/plano/${id}`)}
                    onEditar={id => router.push(`/plano/${id}/editar`)}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📋</div>
                  <h4 className={styles.emptyTitle}>Nenhum plano encontrado</h4>
                  <p className={styles.emptyText}>
                    Tente ajustar os filtros ou criar um novo plano
                  </p>
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
              )}
            </div>
            <div className={styles.paginationContainer}>
              <button
                className={styles.filterSelect}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Anterior</button>
              <span className={styles.paginationInfo}>
                Página {page} de {Math.ceil(total / LIMIT) || 1}
              </span>
              <button
                className={styles.filterSelect}
                onClick={() => setPage(p => p + 1)}
                disabled={page * LIMIT >= total}
              >Próxima</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 