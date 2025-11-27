/**
 * ICARUS v5.0 - Produto Card Component
 * 
 * Card de produto OPME com validação ANVISA em tempo real
 * Design: Dark Glass Medical com efeitos neumórficos 3D
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, XCircle, AlertTriangle, Loader2, 
  ShieldCheck, Calendar, Building2, Package,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAnvisa, type RegistroAnvisa, type SituacaoAnvisa } from '@/hooks/useAnvisa'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// Type alias for ClasseRisco
type ClasseRisco = 'I' | 'II' | 'III' | 'IV'

// ============================================
// TIPOS
// ============================================

export interface Produto {
  id: string
  nome: string
  codigo?: string
  numero_registro_anvisa: string
  fabricante?: string
  classe_risco?: ClasseRisco
  descricao?: string
  preco?: number
  estoque?: number
  // Cache ANVISA
  anvisa_valido?: boolean | null
  anvisa_situacao?: SituacaoAnvisa | null
  anvisa_valido_ate?: string | null
  anvisa_verificado_em?: string | null
}

interface ProdutoCardProps {
  produto: Produto
  onValidacaoConcluida?: (valido: boolean, dados: RegistroAnvisa | null) => void
  className?: string
  showDetails?: boolean
}

// ============================================
// COMPONENTE
// ============================================

export function ProdutoCard({ 
  produto, 
  onValidacaoConcluida,
  className,
  showDetails = false
}: ProdutoCardProps) {
  const { isDark } = useTheme()
  const { validarEAtualizar, loading, getStatusColor, getClasseRiscoLabel, formatarNumero } = useAnvisa({
    moduloOrigem: 'produtos'
  })

  const [status, setStatus] = useState<'pendente' | 'válido' | 'inválido' | 'alerta'>(
    produto.anvisa_valido === true ? 'válido' :
    produto.anvisa_valido === false ? 'inválido' : 'pendente'
  )
  const [detalhe, setDetalhe] = useState<string>('')
  const [dadosAnvisa, setDadosAnvisa] = useState<RegistroAnvisa | null>(null)
  const [expanded, setExpanded] = useState(showDetails)

  // Styles neumórficos
  const neuStyles = {
    cardBg: isDark ? '#1A1F35' : '#FFFFFF',
    cardHoverBg: isDark ? '#252B44' : '#F3F4F6',
    shadowElevated: isDark 
      ? '8px 8px 20px rgba(0,0,0,0.5), -6px -6px 16px rgba(255,255,255,0.02)'
      : '6px 6px 16px rgba(0,0,0,0.1), -4px -4px 12px rgba(255,255,255,0.9)',
    shadowHover: isDark
      ? '12px 12px 28px rgba(0,0,0,0.6), -8px -8px 20px rgba(255,255,255,0.03)'
      : '8px 8px 20px rgba(0,0,0,0.12), -6px -6px 16px rgba(255,255,255,0.95)',
  }

  const handleValidar = async () => {
    const result = await validarEAtualizar(produto.id, produto.numero_registro_anvisa)
    
    if (result.valido) {
      setStatus('válido')
      setDadosAnvisa(result.dados)
      
      if (result.dados?.valido_ate) {
        const dataValidade = new Date(result.dados.valido_ate)
        const diasRestantes = Math.ceil((dataValidade.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        
        if (diasRestantes <= 30) {
          setStatus('alerta')
          setDetalhe(`Vence em ${diasRestantes} dias (${dataValidade.toLocaleDateString('pt-BR')})`)
        } else {
          setDetalhe(`Válido até ${dataValidade.toLocaleDateString('pt-BR')}`)
        }
      } else {
        setDetalhe('Registro permanente')
      }
    } else {
      setStatus('inválido')
      setDadosAnvisa(result.dados)
      setDetalhe(result.dados?.motivo_cancelamento || result.erro || 'Registro inativo')
    }

    onValidacaoConcluida?.(result.valido, result.dados)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'válido':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'inválido':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'alerta':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      default:
        return <ShieldCheck className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusBadge = () => {
    const configs = {
      'válido': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Válido ANVISA' },
      'inválido': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Inválido' },
      'alerta': { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Vencendo' },
      'pendente': { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Não verificado' }
    }
    const config = configs[status]
    
    return (
      <Badge className={cn(config.bg, config.text, 'flex items-center gap-1')}>
        {getStatusIcon()}
        {config.label}
      </Badge>
    )
  }

  return (
    <Card 
      className={cn('overflow-hidden transition-all duration-300', className)}
      style={{
        backgroundColor: neuStyles.cardBg,
        boxShadow: neuStyles.shadowElevated,
        border: 'none'
      }}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-lg font-bold truncate',
              isDark ? 'text-white' : 'text-theme-primary'
            )}>
              {produto.nome}
            </h3>
            {produto.codigo && (
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-theme-muted')}>
                Código: {produto.codigo}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Registro ANVISA */}
        <div 
          className={cn(
            'p-3 rounded-xl flex items-center justify-between',
            isDark ? 'bg-[#15192B]' : 'bg-theme-muted'
          )}
          style={{
            boxShadow: isDark 
              ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
              : 'inset 3px 3px 6px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.8)'
          }}
        >
          <div>
            <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-gray-400')}>
              Registro ANVISA
            </p>
            <p className={cn('font-mono font-semibold', isDark ? 'text-white' : 'text-theme-primary')}>
              {formatarNumero(produto.numero_registro_anvisa)}
            </p>
          </div>
          <ShieldCheck 
            className="w-8 h-8" 
            style={{ color: status !== 'pendente' ? getStatusColor(dadosAnvisa?.situacao || 'INDETERMINADO') : '#64748B' }}
          />
        </div>

        {/* Informações extras */}
        <div className="grid grid-cols-2 gap-3">
          {produto.fabricante && (
            <div className="flex items-center gap-2">
              <Building2 className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-gray-400')} />
              <span className={cn('text-sm truncate', isDark ? 'text-slate-300' : 'text-theme-secondary')}>
                {produto.fabricante}
              </span>
            </div>
          )}
          {(produto.classe_risco || dadosAnvisa?.classe_risco) && (
            <div className="flex items-center gap-2">
              <Package className={cn('w-4 h-4', isDark ? 'text-slate-500' : 'text-gray-400')} />
              <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-theme-secondary')}>
                Classe {dadosAnvisa?.classe_risco || produto.classe_risco}
              </span>
            </div>
          )}
        </div>

        {/* Botão de validação */}
        <Button
          onClick={handleValidar}
          disabled={loading}
          className="w-full gap-2"
          variant={status === 'pendente' ? 'primary' : 'secondary'}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Validando na ANVISA...
            </>
          ) : status === 'pendente' ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              Validar Registro ANVISA
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Revalidar
            </>
          )}
        </Button>

        {/* Feedback de validação */}
        <AnimatePresence>
          {detalhe && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                'p-3 rounded-lg text-sm font-medium',
                status === 'válido' && 'bg-emerald-500/10 text-emerald-400',
                status === 'inválido' && 'bg-red-500/10 text-red-400',
                status === 'alerta' && 'bg-amber-500/10 text-amber-400'
              )}
            >
              <div className="flex items-center gap-2">
                {status === 'válido' && <CheckCircle2 className="w-4 h-4" />}
                {status === 'inválido' && <XCircle className="w-4 h-4" />}
                {status === 'alerta' && <AlertTriangle className="w-4 h-4" />}
                {detalhe}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detalhes expandidos */}
        {dadosAnvisa && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                'w-full flex items-center justify-between py-2 text-sm',
                isDark ? 'text-slate-400 hover:text-slate-300' : 'text-theme-muted hover:text-theme-secondary'
              )}
            >
              <span>Ver detalhes da ANVISA</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    'space-y-2 pt-3 border-t',
                    isDark ? 'border-slate-700' : 'border-gray-200'
                  )}
                >
                  {dadosAnvisa.nome_comercial && (
                    <DetailRow label="Nome Comercial" value={dadosAnvisa.nome_comercial} isDark={isDark} />
                  )}
                  {dadosAnvisa.titular && (
                    <DetailRow label="Titular" value={dadosAnvisa.titular} isDark={isDark} />
                  )}
                  {dadosAnvisa.classe_risco && (
                    <DetailRow label="Classe de Risco" value={getClasseRiscoLabel(dadosAnvisa.classe_risco)} isDark={isDark} />
                  )}
                  {dadosAnvisa.situacao && (
                    <DetailRow label="Situação" value={dadosAnvisa.situacao} isDark={isDark}>
                      <span 
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: getStatusColor(dadosAnvisa.situacao) }}
                      />
                    </DetailRow>
                  )}
                  {dadosAnvisa.valido_ate && (
                    <DetailRow 
                      label="Válido até" 
                      value={new Date(dadosAnvisa.valido_ate).toLocaleDateString('pt-BR')} 
                      isDark={isDark}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                    </DetailRow>
                  )}
                  {dadosAnvisa.data_publicacao && (
                    <DetailRow 
                      label="Publicação" 
                      value={new Date(dadosAnvisa.data_publicacao).toLocaleDateString('pt-BR')} 
                      isDark={isDark} 
                    />
                  )}
                  
                  <a
                    href={`https://consultas.anvisa.gov.br/#/saude/q/?numeroRegistro=${produto.numero_registro_anvisa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-1 text-xs mt-2',
                      'text-[#6366F1] hover:text-[#818CF8] transition-colors'
                    )}
                  >
                    Ver no portal ANVISA
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Última verificação */}
        {produto.anvisa_verificado_em && (
          <p className={cn('text-xs text-center', isDark ? 'text-slate-600' : 'text-gray-400')}>
            Última verificação: {new Date(produto.anvisa_verificado_em).toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Componente auxiliar para linha de detalhe
function DetailRow({ 
  label, 
  value, 
  isDark, 
  children 
}: { 
  label: string
  value: string
  isDark: boolean
  children?: React.ReactNode 
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-gray-400')}>
        {label}
      </span>
      <span className={cn('text-sm font-medium flex items-center', isDark ? 'text-slate-300' : 'text-theme-secondary')}>
        {children}
        {value}
      </span>
    </div>
  )
}

export default ProdutoCard

