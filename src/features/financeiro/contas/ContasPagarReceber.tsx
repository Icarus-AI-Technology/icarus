/**
 * ContasPagarReceber - Gestão Automática de Contas
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Contas geradas automaticamente a partir de NF-e
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingDown, TrendingUp, Calendar, DollarSign, 
  AlertTriangle, CheckCircle, Clock, Filter, 
  Download, Search, MoreVertical, Eye, Edit, Trash2
} from 'lucide-react'

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

interface Conta {
  id: string
  tipo: 'pagar' | 'receber'
  descricao: string
  parceiro: string
  cnpj: string
  valor_cents: number
  data_vencimento: string
  data_pagamento?: string
  parcela: number
  total_parcelas: number
  status: 'pendente' | 'pago' | 'recebido' | 'vencido' | 'cancelado'
  nfe_numero?: string
  nfe_chave?: string
}

// Dados mock - em produção vem do Supabase
const contasMock: Conta[] = [
  {
    id: '1',
    tipo: 'pagar',
    descricao: 'NF-e 001234 - Stents Coronários',
    parceiro: 'Abbott Laboratories',
    cnpj: '56.998.982/0001-07',
    valor_cents: 4500000,
    data_vencimento: '2025-12-15',
    parcela: 1,
    total_parcelas: 3,
    status: 'pendente',
    nfe_numero: '001234',
  },
  {
    id: '2',
    tipo: 'receber',
    descricao: 'NF-e 005678 - Próteses Valvares',
    parceiro: 'Hospital Samaritano',
    cnpj: '33.000.118/0001-79',
    valor_cents: 8900000,
    data_vencimento: '2025-12-10',
    parcela: 1,
    total_parcelas: 1,
    status: 'pendente',
    nfe_numero: '005678',
  },
  {
    id: '3',
    tipo: 'pagar',
    descricao: 'NF-e 001235 - Cateteres',
    parceiro: 'Medtronic Brasil',
    cnpj: '10.244.877/0001-05',
    valor_cents: 2300000,
    data_vencimento: '2025-11-28',
    parcela: 2,
    total_parcelas: 3,
    status: 'vencido',
    nfe_numero: '001235',
  },
  {
    id: '4',
    tipo: 'receber',
    descricao: 'NF-e 005679 - Kit Hemodinâmica',
    parceiro: 'Unimed RJ',
    cnpj: '42.163.881/0001-01',
    valor_cents: 15600000,
    data_vencimento: '2025-11-25',
    data_pagamento: '2025-11-24',
    parcela: 1,
    total_parcelas: 1,
    status: 'recebido',
    nfe_numero: '005679',
  },
]

export default function ContasPagarReceber() {
  const { isDark } = useTheme()
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'pagar' | 'receber'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  const contas = contasMock.filter(c => {
    if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false
    if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false
    if (busca && !c.descricao.toLowerCase().includes(busca.toLowerCase()) && 
        !c.parceiro.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const totalPagar = contasMock
    .filter(c => c.tipo === 'pagar' && c.status === 'pendente')
    .reduce((acc, c) => acc + c.valor_cents, 0)

  const totalReceber = contasMock
    .filter(c => c.tipo === 'receber' && c.status === 'pendente')
    .reduce((acc, c) => acc + c.valor_cents, 0)

  const totalVencido = contasMock
    .filter(c => c.status === 'vencido')
    .reduce((acc, c) => acc + c.valor_cents, 0)

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getStatusConfig = (status: Conta['status']) => {
    const configs = {
      pendente: { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Pendente' },
      pago: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Pago' },
      recebido: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Recebido' },
      vencido: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Vencido' },
      cancelado: { icon: Trash2, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Cancelado' },
    }
    return configs[status]
  }

  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* A Pagar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl p-6 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
            cardBg
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">A Pagar</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalPagar)}</p>
            </div>
          </div>
        </motion.div>

        {/* A Receber */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-2xl p-6 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
            cardBg
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">A Receber</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalReceber)}</p>
            </div>
          </div>
        </motion.div>

        {/* Vencidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'rounded-2xl p-6 backdrop-blur-xl border border-red-500/30 shadow-2xl',
            cardBg
          )}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Vencidos</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalVencido)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'rounded-2xl p-6 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
          cardBg
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por descrição ou parceiro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-slate-800/70 border-slate-600"
            />
          </div>

          <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as typeof filtroTipo)}>
            <SelectTrigger className="w-[150px] bg-slate-800/70 border-slate-600">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pagar">A Pagar</SelectItem>
              <SelectItem value="receber">A Receber</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[150px] bg-slate-800/70 border-slate-600">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Lista de Contas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          'rounded-2xl backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden',
          cardBg
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-sm font-medium text-slate-400">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Descrição</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Parceiro</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Vencimento</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Parcela</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">Valor</th>
                <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-center p-4 text-sm font-medium text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta, idx) => {
                const statusConfig = getStatusConfig(conta.status)
                const StatusIcon = statusConfig.icon

                return (
                  <motion.tr
                    key={conta.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
                        conta.tipo === 'pagar' 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      )}>
                        {conta.tipo === 'pagar' ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {conta.tipo === 'pagar' ? 'Pagar' : 'Receber'}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">{conta.descricao}</p>
                      {conta.nfe_numero && (
                        <p className="text-xs text-slate-500">NF-e: {conta.nfe_numero}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-300">{conta.parceiro}</p>
                      <p className="text-xs text-slate-500">{conta.cnpj}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-400">
                        {conta.parcela}/{conta.total_parcelas}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={cn(
                        'text-sm font-bold',
                        conta.tipo === 'pagar' ? 'text-red-400' : 'text-emerald-400'
                      )}>
                        {formatCurrency(conta.valor_cents)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className={cn(
                        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
                        statusConfig.bg,
                        statusConfig.color
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {conta.status === 'pendente' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 text-emerald-400 hover:text-emerald-300"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {contas.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhuma conta encontrada</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

