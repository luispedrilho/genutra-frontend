import React from 'react';
import { Button } from './Button';
import styles from '@/app/painel/painel.module.css';

interface PlanoCardProps {
  plano: {
    id: string;
    paciente: string;
    objetivo: string;
    data: string;
  };
  onVisualizar: (id: string) => void;
  onEditar?: (id: string) => void;
}

export const PlanoCard: React.FC<PlanoCardProps> = ({ plano, onVisualizar, onEditar }) => {
  return (
    <div className={styles.recentCard}>
      <div className={styles.recentCardHeader}>
        <div className={styles.recentCardInfo}>
          <h4 className={styles.recentCardTitle}>{plano.paciente}</h4>
          <p className={styles.recentCardObjective}>{plano.objetivo}</p>
        </div>
        <div className={styles.recentCardDate}>
          {new Date(plano.data).toLocaleDateString('pt-BR')}
        </div>
      </div>
      <div className={styles.recentCardActions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onVisualizar(plano.id)}
        >
          Visualizar
        </Button>
        {onEditar && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEditar(plano.id)}
          >
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}; 