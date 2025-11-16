import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <header className="border-b border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">ICARUS v5.0</h1>
              <p className="text-xs text-gray-400">ERP Inteligente</p>
            </div>
          </Link>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{user.email}</span>
            </div>

            {/* Logout Button */}
            <Button
              variant="secondary"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
