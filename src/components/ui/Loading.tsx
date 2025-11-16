import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
}

export function Loading({ text = 'Carregando...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      <p className="text-gray-400">{text}</p>
    </div>
  )
}

export function LoadingOverlay({ text = 'Carregando...' }: LoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="
        bg-gradient-to-br from-gray-900 to-gray-800
        border border-white/10
        rounded-2xl
        p-8
        shadow-[0_20px_60px_rgba(0,0,0,0.8)]
      ">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <p className="text-gray-100 font-medium">{text}</p>
        </div>
      </div>
    </div>
  )
}
