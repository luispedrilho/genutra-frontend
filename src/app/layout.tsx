import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Genutra - Plataforma de Nutrição Inteligente',
  description: 'Plataforma web para nutricionistas gerarem planos alimentares personalizados com inteligência artificial',
  keywords: 'nutrição, planos alimentares, IA, nutricionistas, saúde',
  authors: [{ name: 'Genutra Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
} 