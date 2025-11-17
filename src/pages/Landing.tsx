import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  ArrowRight,
  Zap,
  Shield,
  LineChart,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Target,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useLeads } from '@/hooks/useLeads'
import { toast } from 'sonner'

export function Landing() {
  const navigate = useNavigate()
  const { createLead, isSubmitting, error } = useLeads()
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    cargo: '',
    numeroColaboradores: '',
    principalDesafio: '',
    interesseIA: '',
    mensagem: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await createLead(formData)

    if (success) {
      toast.success('Obrigado pelo interesse!', {
        description: 'Nossa equipe entrará em contato em até 24 horas.',
        duration: 5000,
      })
      
      // Resetar formulário
      setFormData({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        cargo: '',
        numeroColaboradores: '',
        principalDesafio: '',
        interesseIA: '',
        mensagem: '',
      })
    } else {
      toast.error('Erro ao enviar formulário', {
        description: error || 'Por favor, tente novamente.',
        duration: 5000,
      })
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'IA Integrada',
      description: 'Previsão de demanda, análise de inadimplência e recomendações inteligentes',
      color: '#6366F1',
    },
    {
      icon: Zap,
      title: 'Desempenho Extremo',
      description: 'Interface responsiva construída com React 18 e otimizada para produção',
      color: '#F59E0B',
    },
    {
      icon: Shield,
      title: 'Segurança Máxima',
      description: 'Criptografia de ponta a ponta e conformidade com LGPD e ISO 27001',
      color: '#10B981',
    },
    {
      icon: LineChart,
      title: '58 Módulos Integrados',
      description: 'Do financeiro ao estoque, tudo em um único sistema',
      color: '#8B5CF6',
    },
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Redução de Custos',
      stat: '40%',
      description: 'Economia operacional em 12 meses',
    },
    {
      icon: Clock,
      title: 'Economia de Tempo',
      stat: '15h/semana',
      description: 'Automatização de processos manuais',
    },
    {
      icon: Target,
      title: 'Precisão de Estoque',
      stat: '99.5%',
      description: 'Acurácia no controle de OPME',
    },
    {
      icon: Award,
      title: 'ROI Garantido',
      stat: '6 meses',
      description: 'Retorno sobre investimento',
    },
  ]

  const painPoints = [
    'Controle manual de estoque propenso a erros',
    'Dificuldade em rastrear cirurgias e materiais',
    'Perda de receita por falta de previsão de demanda',
    'Processos financeiros desconectados',
    'Falta de visibilidade em tempo real',
    'Dificuldade em atender requisitos regulatórios',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#F0F4F8] to-[#E5E7EB]">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Icarus v5.0</h2>
                <p className="text-xs text-gray-500">Gestão elevada pela IA</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => navigate('/login')}
              className="bg-[#6366F1] hover:bg-[#5558E3] text-white px-6 h-10 rounded-lg shadow-lg shadow-[#6366F1]/30 transition-all hover:shadow-xl hover:shadow-[#6366F1]/40"
            >
              Entrar no Sistema
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#6366F1]/20">
                <Sparkles className="w-4 h-4 text-[#6366F1]" />
                <span className="text-sm font-medium text-[#6366F1]">
                  ERP #1 para OPME no Brasil
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Transforme sua gestão de{' '}
                <span className="text-gradient bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  OPME com IA
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Sistema completo de gestão para Órteses, Próteses e Materiais Especiais.
                Controle cirurgias, estoque, financeiro e muito mais com inteligência
                artificial integrada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() =>
                    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="bg-[#6366F1] hover:bg-[#5558E3] text-white h-14 px-8 rounded-xl shadow-xl shadow-[#6366F1]/30 transition-all hover:shadow-2xl hover:shadow-[#6366F1]/40 text-lg font-semibold"
                >
                  Falar com Especialista
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="h-14 px-8 rounded-xl border-2 border-gray-300 hover:border-[#6366F1] hover:bg-[#6366F1]/5 text-lg font-semibold"
                >
                  Conhecer Benefícios
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Hospitais atendidos</div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Suporte</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="neu-soft rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10" />
                <div className="relative space-y-6">
                  {/* Dashboard Preview Cards */}
                  {[
                    { label: 'Cirurgias Hoje', value: '24', trend: '+12%', color: '#6366F1' },
                    { label: 'Estoque IA', value: '99.5%', trend: '+2.5%', color: '#10B981' },
                    { label: 'Faturamento', value: 'R$ 2.4M', trend: '+18%', color: '#F59E0B' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow animate-pulse-soft"
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                          <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{ backgroundColor: `${item.color}20`, color: item.color }}
                        >
                          {item.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tecnologia de ponta para sua gestão
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistema moderno, seguro e inteligente desenvolvido com as melhores tecnologias do
              mercado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="neu-soft p-8 hover:shadow-xl transition-all duration-300 group cursor-pointer border-0"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Resultados comprovados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas que implementaram o Icarus v5.0 já estão colhendo resultados extraordinários
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="neu-soft rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#6366F1]/30">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-[#6366F1] mb-2">{benefit.stat}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Resolva as principais dores da sua operação
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Sabemos os desafios que você enfrenta diariamente. O Icarus v5.0 foi desenvolvido
                para resolver cada um deles.
              </p>

              <div className="space-y-4">
                {painPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="neu-soft rounded-3xl p-8 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nossa Solução</h3>
                </div>

                <ul className="space-y-4">
                  {[
                    'IA prevê demanda e otimiza estoque',
                    'Rastreamento completo de cirurgias',
                    'Dashboards em tempo real',
                    'Integração total financeiro + estoque',
                    'Relatórios automáticos de conformidade',
                    'Suporte especializado 24/7',
                  ].map((solution, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para transformar sua gestão?
            </h2>
            <p className="text-xl text-white/90">
              Preencha o formulário e nossa equipe entrará em contato em até 24 horas
            </p>
          </div>

          <Card className="neu-soft p-8 sm:p-12 bg-white border-0 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium text-gray-700">
                    Nome completo *
                  </label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="João Silva"
                    required
                    className="h-12"
                  />
                </div>

                {/* Empresa */}
                <div className="space-y-2">
                  <label htmlFor="empresa" className="text-sm font-medium text-gray-700">
                    Empresa *
                  </label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="Hospital XYZ"
                    required
                    className="h-12"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email corporativo *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@hospital.com.br"
                    required
                    className="h-12"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                    Telefone *
                  </label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                    className="h-12"
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <label htmlFor="cargo" className="text-sm font-medium text-gray-700">
                    Cargo *
                  </label>
                  <Select
                    value={formData.cargo}
                    onValueChange={(value) => setFormData({ ...formData, cargo: value })}
                  >
                    <SelectTrigger id="cargo" className="h-12">
                      <SelectValue placeholder="Selecione seu cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diretor">Diretor(a)</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="coordenador">Coordenador(a)</SelectItem>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de Colaboradores */}
                <div className="space-y-2">
                  <label htmlFor="colaboradores" className="text-sm font-medium text-gray-700">
                    Número de colaboradores *
                  </label>
                  <Select
                    value={formData.numeroColaboradores}
                    onValueChange={(value) =>
                      setFormData({ ...formData, numeroColaboradores: value })
                    }
                  >
                    <SelectTrigger id="colaboradores" className="h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Principal Desafio */}
              <div className="space-y-2">
                <label htmlFor="desafio" className="text-sm font-medium text-gray-700">
                  Qual seu principal desafio atual? *
                </label>
                <Select
                  value={formData.principalDesafio}
                  onValueChange={(value) =>
                    setFormData({ ...formData, principalDesafio: value })
                  }
                >
                  <SelectTrigger id="desafio" className="h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="controle-estoque">Controle de estoque</SelectItem>
                    <SelectItem value="gestao-cirurgias">Gestão de cirurgias</SelectItem>
                    <SelectItem value="financeiro">Gestão financeira</SelectItem>
                    <SelectItem value="conformidade">Conformidade regulatória</SelectItem>
                    <SelectItem value="integracao">Integração de sistemas</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interesse IA */}
              <div className="space-y-2">
                <label htmlFor="interesseIA" className="text-sm font-medium text-gray-700">
                  Qual funcionalidade de IA mais te interessa? *
                </label>
                <Select
                  value={formData.interesseIA}
                  onValueChange={(value) => setFormData({ ...formData, interesseIA: value })}
                >
                  <SelectTrigger id="interesseIA" className="h-12">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previsao-demanda">Previsão de demanda</SelectItem>
                    <SelectItem value="analise-inadimplencia">
                      Análise de inadimplência
                    </SelectItem>
                    <SelectItem value="recomendacao-produtos">
                      Recomendação de produtos
                    </SelectItem>
                    <SelectItem value="otimizacao-estoque">Otimização de estoque</SelectItem>
                    <SelectItem value="todas">Todas as opções</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <label htmlFor="mensagem" className="text-sm font-medium text-gray-700">
                  Mensagem adicional (opcional)
                </label>
                <Textarea
                  id="mensagem"
                  value={formData.mensagem}
                  onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                  placeholder="Conte-nos mais sobre suas necessidades..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white text-lg font-semibold rounded-xl shadow-xl shadow-[#6366F1]/30 transition-all hover:shadow-2xl hover:shadow-[#6366F1]/40"
              >
                {isSubmitting ? (
                  'Enviando...'
                ) : (
                  <>
                    Solicitar Demonstração
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                Ao enviar, você concorda com nossa{' '}
                <a href="#" className="text-[#6366F1] underline">
                  Política de Privacidade
                </a>
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Icarus v5.0</h3>
                  <p className="text-xs text-gray-400">Gestão elevada pela IA</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Sistema completo de gestão para OPME com inteligência artificial integrada.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Módulos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Inteligência Artificial
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Segurança
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Cases de sucesso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Central de ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentação
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:dax@newortho.com.br"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    dax@newortho.com.br
                  </a>
                </li>
                <li className="text-gray-400">Suporte 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025{' '}
              <span className="text-[#6366F1] font-semibold">IcarusAI Technology</span>. Todos
              os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

