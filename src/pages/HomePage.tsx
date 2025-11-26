import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ContactForm } from '@/components/landing/ContactForm'
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel'
import { useCountUp } from '@/hooks/useCountUp'
import { useFadeIn } from '@/hooks/useFadeIn'
import {
  BrainCircuit,
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
  LogIn,
} from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => {
      // Keep dark mode when leaving (optional cleanup)
    }
  }, [])

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: BrainCircuit,
      title: 'IA Integrada',
      description:
        'Previsão de demanda, análise de inadimplência e recomendações inteligentes em tempo real.',
      gradientFrom: '#6366F1',
      gradientTo: '#2DD4BF',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description:
        'Visualize seus KPIs mais importantes em tempo real com análises preditivas.',
      gradientFrom: '#3B82F6',
      gradientTo: '#6366F1',
    },
    {
      icon: Zap,
      title: 'Automação Total',
      description:
        'Automatize processos repetitivos e ganhe até 70% de produtividade.',
      gradientFrom: '#F59E0B',
      gradientTo: '#EF4444',
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description:
        'Dados criptografados, backup automático e conformidade com LGPD.',
      gradientFrom: '#10B981',
      gradientTo: '#2DD4BF',
    },
    {
      icon: Target,
      title: 'Especializado em OPME',
      description:
        'Desenvolvido especificamente para gestão de Órteses, Próteses e Materiais Especiais.',
      gradientFrom: '#EF4444',
      gradientTo: '#F59E0B',
    },
    {
      icon: TrendingUp,
      title: 'ROI Comprovado',
      description:
        'Clientes reportam redução de custos de até 45% nos primeiros 6 meses.',
      gradientFrom: '#2DD4BF',
      gradientTo: '#6366F1',
    },
  ]

  const benefits = [
    {
      icon: Clock,
      title: 'Economia de Tempo',
      description: 'Reduza em até 70% o tempo gasto em tarefas administrativas',
      stat: 70,
      suffix: '%',
      iconColor: '#6366F1', // Indigo
    },
    {
      icon: TrendingUp,
      title: 'Aumento de Receita',
      description: 'Aumente suas vendas com análises preditivas e insights',
      stat: 45,
      prefix: '+',
      suffix: '%',
      iconColor: '#2DD4BF', // Teal
    },
    {
      icon: Users,
      title: 'Satisfação do Cliente',
      description: 'Melhore o atendimento com acesso rápido a informações',
      stat: 98,
      suffix: '%',
      iconColor: '#8B5CF6', // Purple
    },
    {
      icon: Award,
      title: 'Conformidade',
      description: '100% em conformidade com regulamentações e normas',
      stat: 100,
      suffix: '%',
      iconColor: '#3B82F6', // Blue
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
      gradientFrom: '#6366F1',
      gradientTo: '#8B5CF6',
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte 24/7',
      description:
        'Equipe especializada disponível 24 horas por dia, 7 dias por semana.',
      gradientFrom: '#2DD4BF',
      gradientTo: '#10B981',
    },
    {
      icon: Sparkles,
      title: 'Dark Glass Medical',
      description:
        'Interface moderna e intuitiva com design neumórfico que encanta usuários.',
      gradientFrom: '#8B5CF6',
      gradientTo: '#6366F1',
    },
    {
      icon: Shield,
      title: 'Infraestrutura Supabase',
      description:
        'Banco de dados PostgreSQL escalável e seguro com backup automático.',
      gradientFrom: '#3B82F6',
      gradientTo: '#2DD4BF',
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
    <div className="min-h-screen bg-[#0B0D16] relative overflow-hidden" data-orx-ignore="true">
      {/* Animated background glow - Dark Glass Style */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366F1] rounded-full opacity-15 blur-[150px] animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#2DD4BF] rounded-full opacity-12 blur-[150px] animate-pulse"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            animationDelay: '1s',
          }}
        />
      </div>

      {/* Header / Navbar - Neumorphic Glass (SEM borda) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#15192B]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo com Gradiente */}
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #2DD4BF)',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
                }}
              >
                <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-foreground font-bold text-lg">Icarus v5.0</h1>
                <p className="text-muted-foreground text-xs">Gestão elevada pela IA</p>
              </div>
            </div>

            {/* Login Button com Gradiente 3D */}
            <Button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#2DD4BF] hover:from-[#818CF8] hover:via-[#A78BFA] hover:to-[#5EEAD4] text-white shadow-[0_6px_20px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_30px_rgba(99,102,241,0.5)] hover:translate-y-[-2px] transition-all duration-300"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar no Sistema
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroFade.ref}
        className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16] relative transition-all duration-1000 ${
          heroFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#15192B] text-[#818CF8] animate-pulse text-sm font-medium neu-elevated">
                <Sparkles className="w-4 h-4" />
                <span>ERP Enterprise com Inteligência Artificial</span>
              </div>

              <h1 className="text-white leading-tight text-5xl lg:text-6xl font-bold">
                Transforme sua
                <span className="text-gradient-hero inline-block mx-2">
                  Gestão OPME
                </span>
                com IA
              </h1>

              <p className="text-muted-foreground leading-relaxed text-xl">
                Sistema ERP completo especializado em OPME, com <strong className="text-foreground">58 módulos</strong> integrados,{' '}
                <strong className="text-foreground">inteligência artificial</strong> e design moderno. Gerencie cirurgias, estoque,
                financeiro e muito mais em uma única plataforma.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    const contactSection = document.getElementById('contato')
                    contactSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-8 py-6 btn-gradient hover:scale-105 transition-all duration-300 text-lg"
                >
                  Solicitar Demonstração
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="px-8 py-6 bg-[#15192B] text-white hover:bg-[#1A1F35] hover:scale-105 transition-all duration-300 text-lg neu-elevated"
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

            {/* Visual Content with Neumorphic Glow Effect */}
            <div className="relative">
              <div className="bg-[#15192B] backdrop-blur-sm p-8 rounded-3xl relative overflow-hidden group neu-card animate-glow">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/20 to-[#2DD4BF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <div className="aspect-square rounded-2xl bg-[#1A1F35] flex items-center justify-center relative overflow-hidden neu-pressed">
                  <BrainCircuit className="w-32 h-32 text-[#818CF8] animate-pulse relative z-10" />

                  {/* Animated rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#6366F1]/30 rounded-full animate-ping" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-[#6366F1]/20 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards - Neumorphic com ícone gradiente */}
              <div className="absolute -top-4 -right-4 bg-[#15192B] backdrop-blur-sm p-4 rounded-xl animate-bounce neu-elevated">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                    <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">+45%</p>
                    <p className="text-[#94A3B8] text-xs">ROI</p>
                  </div>
                </div>
              </div>

              {/* Demo Video Button - Neumorphic com ícone quadrado gradiente */}
              <div className="absolute -bottom-4 -left-4 bg-[#15192B] backdrop-blur-sm p-4 rounded-xl hover:bg-[#1A1F35] transition-all cursor-pointer group/play neu-elevated">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#2DD4BF] flex items-center justify-center shadow-lg shadow-[#6366F1]/30 group-hover/play:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Ver Demo</p>
                    <p className="text-[#94A3B8] text-xs">2 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section - Neumorphic Cards */}
      <section
        ref={painPointsFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16] transition-all duration-1000 delay-100 ${
          painPointsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 text-4xl font-bold">
              Acabamos com as dores de cabeça da gestão OPME
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((pain, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-[#15192B] hover:scale-105 transition-all duration-300 pain-point-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-[#EF4444]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] line-through decoration-[#EF4444] decoration-1">
                    {pain}
                  </p>
                  <p className="text-[#10B981] mt-2 text-sm font-medium">
                    ✓ Resolvido com Icarus
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Neumorphic Cards */}
      <section
        ref={featuresFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16] transition-all duration-1000 delay-150 ${
          featuresFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 text-4xl font-bold">
              Tudo que você precisa em um único sistema
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-[#15192B] backdrop-blur-sm p-8 rounded-2xl hover:scale-105 transition-all duration-300 group neu-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.gradientFrom}, ${feature.gradientTo})`,
                      boxShadow: `0 8px 20px ${feature.gradientFrom}40`
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-white mb-3 text-xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-[#94A3B8] leading-relaxed">
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
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16] transition-all duration-1000 delay-200 ${
          benefitsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 text-4xl font-bold">
              Resultados Reais
            </h2>
            <p className="text-[#94A3B8] text-xl">
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
                  iconColor={benefit.iconColor}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsFade.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16] transition-all duration-1000 delay-100 ${
          testimonialsFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 text-4xl font-bold">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-[#94A3B8] text-xl">
              Depoimentos reais de quem usa o Icarus diariamente
            </p>
          </div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Differentials Section - Neumorphic Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold text-white">Por que Escolher o Icarus?</h2>
            <p className="text-[#94A3B8] text-xl">
              Diferenciais que fazem a diferença
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentials.map((diff, index) => {
              const Icon = diff.icon
              return (
                <div
                  key={index}
                  className="flex gap-6 p-8 rounded-2xl bg-[#15192B] backdrop-blur-sm hover:scale-105 transition-all duration-300 differential-card"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${diff.gradientFrom}, ${diff.gradientTo})`,
                      boxShadow: `0 8px 20px ${diff.gradientFrom}40`
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="mb-3 text-xl font-bold text-white">{diff.title}</h3>
                    <p className="text-[#94A3B8] leading-relaxed">
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
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16] transition-all duration-1000 ${
          ctaFade.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-white mb-6 text-4xl font-bold">
            Pronto para Transformar sua Gestão?
          </h2>
          <p className="text-[#94A3B8] mb-8 text-xl">
            Junte-se a centenas de empresas que já estão elevando sua gestão com IA
          </p>
          <div className="flex items-center justify-center gap-6 mb-12 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              <span className="text-[#94A3B8]">Sem permanência mínima</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              <span className="text-[#94A3B8]">Demonstração gratuita</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              <span className="text-[#94A3B8]">Suporte incluído</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B0D16]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-white mb-4 text-4xl font-bold">
              Solicite uma Demonstração
            </h2>
            <p className="text-[#94A3B8] text-xl">
              Preencha o formulário e nossa equipe entrará em contato
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer - Neumorphic */}
      <footer className="bg-[#15192B] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #2DD4BF)',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Icarus v5.0</h3>
                  <p className="text-[#94A3B8] text-sm">Gestão elevada pela IA</p>
                </div>
              </div>
              <p className="text-[#94A3B8] text-sm">
                Sistema ERP Enterprise especializado em OPME, com inteligência
                artificial integrada.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-white font-semibold">Contato</h4>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
                <li>sac@icarusai.com.br</li>
                <li>Suporte 24/7 disponível</li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="mb-4 text-white font-semibold">Links Rápidos</h4>
              <ul className="space-y-2 text-[#94A3B8] text-sm">
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

          <div className="pt-8 border-t border-[#1A1F35] text-center text-[#94A3B8] text-sm">
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
      <p className="text-white text-3xl font-bold">
        {count}{suffix}
      </p>
      <p className="text-[#94A3B8] text-sm">{label}</p>
    </div>
  )
}

// Benefit Card Component with Counter - Neumorphic com ícones coloridos
function BenefitCard({
  icon: Icon,
  title,
  description,
  stat,
  prefix = '',
  suffix = '',
  iconColor = '#818CF8',
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  title: string
  description: string
  stat: number
  prefix?: string
  suffix?: string
  iconColor?: string
}) {
  const { count, ref } = useCountUp({ end: stat, duration: 2500 })

  return (
    <div
      ref={ref}
      className="text-center p-8 bg-[#15192B] backdrop-blur-sm rounded-2xl hover:scale-105 transition-all duration-300 group neu-card"
    >
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
        style={{ 
          backgroundColor: `${iconColor}15`,
          boxShadow: `inset 4px 4px 8px rgba(0,0,0,0.3), inset -3px -3px 6px rgba(255,255,255,0.02)`
        }}
      >
        <Icon className="w-8 h-8" style={{ color: iconColor }} />
      </div>
      <p className="text-gradient mb-3 text-4xl font-bold">
        {prefix}{count}{suffix}
      </p>
      <h3 className="text-white mb-2 text-lg font-semibold">
        {title}
      </h3>
      <p className="text-[#94A3B8] text-sm">{description}</p>
    </div>
  )
}
