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
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlano, setEditingPlano] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Carregar dados do plano
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
          // Parse do plano para edição
          let planoJson: any = null;
          if (data.plano?.plano) {
            if (typeof data.plano.plano === 'object') {
              planoJson = data.plano.plano;
            } else {
              try {
                planoJson = JSON.parse(data.plano.plano);
              } catch (e) {
                planoJson = null;
              }
            }
          }
          
          // Garantir que os horários estejam no formato correto
          if (planoJson && Array.isArray(planoJson.tabela)) {
            planoJson.tabela = planoJson.tabela.map((refeicao: any) => ({
              ...refeicao,
              horario: refeicao.horario || '',
              alimentos: Array.isArray(refeicao.alimentos) ? refeicao.alimentos : 
                        String(refeicao.alimentos || '').split(/\n|,|;/).filter((item: string) => item.trim()),
              observacoes: refeicao.observacoes || ''
            }));
          }
          
          console.log('Plano carregado para edição:', planoJson);
          setEditingPlano(planoJson);
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restaurar dados originais
    if (plano?.plano) {
      let planoJson: any = null;
      if (typeof plano.plano === 'object') {
        planoJson = plano.plano;
      } else {
        try {
          planoJson = JSON.parse(plano.plano);
        } catch (e) {
          planoJson = null;
        }
      }
      
      // Garantir que os horários estejam no formato correto
      if (planoJson && Array.isArray(planoJson.tabela)) {
        planoJson.tabela = planoJson.tabela.map((refeicao: any) => ({
          ...refeicao,
          horario: refeicao.horario || '',
          alimentos: Array.isArray(refeicao.alimentos) ? refeicao.alimentos : 
                    String(refeicao.alimentos || '').split(/\n|,|;/).filter((item: string) => item.trim()),
          observacoes: refeicao.observacoes || ''
        }));
      }
      
      setEditingPlano(planoJson);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Preparar dados para salvar - converter strings de alimentos em arrays
      const planoParaSalvar = {
        ...editingPlano,
        tabela: editingPlano.tabela.map((refeicao: any) => ({
          ...refeicao,
          alimentos: typeof refeicao.alimentos === 'string' 
            ? refeicao.alimentos.split('\n').map((item: string) => item.trim()).filter((item: string) => item.length > 0)
            : Array.isArray(refeicao.alimentos) 
              ? refeicao.alimentos 
              : String(refeicao.alimentos || '').split(/\n|,|;/).filter((item: string) => item.trim())
        }))
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/plano/${params.id}/plano`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plano: planoParaSalvar })
      });
      
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new CustomEvent('auth:logout'));
          router.push('/login');
          return;
        }
        setError(data.error || 'Erro ao salvar alterações.');
      } else {
        // Atualizar o plano local
        setPlano(prev => prev ? { ...prev, plano: JSON.stringify(editingPlano) } : null);
        setIsEditing(false);
        setError('');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleRefeicaoChange = (index: number, field: string, value: string) => {
    if (!editingPlano || !editingPlano.tabela) return;
    
    const newTabela = [...editingPlano.tabela];
    newTabela[index] = { ...newTabela[index], [field]: value };
    
    setEditingPlano({
      ...editingPlano,
      tabela: newTabela
    });
  };

  const handleAlimentosChange = (index: number, value: string) => {
    if (!editingPlano || !editingPlano.tabela) return;
    
    const newTabela = [...editingPlano.tabela];
    // Manter a string original para exibição no textarea
    // Apenas converter para array quando necessário para salvar
    newTabela[index] = { ...newTabela[index], alimentos: value };
    
    setEditingPlano({
      ...editingPlano,
      tabela: newTabela
    });
  };

  const handleSecaoChange = (campo: string, value: string) => {
    if (!editingPlano) return;
    
    setEditingPlano({
      ...editingPlano,
      [campo]: value
    });
  };

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
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            ) : (
              <>
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
                  onClick={handleEditClick}
                >
                  Editar Plano
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/painel')}
                >
                  Voltar ao Painel
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.plano}>
          {/* Resumo Nutricional */}
          {editingPlano && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Resumo Nutricional</h2>
              {isEditing ? (
                <textarea
                  value={editingPlano.resumo || ''}
                  onChange={(e) => handleSecaoChange('resumo', e.target.value)}
                  className={styles.editTextarea}
                  placeholder="Resumo nutricional do plano..."
                  rows={8}
                />
              ) : (
                editingPlano.resumo ? (
                  <div className={styles.planoTexto}>{editingPlano.resumo}</div>
                ) : (
                  <div className={styles.planoTexto} style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Nenhum resumo nutricional registrado.
                  </div>
                )
              )}
            </section>
          )}
          
          {/* Plano Alimentar do Dia - Cards por refeição */}
          {editingPlano && Array.isArray(editingPlano.tabela) && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Plano Alimentar do Dia</h2>
              <div className={styles.refeicoesGrid}>
                {editingPlano.tabela.map((row: any, i: number) => (
                  <div key={i} className={styles.cardRefeicao}>
                    <div className={styles.headerRefeicao}>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={row.refeicao || ''}
                            onChange={(e) => handleRefeicaoChange(i, 'refeicao', e.target.value)}
                            className={styles.editInput}
                            placeholder="Nome da refeição"
                          />
                          <input
                            type="time"
                            value={row.horario || ''}
                            onChange={(e) => handleRefeicaoChange(i, 'horario', e.target.value)}
                            className={styles.editTimeInput}
                          />
                        </>
                      ) : (
                        <>
                          <h3 className={styles.nomeRefeicao}>{row.refeicao}</h3>
                          {row.horario && (
                            <span className={styles.horarioRefeicao}>🕐 {row.horario}</span>
                          )}
                        </>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <textarea
                        value={typeof row.alimentos === 'string' ? row.alimentos : 
                               Array.isArray(row.alimentos) ? row.alimentos.join('\n') : 
                               String(row.alimentos || '')}
                        onChange={(e) => handleAlimentosChange(i, e.target.value)}
                        className={styles.editTextarea}
                        placeholder="Lista de alimentos (um por linha)"
                        rows={6}
                        onKeyDown={(e) => {
                          // Permitir Enter para nova linha
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const textarea = e.target as HTMLTextAreaElement;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const value = textarea.value;
                            const newValue = value.substring(0, start) + '\n' + value.substring(end);
                            textarea.value = newValue;
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                            handleAlimentosChange(i, newValue);
                          }
                        }}
                      />
                    ) : (
                      <ul className={styles.listaAlimentos}>
                        {Array.isArray(row.alimentos)
                          ? row.alimentos.map((item: string, idx: number) => (
                              <li key={idx}>{item.trim()}</li>
                            ))
                          : String(row.alimentos).split(/\n|,|;/).map((item: string, idx: number) => (
                              <li key={idx}>{item.trim()}</li>
                            ))}
                      </ul>
                    )}
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.observacoes || ''}
                        onChange={(e) => handleRefeicaoChange(i, 'observacoes', e.target.value)}
                        className={styles.editInput}
                        placeholder="Observações (opcional)"
                      />
                    ) : (
                      row.observacoes && (
                        <div className={styles.obsRefeicao}><strong>Obs:</strong> {row.observacoes}</div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Recomendações Finais */}
          {editingPlano && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Recomendações Finais</h2>
              {isEditing ? (
                <textarea
                  value={editingPlano.recomendacoes || ''}
                  onChange={(e) => handleSecaoChange('recomendacoes', e.target.value)}
                  className={styles.editTextarea}
                  placeholder="Recomendações finais do plano..."
                  rows={8}
                />
              ) : (
                editingPlano.recomendacoes ? (
                  <div className={styles.planoTexto}>{editingPlano.recomendacoes}</div>
                ) : (
                  <div className={styles.planoTexto} style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Nenhuma recomendação final registrada.
                  </div>
                )
              )}
            </section>
          )}
          
          {/* Notas do Nutricionista */}
          {editingPlano && (
            <section className={styles.cardSecao}>
              <h2 className={styles.tituloSecao}>Notas do Nutricionista</h2>
              {isEditing ? (
                <textarea
                  value={editingPlano.notas || ''}
                  onChange={(e) => handleSecaoChange('notas', e.target.value)}
                  className={styles.editTextarea}
                  placeholder="Notas adicionais do nutricionista..."
                  rows={6}
                />
              ) : (
                editingPlano.notas ? (
                  <div className={styles.planoTexto}>{editingPlano.notas}</div>
                ) : (
                  <div className={styles.planoTexto} style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Nenhuma nota adicional registrada.
                  </div>
                )
              )}
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
