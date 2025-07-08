"use client";
import styles from './NavBar.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/useAuth';

export function NavBar({ showBack = true, showHome = true }) {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.logoBox} onClick={() => router.push('/painel')} title="Ir para o Painel" style={{ cursor: 'pointer' }}>
          <Image src="/logo_completa.png" alt="Genutra Logo" width={80} height={48} className={styles.logo} priority />
        </div>
        {showBack && (
          <button className={styles.navBtn} onClick={() => router.back()}>
            ← Voltar
          </button>
        )}
      </div>
      <div className={styles.right}>
        {showHome && (
          <button className={styles.navBtn} onClick={() => router.push('/painel')}>
            🏠 Home
          </button>
        )}
        {isLoggedIn && (
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Sair
          </button>
        )}
      </div>
    </nav>
  );
} 