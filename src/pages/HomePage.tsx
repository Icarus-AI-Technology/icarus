import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ContactForm } from '@/components/landing/ContactForm'
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel'
import { useCountUp } from '@/hooks/useCountUp'
import { useFadeIn } from '@/hooks/useFadeIn'
import {
  Brain,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Target,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Bot,
  Clock,
  Award,
  HeadphonesIcon,
  Play,
} from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'IA Integrada',
      description:
        'Previsão de demanda, análise de inadimplência e recomendações inteligentes em tempo real.',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description:
        'Visualize seus KPIs mais importantes em tempo real com análises preditivas.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Zap,
      title: 'Automação Total',
      description:
        'Automatize processos repetitivos e ganhe até 70% de produtividade.',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description:
        'Dados criptografados, backup automático e conformidade com LGPD.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Target,
      title: 'Especializado em OPME',
      description:
        'Desenvolvido especificamente para gestão de Órteses, Próteses e Materiais Especiais.',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: TrendingUp,
      title: 'ROI Comprovado',
      description:
        'Clientes reportam redução de custos de até 45% nos primeiros 6 meses.',
      color: 'from-indigo-500 to-purple-600',
    },
  ]

  const benefits = [
    {
      icon: Clock,
      title: 'Economia de Tempo',
      description: 'Reduza em até 70% o tempo gasto em tarefas administrativas',
      stat: 70,
      suffix: '%',
    },
    {
      icon: TrendingUp,
      title: 'Aumento de Receita',
      description: 'Aumente suas vendas com análises preditivas e insights',
      stat: 45,
      prefix: '+',
      suffix: '%',
    },
    {
      icon: Users,
      title: 'Satisfação do Cliente',
      description: 'Melhore o atendimento com acesso rápido a informações',
      stat: 98,
      suffix: '%',
    },
    {
      icon: Award,
      title: 'Conformidade',
      description: '100% em conformidade com regulamentações e normas',
      stat: 100,
      suffix: '%',
    },
  ]

  const painPoints = [
    'Dificuldade em rastrear estoque de materiais OPME',
    'Processos manuais e demorados',
    'Falta de visibilidade sobre métricas importantes',
    'Problemas de integração com hospitais',
    'Gestão de cirurgias complexa',
    'Relatórios financeiros demorados',
  ]

  const differentials = [
    {
      icon: Bot,
      title: 'IcarusBrain',
      description:
        'Motor de IA proprietário que aprende com seus dados e oferece insights personalizados.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte 24/7',
      description:
        'Equipe especializada disponível 24 horas por dia, 7 dias por semana.',
    },
    {
      icon: Sparkles,
      title: 'OraclusX Design System',
      description:
        'Interface moderna e intuitiva com design neumórfico que encanta usuários.',
    },
    {
      icon: Shield,
      title: 'Infraestrutura Supabase',
      description:
        'Banco de dados PostgreSQL escalável e seguro com backup automático.',
    },
  ]

  // Fade-in hooks for sections
  const heroFade = useFadeIn({ threshold: 0.1 })
  const painPointsFade = useFadeIn({ threshold: 0.2, delay: 100 })
  const featuresFade = useFadeIn({ threshold: 0.2, delay: 150 })
  const benefitsFade = useFadeIn({ threshold: 0.2, delay: 200 })
  const testimonialsFade = useFadeIn({ threshold: 0.2, delay: 100 })
  const ctaFade = useFadeIn({ threshold: 0.3 })

  return (
    <div className="min-h-screen bg-[#0F172A] relative overflow-hidden">
      {/* Animated background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366F1] rounded-full opacity-10 blur-[120px] animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-[120px] animate-pulse"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E293B]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366F1] to-indigo-700 flex items-center justify-center shadow-lg shadow-[#6366F1]/50">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white" style={{ fontSize: '1.125rem', fontWeight: 700 }}>Icarus v5.0</h1>
                <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>Gestão elevada pela IA</p>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={() => navigate('/login')}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/40 transition-all duration-300"
            >
              Entrar no Sistema
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroFade.ref}
        className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1a1f4d] relative transition-all duration-1000 ${
          heroFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366F1]/20 text-indigo-300 border border-[#6366F1]/30 animate-pulse" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                <Sparkles className="w-4 h-4" />
                <span>ERP Enterprise com Inteligência Artificial</span>
              </div>

              <h1 className="text-white leading-tight" style={{ fontSize: 'clamp(3rem, 5vw, 3.75rem)', fontWeight: 700 }}>
                Transforme sua
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-indigo-400 to-purple-500 animate-gradient">
                  {' '}
                  Gestão OPME{' '}
                </span>
                com IA
              </h1>

              <p className="text-gray-300 leading-relaxed" style={{ fontSize: '1.25rem' }}>
                Sistema ERP completo especializado em OPME, com <strong className="text-white">58 módulos</strong> integrados,{' '}
                <strong className="text-white">inteligência artificial</strong> e design moderno. Gerencie cirurgias, estoque,
                financeiro e muito mais em uma única plataforma.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    const contactSection = document.getElementById('contato')
                    contactSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-8 py-6 bg-gradient-to-r from-[#6366F1] to-indigo-700 hover:from-[#4F46E5] hover:to-indigo-800 text-white shadow-xl shadow-[#6366F1]/40 hover:shadow-2xl hover:shadow-[#6366F1]/50 hover:scale-105 transition-all duration-300"
                  style={{ fontSize: '1.125rem' }}
                >
                  Solicitar Demonstração
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="px-8 py-6 border-2 border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                  style={{ fontSize: '1.125rem' }}
                >
                  Já sou cliente
                </Button>
              </div>

              {/* Trust Indicators with Animated Counters */}
              <div className="flex items-center gap-8 pt-4">
                <AnimatedStat value={500} suffix="+" label="Empresas Atendidas" />
                <AnimatedStat value={98} suffix="%" label="Satisfação" />
                <AnimatedStat value={24} suffix="/7" label="Suporte" />
              </div>
            </div>

            {/* Visual Content with Glow Effect */}
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#6366F1]/20 via-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 relative overflow-hidden">
                  <Brain className="w-32 h-32 text-[#6366F1] animate-pulse relative z-10" />

                  {/* Animated rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#6366F1]/30 rounded-full animate-ping" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-[#6366F1]/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>+45%</p>
                    <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>ROI</p>
                  </div>
                </div>
              </div>

              {/* Demo Video Button */}
              <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group/play">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6366F1]/80 flex items-center justify-center group-hover/play:bg-[#6366F1] transition-colors">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-white" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ver Demo</p>
                    <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>2 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section
        ref={painPointsFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#1E293B] transition-all duration-1000 delay-100 ${
          painPointsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
              Problemas que Resolvemos
            </h2>
            <p className="text-gray-300" style={{ fontSize: '1.25rem' }}>
              Acabamos com as dores de cabeça da gestão OPME
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((pain, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#6366F1]/50 hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-red-500/30">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-gray-400 line-through decoration-red-500 decoration-2">
                    {pain}
                  </p>
                  <p className="text-green-400 mt-2" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    ✓ Resolvido com Icarus
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F172A] to-[#1a1f4d] transition-all duration-1000 delay-150 ${
          featuresFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
              Funcionalidades Poderosas
            </h2>
            <p className="text-gray-300" style={{ fontSize: '1.25rem' }}>
              Tudo que você precisa em um único sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:scale-105 hover:border-[#6366F1]/50 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white mb-3" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section with Animated Counters */}
      <section
        ref={benefitsFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#1E293B] transition-all duration-1000 delay-200 ${
          benefitsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
              Resultados Reais
            </h2>
            <p className="text-gray-300" style={{ fontSize: '1.25rem' }}>
              Veja o impacto que o Icarus pode ter no seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <BenefitCard
                  key={index}
                  icon={Icon}
                  title={benefit.title}
                  description={benefit.description}
                  stat={benefit.stat}
                  prefix={benefit.prefix}
                  suffix={benefit.suffix}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F172A] to-[#1a1f4d] transition-all duration-1000 delay-100 ${
          testimonialsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-gray-300" style={{ fontSize: '1.25rem' }}>
              Depoimentos reais de quem usa o Icarus diariamente
            </p>
          </div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#6366F1] to-purple-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>Por que Escolher o Icarus?</h2>
            <p className="text-indigo-100" style={{ fontSize: '1.25rem' }}>
              Diferenciais que fazem a diferença
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentials.map((diff, index) => {
              const Icon = diff.icon
              return (
                <div
                  key={index}
                  className="flex gap-6 p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{diff.title}</h3>
                    <p className="text-indigo-100 leading-relaxed">
                      {diff.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] transition-all duration-1000 ${
          ctaFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white mb-6" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
            Pronto para Transformar sua Gestão?
          </h2>
          <p className="text-gray-300 mb-8" style={{ fontSize: '1.25rem' }}>
            Junte-se a centenas de empresas que já estão elevando sua gestão com IA
          </p>
          <div className="flex items-center justify-center gap-6 mb-12 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-gray-300">Sem permanência mínima</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-gray-300">Demonstração gratuita</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-gray-300">Suporte incluído</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1E293B]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
              Solicite uma Demonstração
            </h2>
            <p className="text-gray-300" style={{ fontSize: '1.25rem' }}>
              Preencha o formulário e nossa equipe entrará em contato
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366F1] to-indigo-700 flex items-center justify-center shadow-lg shadow-[#6366F1]/50">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ fontSize: '1.125rem', fontWeight: 700 }}>Icarus v5.0</h3>
                  <p className="text-gray-400" style={{ fontSize: '0.875rem' }}>Gestão elevada pela IA</p>
                </div>
              </div>
              <p className="text-gray-400" style={{ fontSize: '0.875rem' }}>
                Sistema ERP Enterprise especializado em OPME, com inteligência
                artificial integrada.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-white" style={{ fontWeight: 600 }}>Contato</h4>
              <ul className="space-y-2 text-gray-400" style={{ fontSize: '0.875rem' }}>
                <li>dax@newortho.com.br</li>
                <li>Suporte 24/7 disponível</li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="mb-4 text-white" style={{ fontWeight: 600 }}>Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400" style={{ fontSize: '0.875rem' }}>
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="hover:text-white transition-colors"
                  >
                    Entrar no Sistema
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const contactSection = document.getElementById('contato')
                      contactSection?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Solicitar Demonstração
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-gray-400" style={{ fontSize: '0.875rem' }}>
            <p>© 2025 IcarusAI Technology. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}

// Animated Stat Component
function AnimatedStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCountUp({ end: value, duration: 2000 })

  return (
    <div ref={ref}>
      <p className="text-white" style={{ fontSize: '1.875rem', fontWeight: 700 }}>
        {count}{suffix}
      </p>
      <p className="text-gray-400" style={{ fontSize: '0.875rem' }}>{label}</p>
    </div>
  )
}

// Benefit Card Component with Counter
function BenefitCard({
  icon: Icon,
  title,
  description,
  stat,
  prefix = '',
  suffix = '',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  stat: number
  prefix?: string
  suffix?: string
}) {
  const { count, ref } = useCountUp({ end: stat, duration: 2500 })

  return (
    <div
      ref={ref}
      className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:scale-105 hover:border-[#6366F1]/50 transition-all duration-300 group"
    >
      <div className="w-16 h-16 rounded-full bg-[#6366F1]/20 flex items-center justify-center mx-auto mb-6 border border-[#6366F1]/30 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-[#6366F1]" />
      </div>
      <p className="text-[#6366F1] mb-3" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
        {prefix}{count}{suffix}
      </p>
      <h3 className="text-white mb-2" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
        {title}
      </h3>
      <p className="text-gray-400" style={{ fontSize: '0.875rem' }}>{description}</p>
    </div>
  )
}
