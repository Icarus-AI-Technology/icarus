import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
}

export function Loading({ text = 'Carregando...' }: LoadingProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" aria-hidden="true" />
      <p className="text-theme-muted">{text}</p>
    </div>
  )
}

export function LoadingOverlay({ text = 'Carregando...' }: LoadingProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
    >
      <div className="
        bg-gradient-to-br from-[#15192B] to-[#1A1F35]
        border border-white/10
        rounded-2xl
        p-8
        shadow-[0_20px_60px_rgba(0,0,0,0.8)]
      ">
        <div className="flex flex-col items-center gap-4" role="status" aria-busy="true">
          <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin" aria-hidden="true" />
          <p id="loading-title" className="text-white font-medium">{text}</p>
        </div>
      </div>
    </div>
  )
}
