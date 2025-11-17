'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'
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
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      setError(null)
      await signUp(data.email, data.password)
      setMode('login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    }
  }

  const handleReset = async (data: { email: string }) => {
    try {
      setError(null)
      await resetPassword(data.email)
      setMode('login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1a1f4d] to-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Logo / Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366F1] to-indigo-700 flex items-center justify-center shadow-lg shadow-[#6366F1]/50">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            ICARUS v5.0
          </h1>
          <p className="text-gray-300">
            ERP Moderno, Inteligente e Neumórfico
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
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
                  ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
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
                  ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
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
                  className="text-sm text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loginForm.formState.isSubmitting}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Entrar no Sistema
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
                <Lock className="w-12 h-12 mx-auto text-[#6366F1] mb-2" />
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
        </div>

        {/* Demo Credentials (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-500/5 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 shadow-xl">
            <h4 className="text-yellow-400 font-medium text-sm mb-2">
              🔧 Modo Desenvolvimento
            </h4>
            <p className="text-yellow-300 text-xs">
              Crie uma conta ou use as credenciais após registro
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          © 2025 ICARUS v5.0 - Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
