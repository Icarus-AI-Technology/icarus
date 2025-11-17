import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implementar autenticação real com Supabase
      // Simulando delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao fazer login:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAccess = (role: 'admin' | 'analyst') => {
    // Acesso rápido para desenvolvimento
    setEmail(`${role}@newortho.com.br`)
    setPassword('********')
    setTimeout(() => {
      navigate('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

      <div className="relative w-full max-w-md">
        {/* Neomorphic Card */}
        <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Gradient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 via-transparent to-[#8B5CF6]/10 opacity-50" />

          <div className="relative p-8 sm:p-12">
            {/* Logo & Brand */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mb-4 shadow-lg shadow-[#6366F1]/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Icarus v5.0</h1>
              <p className="text-[#94A3B8] text-center">Gestão elevada pela IA</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#E2E8F0]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@newortho.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 bg-[#0F172A]/50 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#6366F1] focus:ring-[#6366F1] rounded-xl"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#E2E8F0]">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-[#0F172A]/50 border-white/10 text-white placeholder:text-[#64748B] focus:border-[#6366F1] focus:ring-[#6366F1] rounded-xl"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white font-semibold rounded-xl shadow-lg shadow-[#6366F1]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#6366F1]/40"
              >
                {isLoading ? (
                  'Entrando...'
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>

            {/* Development Quick Access */}
            <div className="mt-8">
              <p className="text-xs text-[#64748B] text-center mb-3">
                Acesso rápido (desenvolvimento)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAccess('admin')}
                  className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-[#6366F1] rounded-xl transition-all"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAccess('analyst')}
                  className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-[#6366F1] rounded-xl transition-all"
                >
                  Analista
                </Button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-[#94A3B8] hover:text-[#6366F1] transition-colors underline"
              >
                Esqueceu sua senha?
              </a>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-[#64748B] text-center">
                © 2025{' '}
                <span className="text-[#6366F1] font-semibold">IcarusAI Technology</span>
                <br />
                Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            ← Voltar para página inicial
          </button>
        </div>
      </div>
    </div>
  )
}

