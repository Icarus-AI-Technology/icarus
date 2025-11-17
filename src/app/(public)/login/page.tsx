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
                <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M257.000000,107.000000 C257.000000,121.020897 257.000000,135.041794 256.647339,149.231964 C255.863922,150.228546 255.164307,151.018326 255.042892,151.888763 C253.268906,164.606110 248.900360,176.511963 242.932251,187.730682 C235.103165,202.447723 225.193298,215.523392 212.264069,226.433365 C194.853668,241.124649 175.211411,250.630356 152.969254,255.067642 C152.214386,255.218231 151.652069,256.334076 151.000000,257.000000 C136.979111,257.000000 122.958214,257.000000 108.768021,256.647339 C107.771454,255.863937 106.981689,255.164307 106.111275,255.042877 C93.393906,253.268967 81.488075,248.900284 70.269318,242.932251 C55.552212,235.103241 42.476593,225.193298 31.566628,212.264053 C16.875347,194.853653 7.369643,175.211411 2.932357,152.969269 C2.781760,152.214401 1.665923,151.652069 0.999999,151.000000 C1.000000,136.979111 1.000000,122.958214 1.352687,108.768021 C2.136079,107.771454 2.835672,106.981682 2.957086,106.111259 C4.731020,93.393890 9.099692,81.488052 15.067755,70.269310 C22.896828,55.552261 32.806664,42.476570 45.735928,31.566622 C63.146362,16.875374 82.788567,7.369641 105.030716,2.932356 C105.785606,2.781759 106.347923,1.665922 107.000000,0.999999 C121.020897,1.000000 135.041794,1.000000 149.231964,1.352689 C150.228546,2.136082 151.018341,2.835670 151.888763,2.957089 C164.606125,4.731055 176.512009,9.099652 187.730728,15.067761 C202.447739,22.896885 215.523468,32.806671 226.433395,45.735954 C241.124619,63.146408 250.630371,82.788582 255.067642,105.030716 C255.218246,105.785591 256.334076,106.347916 257.000000,107.000000 M28.994551,68.508713 C26.764997,72.760643 24.364655,76.932915 22.337486,81.279236 C15.903623,95.073631 12.733429,109.707436 12.093431,124.838356 C11.851275,130.563446 12.555466,136.342316 13.023306,142.080765 C13.961019,153.582596 16.933062,164.607834 21.625685,175.112747 C29.070221,191.778107 39.284138,206.378143 53.509899,218.127655 C63.675465,226.523697 74.593224,233.445602 86.966507,238.017838 C104.603615,244.535156 122.619576,247.671768 141.505814,245.079651 C153.876923,243.381744 165.888840,240.738190 177.207947,235.346115 C192.456436,228.082199 205.875656,218.546967 217.061157,205.651901 C226.097473,195.234497 233.115448,183.770798 237.953461,171.009888 C244.609619,153.453461 247.622726,135.393219 245.114304,116.485687 C243.554382,104.727753 240.994904,93.386642 236.156021,82.546928 C228.766541,65.993546 218.575378,51.627907 204.551315,39.929359 C194.417191,31.475714 183.461319,24.606115 171.113831,19.994417 C153.327835,13.351474 135.120941,10.409445 116.072296,12.901785 C104.635521,14.398184 93.520279,16.853813 83.028725,21.547386 C71.624992,26.649036 61.166363,33.186394 51.649517,41.528755 C42.812347,49.275318 35.685555,58.145027 28.994551,68.508713 z"/>
                  <path fill="currentColor" d="M74.151230,151.000000 C62.151562,151.013779 52.475487,145.181824 49.662235,135.315170 C46.295467,123.507210 54.142796,108.902596 66.475639,108.073662 C77.012947,107.365417 87.593941,107.255005 98.158791,107.027573 C104.977837,106.880791 111.802612,107.000000 119.590691,107.000000 C118.407967,105.041794 117.564316,103.609673 116.687042,102.198463 C112.362801,95.242325 111.275558,87.916550 115.226364,80.565872 C119.176064,73.217255 125.736977,69.679665 134.065063,70.050484 C142.036163,70.405411 147.148392,75.705170 151.753647,81.395676 C160.748077,92.509697 169.439804,103.870132 178.505890,114.924309 C186.476929,124.643303 187.851456,131.703064 179.021790,142.470840 C168.382141,155.445847 157.777100,168.449326 147.185150,181.463333 C142.010986,187.820679 131.334991,189.945770 123.986816,186.011765 C115.266800,181.343277 110.936684,172.099915 113.845306,163.701431 C115.334747,159.400757 117.386414,155.294800 119.227211,151.000000 C104.520699,151.000000 89.575813,151.000000 74.151230,151.000000 M129.223129,175.753265 C135.680893,177.736465 139.404770,173.763260 142.912903,169.415146 C145.046753,166.770370 147.048813,164.019699 149.157104,161.353790 C156.816116,151.669128 164.449402,141.963394 172.198029,132.350784 C174.166916,129.908249 173.978470,127.910255 172.102142,125.575485 C165.691360,117.598312 159.431625,109.499557 153.003479,101.536621 C148.087372,95.446732 143.455002,89.001633 137.745316,83.748215 C135.794479,81.953255 130.628036,82.379494 127.524216,83.473885 C124.493347,84.542549 123.110336,88.032974 124.953957,91.608093 C127.734665,97.000351 130.692795,102.308983 133.251083,107.804199 C134.275452,110.004555 135.671967,113.513466 134.712311,114.817665 C133.169540,116.914345 129.830063,118.778229 127.216560,118.823471 C108.240761,119.151962 89.256569,118.978645 70.275276,119.039726 C68.723595,119.044716 66.974380,119.252937 65.659607,119.983429 C61.363022,122.370651 59.033157,127.423721 60.111244,131.313507 C61.605846,136.706116 64.832367,138.998322 70.953079,138.999115 C89.768066,139.001541 108.585297,138.859741 127.395454,139.161102 C130.020340,139.203140 133.435226,140.811356 134.923904,142.839813 C135.900589,144.170670 134.508789,147.780579 133.407532,149.985077 C130.973663,154.857239 127.952286,159.431839 125.361885,164.231079 C123.071648,168.474228 124.322769,172.268616 129.223129,175.753265 z"/>
                  <path fill="currentColor" d="M209.000000,121.000000 C209.000000,138.499008 208.776871,155.501999 209.080856,172.495560 C209.273590,183.269928 199.323715,197.144699 187.000687,197.961487 C178.775208,198.506683 170.526428,198.808304 162.283676,198.937607 C158.381500,198.998856 155.177170,196.341446 155.325089,192.849762 C155.467499,189.487839 158.570557,186.992035 162.609573,186.997787 C169.109177,187.007050 175.636688,186.622391 182.101089,187.099518 C189.499603,187.645599 198.064438,180.421402 198.033798,171.166809 C197.940552,143.002106 197.964401,114.836815 198.023727,86.671936 C198.039581,79.149742 191.209808,70.165878 182.036026,70.906090 C175.909607,71.400414 169.710831,71.027809 163.544754,70.990341 C159.342865,70.964806 155.135345,68.004936 155.036530,65.097626 C154.938248,62.206032 159.190643,58.833363 163.346603,59.053654 C172.663666,59.547516 182.179321,59.328075 191.217560,61.257092 C201.771545,63.509609 208.998734,74.611412 208.999741,85.502220 C209.000824,97.168144 209.000000,108.834076 209.000000,121.000000 z"/>
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
