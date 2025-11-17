'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'
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
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao fazer login')
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setError(null)
      await signUp(data.email, data.password)
      setMode('login')
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao criar conta')
    }
  }

  const handleReset = async (data: { email: string }) => {
    try {
      setError(null)
      await resetPassword(data.email)
      setMode('login')
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao enviar email')
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
        <Card>
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
              <Input
                label="Email"
                type="email"
                {...loginForm.register('email')}
                error={loginForm.formState.errors.email?.message}
                placeholder="seu@email.com"
                required
                autoFocus
              />

              <Input
                label="Senha"
                type="password"
                {...loginForm.register('password')}
                error={loginForm.formState.errors.password?.message}
                placeholder="••••••••"
                required
              />

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
                loading={loginForm.formState.isSubmitting}
              >
                <LogIn className="w-5 h-5" />
                Entrar
              </Button>
            </form>
          )}

          {/* SignUp Form */}
          {mode === 'signup' && (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...signUpForm.register('email')}
                error={signUpForm.formState.errors.email?.message}
                placeholder="seu@email.com"
                required
                autoFocus
              />

              <Input
                label="Senha"
                type="password"
                {...signUpForm.register('password')}
                error={signUpForm.formState.errors.password?.message}
                placeholder="••••••••"
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                {...signUpForm.register('confirmPassword')}
                error={signUpForm.formState.errors.confirmPassword?.message}
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                className="w-full"
                loading={signUpForm.formState.isSubmitting}
              >
                <UserPlus className="w-5 h-5" />
                Criar Conta
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

              <Input
                label="Email"
                type="email"
                {...resetForm.register('email')}
                error={resetForm.formState.errors.email?.message}
                placeholder="seu@email.com"
                required
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setMode('login')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={resetForm.formState.isSubmitting}
                >
                  Enviar
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Demo Credentials (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-yellow-500/5 border-yellow-500/20">
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
