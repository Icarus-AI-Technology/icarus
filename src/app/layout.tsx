import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'ICARUS v5.0 - ERP Moderno e Inteligente',
  description: 'Sistema ERP com IA integrada, design neumórfico e 58 módulos completos',
  keywords: 'ERP, IA, Gestão Empresarial, OraclusX, IcarusBrain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
