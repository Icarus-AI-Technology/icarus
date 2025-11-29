/**
 * GestaoCadastrosIA - Tela de Gestão de Cadastros com IA
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Carrossel de tabs com contadores, badges e filtros
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Stethoscope, Building2, FileText, Users, Package, 
  DollarSign, Plus, Search, Filter, RefreshCw, Sparkles,
  TrendingUp, AlertTriangle, CheckCircle, Clock
} from 'lucide-react'

import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import MedicoFormCFM from '@/features/cadastros/medico/MedicoFormCFM'
import ProdutoForm from '@/features/cadastros/produto/ProdutoForm'
import FornecedorForm from '@/features/cadastros/fornecedor/FornecedorForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface CadastroStats {
  medicos: { total: number; novos: number; pendentes: number }
  hospitais: { total: number; novos: number; pendentes: number }
  convenios: { total: number; novos: number; pendentes: number }
  fornecedores: { total: number; novos: number; pendentes: number }
  produtos: { total: number; novos: number; pendentes: number }
  tabelas: { total: number; novos: number; pendentes: number }
}

// Mock stats - em produção vem do Supabase
const statsMock: CadastroStats = {
  medicos: { total: 847, novos: 15, pendentes: 3 },
  hospitais: { total: 312, novos: 8, pendentes: 2 },
  convenios: { total: 89, novos: 3, pendentes: 0 },
  fornecedores: { total: 156, novos: 12, pendentes: 5 },
  produtos: { total: 2847, novos: 47, pendentes: 12 },
  tabelas: { total: 42, novos: 2, pendentes: 1 },
}

type TabId = 'medicos' | 'hospitais' | 'convenios' | 'fornecedores' | 'produtos' | 'tabelas'

const tabConfig = {
  medicos: { 
    label: 'Médicos Cirurgiões', 
    icon: Stethoscope, 
    color: 'cyan',
    description: 'Cadastro com validação CFM automática'
  },
  hospitais: { 
    label: 'Hospitais & Clínicas', 
    icon: Building2, 
    color: 'emerald',
    description: 'Auto-preenchimento via CNPJ'
  },
  convenios: { 
    label: 'Convênios', 
    icon: FileText, 
    color: 'violet',
    description: 'Operadoras e planos de saúde'
  },
  fornecedores: { 
    label: 'Fornecedores', 
    icon: Users, 
    color: 'pink',
    description: 'Distribuidores e fabricantes'
  },
  produtos: { 
    label: 'Produtos OPME', 
    icon: Package, 
    color: 'purple',
    description: 'Validação ANVISA automática'
  },
  tabelas: { 
    label: 'Tabelas de Preços', 
    icon: DollarSign, 
    color: 'teal',
    description: 'Preços por convênio/hospital'
  },
}

export default function GestaoCadastrosIA() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<TabId>('medicos')
  const [showForm, setShowForm] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [stats, setStats] = useState<CadastroStats>(statsMock)
  const [loading, setLoading] = useState(false)

  const currentTab = tabConfig[activeTab]
  const currentStats = stats[activeTab]

  const refreshStats = async () => {
    setLoading(true)
    // Em produção, chamar API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStats(statsMock)
    setLoading(false)
  }

  useEffect(() => {
    refreshStats()
  }, [])

  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  const renderForm = () => {
    switch (activeTab) {
      case 'medicos':
        return <MedicoFormCFM onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      case 'produtos':
        return <ProdutoForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      case 'fornecedores':
        return <FornecedorForm />
      default:
        return (
          <div className="p-12 text-center">
            <currentTab.icon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Formulário de {currentTab.label} em desenvolvimento</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-xl', isDark ? 'bg-violet-500/10' : 'bg-violet-100')}>
            <Sparkles className="w-8 h-8 text-violet-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Gestão de Cadastros IA
            </h1>
            <p className="text-slate-400">Auto-preenchimento inteligente via APIs oficiais</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Atualizar
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4" />
            Novo Cadastro
          </Button>
        </div>
      </motion.div>

      {/* Carrossel de Tabs */}
      <CadastroTabsCarousel active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-xl p-4 backdrop-blur-xl border border-slate-700/50',
            cardBg
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-xl font-bold text-white">{currentStats.total.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-xl p-4 backdrop-blur-xl border border-emerald-500/30',
            cardBg
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Novos (7 dias)</p>
              <p className="text-xl font-bold text-emerald-400">+{currentStats.novos}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'rounded-xl p-4 backdrop-blur-xl border border-cyan-500/30',
            cardBg
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pendentes</p>
              <p className="text-xl font-bold text-cyan-400">{currentStats.pendentes}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'rounded-xl p-4 backdrop-blur-xl border border-slate-700/50',
            cardBg
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-500/10">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">IA Ativa</p>
              <p className="text-sm font-medium text-violet-400">Auto-preenchimento</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          'rounded-xl p-4 backdrop-blur-xl border border-slate-700/50 flex flex-wrap items-center gap-4',
          cardBg
        )}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={`Buscar ${currentTab.label.toLowerCase()}...`}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 bg-slate-800/70 border-slate-600"
          />
        </div>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[150px] bg-slate-800/70 border-slate-600">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Mais Filtros
        </Button>
      </motion.div>

      {/* Conteúdo Principal */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {renderForm()}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'rounded-2xl backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden',
              cardBg
            )}
          >
            {/* Placeholder para lista de cadastros */}
            <div className="p-12 text-center">
              <currentTab.icon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                {currentTab.label}
              </h3>
              <p className="text-slate-400 mb-6">{currentTab.description}</p>
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600"
              >
                <Plus className="w-4 h-4" />
                Adicionar {currentTab.label.split(' ')[0]}
              </Button>
            </div>

            {/* Em produção: tabela de dados com DataTable/TanStack */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights IA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={cn(
          'rounded-xl p-6 backdrop-blur-xl border border-violet-500/30',
          'bg-gradient-to-br from-violet-900/20 to-purple-900/20'
        )}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-500/20">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-violet-300 mb-2">Insights IcarusBrain</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {currentStats.novos} novos {currentTab.label.toLowerCase()} cadastrados esta semana
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-400" />
                {currentStats.pendentes} cadastros aguardando validação
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Taxa de completude: 94% com auto-preenchimento IA
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

