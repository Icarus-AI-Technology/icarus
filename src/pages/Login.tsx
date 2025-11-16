import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LogIn, UserPlus, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

const signUpSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp, resetPassword } = useAuth()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const resetForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({ email: z.string().email('Email inválido') })),
  })

  const handleLogin = async (data: LoginFormData) => {
    try {
      setError(null)
      await signIn(data.email, data.password)
      // Navigation is handled by AuthContext
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setError(null)
      await signUp(data.email, data.password)
      setMode('login')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
    }
  }

  const handleReset = async (data: { email: string }) => {
    try {
      setError(null)
      await resetPassword(data.email)
      setMode('login')
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Logo / Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            ICARUS v5.0
          </h1>
          <p className="text-gray-400">
            ERP Moderno, Inteligente e Neumórfico
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 mb-6">
            <button
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              className={`
                px-4 py-2 font-medium transition-colors
                ${mode === 'login'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Entrar
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setError(null)
              }}
              className={`
                px-4 py-2 font-medium transition-colors
                ${mode === 'signup'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Cadastrar
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  {...loginForm.register('email')}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  {...loginForm.register('password')}
                  placeholder="••••••••"
                  required
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  'Entrando...'
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          )}

          {/* SignUp Form */}
          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  {...signUpForm.register('email')}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  {...signUpForm.register('password')}
                  placeholder="••••••••"
                  required
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Senha
                </label>
                <Input
                  type="password"
                  {...signUpForm.register('confirmPassword')}
                  placeholder="••••••••"
                  required
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? (
                  'Criando conta...'
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Você receberá um email de confirmação
              </p>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
              <div className="mb-4">
                <Lock className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                <h3 className="text-lg font-semibold text-gray-100 text-center">
                  Recuperar Senha
                </h3>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Digite seu email para receber um link de recuperação
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  {...resetForm.register('email')}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
                {resetForm.formState.errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('login')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={resetForm.formState.isSubmitting}
                >
                  {resetForm.formState.isSubmitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Demo Credentials (Development only) */}
        {import.meta.env.DEV && (
          <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
            <h4 className="text-yellow-400 font-medium text-sm mb-2">
              🔧 Modo Desenvolvimento
            </h4>
            <p className="text-yellow-300 text-xs">
              Crie uma conta ou use as credenciais após registro
            </p>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          © 2025 ICARUS v5.0 - Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
