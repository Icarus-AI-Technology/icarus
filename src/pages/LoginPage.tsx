import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, LogIn, Zap } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement Supabase authentication
    // Placeholder for now - redirects to dashboard
    setTimeout(() => {
      navigate('/dashboard')
    }, 1000)
  }

  const handleQuickAccess = (_role: 'admin' | 'analista') => {
    // Development quick access
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1f4d] via-[#2d3a7d] to-[#3d4f9d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-gradient-to-br from-[#2a3568]/90 to-[#3d4f9d]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 mb-4">
              <Brain className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
 <h1 className="text-white mb-2" style={{ fontSize: '1.875rem', fontWeight: 700 }}>Icarus v5.0</h1>  <p className="text-white/70" style={{ fontSize: '0.875rem' }}>Gestão elevada pela IA</p>           </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
 <Label htmlFor="email" className="text-white" style={{ fontSize: '0.875rem', fontWeight: 500 }}>                 Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#6366F1] focus:ring-[#6366F1] h-12 rounded-xl"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
 <Label htmlFor="password" className="text-white" style={{ fontSize: '0.875rem', fontWeight: 500 }}>                 Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#6366F1] focus:ring-[#6366F1] h-12 rounded-xl"
                required
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
 className="w-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#5558E3] hover:to-[#4338CA] text-white h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50" style={{ fontWeight: 500 }}             >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>

          {/* Development Quick Access */}
          <div className="mt-8 pt-6 border-t border-white/10">
 <p className="text-white/50 text-center mb-4" style={{ fontSize: '0.75rem' }}>               Acesso rápido (desenvolvimento)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('admin')}
 className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-lg h-10" style={{ fontSize: '0.875rem' }}               >
                Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('analista')}
 className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-lg h-10" style={{ fontSize: '0.875rem' }}               >
                Analista
              </Button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="mt-6 text-center">
            <button
              type="button"
 className="text-white/70 hover:text-white underline underline-offset-4 transition-colors" style={{ fontSize: '0.875rem' }}             >
              Esqueceu sua senha?
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
 <p className="text-white/40" style={{ fontSize: '0.75rem' }}>               © 2025{' '}
 <span className="text-[#6366F1]" style={{ fontWeight: 500 }}>IcarusAI Technology</span>             </p>
 <p className="text-white/30 mt-1" style={{ fontSize: '0.75rem' }}>               Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
 <div className="inline-flex items-center gap-2 text-white/60" style={{ fontSize: '0.875rem' }}>             <Zap className="w-4 h-4 text-[#6366F1]" />
            <span>Powered by AI • Seguro • Rápido</span>
          </div>
        </div>
      </div>
    </div>
  )
}

