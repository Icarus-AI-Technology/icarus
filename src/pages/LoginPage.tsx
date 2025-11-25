import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Brain, Zap, Shield, Sparkles, Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
                <Brain className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-foreground mb-2 text-3xl font-bold">Icarus v5.0</h1>
              <p className="text-muted-foreground text-sm">Gestão elevada pela IA</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="form-row">
                <label htmlFor="email" className="text-foreground text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
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
                  <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
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
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
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

        {/* Feature Badges - Neumorphic */}
        <div className="mt-6 flex justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border text-sm text-muted-foreground neu-soft">
            <Zap className="w-4 h-4 text-primary" />
            <span>Powered by AI</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border text-sm text-muted-foreground neu-soft">
            <Shield className="w-4 h-4 text-success" />
            <span>Seguro</span>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  )
}
