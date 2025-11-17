import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
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
              className="bg-gradient-to-br from-[#6366F1] to-indigo-700 hover:from-[#4F46E5] hover:to-indigo-800 text-white shadow-lg shadow-[#6366F1]/50 hover:shadow-xl hover:shadow-[#6366F1]/60 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M257.000000,107.000000 C257.000000,121.020897 257.000000,135.041794 256.647339,149.231964 C255.863922,150.228546 255.164307,151.018326 255.042892,151.888763 C253.268906,164.606110 248.900360,176.511963 242.932251,187.730682 C235.103165,202.447723 225.193298,215.523392 212.264069,226.433365 C194.853668,241.124649 175.211411,250.630356 152.969254,255.067642 C152.214386,255.218231 151.652069,256.334076 151.000000,257.000000 C136.979111,257.000000 122.958214,257.000000 108.768021,256.647339 C107.771454,255.863937 106.981689,255.164307 106.111275,255.042877 C93.393906,253.268967 81.488075,248.900284 70.269318,242.932251 C55.552212,235.103241 42.476593,225.193298 31.566628,212.264053 C16.875347,194.853653 7.369643,175.211411 2.932357,152.969269 C2.781760,152.214401 1.665923,151.652069 0.999999,151.000000 C1.000000,136.979111 1.000000,122.958214 1.352687,108.768021 C2.136079,107.771454 2.835672,106.981682 2.957086,106.111259 C4.731020,93.393890 9.099692,81.488052 15.067755,70.269310 C22.896828,55.552261 32.806664,42.476570 45.735928,31.566622 C63.146362,16.875374 82.788567,7.369641 105.030716,2.932356 C105.785606,2.781759 106.347923,1.665922 107.000000,0.999999 C121.020897,1.000000 135.041794,1.000000 149.231964,1.352689 C150.228546,2.136082 151.018341,2.835670 151.888763,2.957089 C164.606125,4.731055 176.512009,9.099652 187.730728,15.067761 C202.447739,22.896885 215.523468,32.806671 226.433395,45.735954 C241.124619,63.146408 250.630371,82.788582 255.067642,105.030716 C255.218246,105.785591 256.334076,106.347916 257.000000,107.000000 M28.994551,68.508713 C26.764997,72.760643 24.364655,76.932915 22.337486,81.279236 C15.903623,95.073631 12.733429,109.707436 12.093431,124.838356 C11.851275,130.563446 12.555466,136.342316 13.023306,142.080765 C13.961019,153.582596 16.933062,164.607834 21.625685,175.112747 C29.070221,191.778107 39.284138,206.378143 53.509899,218.127655 C63.675465,226.523697 74.593224,233.445602 86.966507,238.017838 C104.603615,244.535156 122.619576,247.671768 141.505814,245.079651 C153.876923,243.381744 165.888840,240.738190 177.207947,235.346115 C192.456436,228.082199 205.875656,218.546967 217.061157,205.651901 C226.097473,195.234497 233.115448,183.770798 237.953461,171.009888 C244.609619,153.453461 247.622726,135.393219 245.114304,116.485687 C243.554382,104.727753 240.994904,93.386642 236.156021,82.546928 C228.766541,65.993546 218.575378,51.627907 204.551315,39.929359 C194.417191,31.475714 183.461319,24.606115 171.113831,19.994417 C153.327835,13.351474 135.120941,10.409445 116.072296,12.901785 C104.635521,14.398184 93.520279,16.853813 83.028725,21.547386 C71.624992,26.649036 61.166363,33.186394 51.649517,41.528755 C42.812347,49.275318 35.685555,58.145027 28.994551,68.508713 z"/>
                <path fill="currentColor" d="M74.151230,151.000000 C62.151562,151.013779 52.475487,145.181824 49.662235,135.315170 C46.295467,123.507210 54.142796,108.902596 66.475639,108.073662 C77.012947,107.365417 87.593941,107.255005 98.158791,107.027573 C104.977837,106.880791 111.802612,107.000000 119.590691,107.000000 C118.407967,105.041794 117.564316,103.609673 116.687042,102.198463 C112.362801,95.242325 111.275558,87.916550 115.226364,80.565872 C119.176064,73.217255 125.736977,69.679665 134.065063,70.050484 C142.036163,70.405411 147.148392,75.705170 151.753647,81.395676 C160.748077,92.509697 169.439804,103.870132 178.505890,114.924309 C186.476929,124.643303 187.851456,131.703064 179.021790,142.470840 C168.382141,155.445847 157.777100,168.449326 147.185150,181.463333 C142.010986,187.820679 131.334991,189.945770 123.986816,186.011765 C115.266800,181.343277 110.936684,172.099915 113.845306,163.701431 C115.334747,159.400757 117.386414,155.294800 119.227211,151.000000 C104.520699,151.000000 89.575813,151.000000 74.151230,151.000000 M129.223129,175.753265 C135.680893,177.736465 139.404770,173.763260 142.912903,169.415146 C145.046753,166.770370 147.048813,164.019699 149.157104,161.353790 C156.816116,151.669128 164.449402,141.963394 172.198029,132.350784 C174.166916,129.908249 173.978470,127.910255 172.102142,125.575485 C165.691360,117.598312 159.431625,109.499557 153.003479,101.536621 C148.087372,95.446732 143.455002,89.001633 137.745316,83.748215 C135.794479,81.953255 130.628036,82.379494 127.524216,83.473885 C124.493347,84.542549 123.110336,88.032974 124.953957,91.608093 C127.734665,97.000351 130.692795,102.308983 133.251083,107.804199 C134.275452,110.004555 135.671967,113.513466 134.712311,114.817665 C133.169540,116.914345 129.830063,118.778229 127.216560,118.823471 C108.240761,119.151962 89.256569,118.978645 70.275276,119.039726 C68.723595,119.044716 66.974380,119.252937 65.659607,119.983429 C61.363022,122.370651 59.033157,127.423721 60.111244,131.313507 C61.605846,136.706116 64.832367,138.998322 70.953079,138.999115 C89.768066,139.001541 108.585297,138.859741 127.395454,139.161102 C130.020340,139.203140 133.435226,140.811356 134.923904,142.839813 C135.900589,144.170670 134.508789,147.780579 133.407532,149.985077 C130.973663,154.857239 127.952286,159.431839 125.361885,164.231079 C123.071648,168.474228 124.322769,172.268616 129.223129,175.753265 z"/>
                <path fill="currentColor" d="M209.000000,121.000000 C209.000000,138.499008 208.776871,155.501999 209.080856,172.495560 C209.273590,183.269928 199.323715,197.144699 187.000687,197.961487 C178.775208,198.506683 170.526428,198.808304 162.283676,198.937607 C158.381500,198.998856 155.177170,196.341446 155.325089,192.849762 C155.467499,189.487839 158.570557,186.992035 162.609573,186.997787 C169.109177,187.007050 175.636688,186.622391 182.101089,187.099518 C189.499603,187.645599 198.064438,180.421402 198.033798,171.166809 C197.940552,143.002106 197.964401,114.836815 198.023727,86.671936 C198.039581,79.149742 191.209808,70.165878 182.036026,70.906090 C175.909607,71.400414 169.710831,71.027809 163.544754,70.990341 C159.342865,70.964806 155.135345,68.004936 155.036530,65.097626 C154.938248,62.206032 159.190643,58.833363 163.346603,59.053654 C172.663666,59.547516 182.179321,59.328075 191.217560,61.257092 C201.771545,63.509609 208.998734,74.611412 208.999741,85.502220 C209.000824,97.168144 209.000000,108.834076 209.000000,121.000000 z"/>
              </svg>
              Entrar no Sistema
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
                  <p className="text-gray-400 line-through decoration-red-500 decoration-1">
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
