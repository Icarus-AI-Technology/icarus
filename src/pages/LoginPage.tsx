import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, LogIn } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a1f4d] via-[#2d3a7d] to-[#3d4f9d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-[#2a3568]/90 to-[#3d4f9d]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 mb-4">
              <Brain className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-white mb-2" style={{ fontSize: '1.875rem', fontWeight: 700 }}>Icarus v5.0</h1>
            <p className="text-white/70" style={{ fontSize: '0.875rem' }}>Gestão elevada pela IA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4dd4d4] to-[#5b7af5] text-white h-12 rounded-xl"
              style={{ fontWeight: 500 }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/40" style={{ fontSize: '0.75rem' }}>
              © 2025 <span className="text-[#4dd4d4]" style={{ fontWeight: 500 }}>IcarusAI Technology</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

