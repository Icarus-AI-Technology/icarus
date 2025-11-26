/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import '@/styles/globals.css'
import { Providers } from '@/components/providers/Providers'
import { metadata } from './metadata'

export { metadata }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="pt-BR" className="font-sans">
      <Providers>{children}</Providers>
    </div>
  )
}
