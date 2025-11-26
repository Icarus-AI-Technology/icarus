import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useSupabase } from '@/hooks/useSupabase'
import { BrainCircuit, Eye, EyeOff, LogIn, Mail, Lock, Loader2, ChevronLeft } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Autenticação via Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data?.user) {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err instanceof Error
          ? err.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos. Verifique suas credenciais.'
            : err.message
          : 'Não foi possível iniciar a sessão. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0D16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1] rounded-full opacity-15 blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2DD4BF] rounded-full opacity-12 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card - Neumorphic Glass Effect */}
        <div className="bg-[#15192B] backdrop-blur-xl rounded-3xl p-8 neu-card relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-[#2DD4BF]/5 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div 
                className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4"
                style={{ 
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #2DD4BF)',
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <BrainCircuit className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-white mb-2 text-3xl font-bold">Icarus v5.0</h1>
              <p className="text-[#94A3B8] text-sm">Gestão elevada pela IA</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444] neu-pressed">
                  {error}
                </div>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#94A3B8]" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#94A3B8]" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 pr-14 rounded-xl bg-[#1A1F35] text-white placeholder-[#64748B] neu-pressed focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-sm text-[#94A3B8]">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  className="text-[#818CF8] hover:text-[#6366F1] text-sm font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl btn-gradient text-white font-medium text-base disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="animate-spin w-5 h-5" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <LogIn className="w-5 h-5" />
                    Entrar no Sistema
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[#1A1F35] text-center">
              <p className="text-[#94A3B8] text-xs">
                © 2025{' '}
                <span className="text-[#818CF8] font-medium">IcarusAI Technology</span>
              </p>
              <p className="text-[#64748B] mt-1 text-xs">
                Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#94A3B8] hover:text-white text-sm transition-colors inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  )
}
