"use client";
import styles from './page.module.css'
import { Button } from '@/components/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.logoBox}>
            <Image
              src="/logo_completa.png"
              alt="Genutra Logo"
              width={120}
              height={120}
              className={styles.logo}
              priority
            />
          </div>
          <h1 className={styles.title}>
            Plataforma de Nutrição Inteligente
          </h1>
          <p className={styles.description}>
            Gere planos alimentares personalizados com inteligência artificial
          </p>
          <div className={styles.buttons}>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/login')}
            >
              Começar Agora
            </Button>
            <Button variant="secondary" size="md" className={styles.secondaryButton}>
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
} 