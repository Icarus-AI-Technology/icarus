import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BrainCircuit, Shield, Sparkles, Eye, EyeOff, LogIn, Mail, Lock, Loader2, ChevronLeft } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loginTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // TODO: Implement Supabase authentication
      // Placeholder for now - redirects to dashboard
      loginTimeout.current = setTimeout(() => {
        setLoading(false)
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar a sessão. Tente novamente.'
      )
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (loginTimeout.current) {
        clearTimeout(loginTimeout.current)
      }
    }
  }, [])

  const handleQuickAccess = (_role: 'admin' | 'analista') => {
    // Development quick access
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full opacity-10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full opacity-10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card - Neumorphic Glass Effect */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border neu-soft relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg shadow-primary/30 neu-soft">
                <BrainCircuit className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-foreground mb-2 text-3xl font-bold">Icarus v5.0</h1>
              <p className="text-muted-foreground text-sm">Gestão elevada pela IA</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {/* Email Input */}
              <div className="form-row">
                <label htmlFor="email" className="text-foreground text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="neu-input"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="form-row">
                <label htmlFor="password" className="text-foreground text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="neu-input pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="neu-checkbox" />
                  <span className="text-sm text-muted-foreground">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white h-12 rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 font-medium text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Entrar no Sistema
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Acesso rápido</span>
              </div>
            </div>

            {/* Development Quick Access */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('admin')}
                className="bg-card border-border text-foreground hover:bg-muted hover:border-primary/50 rounded-xl h-11 neu-soft transition-all duration-300"
              >
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('analista')}
                className="bg-card border-border text-foreground hover:bg-muted hover:border-primary/50 rounded-xl h-11 neu-soft transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                Analista
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-xs">
                © 2025{' '}
                <span className="text-primary font-medium">IcarusAI Technology</span>
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  )
}
