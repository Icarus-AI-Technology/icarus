/**
 * ICARUS v5.0 - NF-e Uploader Component
 * 
 * Componente para upload e extração automática de NF-e
 * Suporta XML, PDF e imagens com extração via Claude Vision
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { useState, useCallback } from 'react'
import { 
  Upload, FileText, FileImage, Check, AlertCircle, 
  Loader2, X, Eye, Download, ChevronDown, ChevronUp 
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/hooks/useTheme'
import { useLangChainTools, type NFEExtracao } from '@/hooks/useLangChainTools'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/formatters'

interface NFEUploaderProps {
  onExtracted?: (data: NFEExtracao) => void
  className?: string
}

export function NFEUploader({ onExtracted, className }: NFEUploaderProps) {
  const { isDark } = useTheme()
  const { extractNFE, loading, error } = useLangChainTools()
  
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extraction, setExtraction] = useState<NFEExtracao | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const neuStyles = {
    background: isDark ? '#15192B' : '#F3F4F6',
    cardBg: isDark ? '#1A1F35' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#94A3B8' : '#4B5563',
    textMuted: isDark ? '#64748B' : '#6B7280',
    border: isDark ? '#252B44' : '#D1D5DB',
    shadowElevated: isDark 
      ? '6px 6px 12px rgba(0,0,0,0.4), -4px -4px 10px rgba(255,255,255,0.02)'
      : '6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)',
    shadowInset: isDark
      ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
      : 'inset 3px 3px 6px rgba(0,0,0,0.08), inset -3px -3px 6px rgba(255,255,255,0.8)',
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = ['text/xml', 'application/xml', 'application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xml')) {
      alert('Tipo de arquivo não suportado. Use XML, PDF ou imagem.')
      return
    }

    setSelectedFile(file)
    setExtraction(null)

    // Extract
    const result = await extractNFE(file)
    if (result) {
      setExtraction(result)
      onExtracted?.(result)
    }
  }, [extractNFE, onExtracted])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  const clearFile = () => {
    setSelectedFile(null)
    setExtraction(null)
  }

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-12 h-12" />
    if (selectedFile.name.endsWith('.xml') || selectedFile.type.includes('xml')) {
      return <FileText className="w-12 h-12 text-emerald-500" />
    }
    if (selectedFile.type === 'application/pdf') {
      return <FileText className="w-12 h-12 text-red-500" />
    }
    return <FileImage className="w-12 h-12 text-blue-500" />
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-500'
    if (confidence >= 0.7) return 'text-amber-500'
    return 'text-red-500'
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'xml': return 'XML Parser'
      case 'vision': return 'Claude Vision'
      case 'ocr': return 'OCR Fallback'
      default: return method
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#6366F1]" />
          Importar NF-e
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Drop Zone */}
        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
            dragActive ? 'border-[#6366F1] bg-[#6366F1]/10' : 'border-gray-600/30',
            loading && 'opacity-50 pointer-events-none'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            backgroundColor: dragActive ? (isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)') : neuStyles.cardBg,
            boxShadow: neuStyles.shadowInset
          }}
        >
          <input
            type="file"
            id="nfe-upload"
            className="hidden"
            accept=".xml,application/xml,text/xml,application/pdf,image/*"
            onChange={handleChange}
            disabled={loading}
          />

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin" />
              <p style={{ color: neuStyles.textSecondary }}>Extraindo dados da NF-e...</p>
              <p className="text-xs" style={{ color: neuStyles.textMuted }}>
                Processando com IA para máxima precisão
              </p>
            </div>
          ) : selectedFile && extraction ? (
            <div className="flex flex-col items-center gap-3">
              <Check className="w-12 h-12 text-emerald-500" />
              <p className="font-medium" style={{ color: neuStyles.textPrimary }}>
                NF-e {extraction.numero_nfe} extraída com sucesso!
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className={getConfidenceColor(extraction.confianca)}>
                  {(extraction.confianca * 100).toFixed(0)}% confiança
                </span>
                <span style={{ color: neuStyles.textMuted }}>•</span>
                <span style={{ color: neuStyles.textSecondary }}>
                  {getMethodLabel(extraction.metodo_extracao)}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFile}
                className="mt-2"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              {getFileIcon()}
              <p style={{ color: neuStyles.textPrimary }}>{selectedFile.name}</p>
              <p className="text-sm" style={{ color: neuStyles.textMuted }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <label htmlFor="nfe-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center gap-3" style={{ color: neuStyles.textSecondary }}>
                {getFileIcon()}
                <p>Arraste o arquivo XML, PDF ou imagem aqui</p>
                <p className="text-sm" style={{ color: neuStyles.textMuted }}>
                  ou clique para selecionar
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400">XML</span>
                  <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400">PDF</span>
                  <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">Imagem</span>
                </div>
              </div>
            </label>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Extraction Result */}
        {extraction && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: neuStyles.cardBg,
                boxShadow: neuStyles.shadowElevated
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs" style={{ color: neuStyles.textMuted }}>Número</p>
                  <p className="font-semibold" style={{ color: neuStyles.textPrimary }}>
                    {extraction.numero_nfe}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: neuStyles.textMuted }}>Data Emissão</p>
                  <p className="font-semibold" style={{ color: neuStyles.textPrimary }}>
                    {extraction.data_emissao}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: neuStyles.textMuted }}>Total Itens</p>
                  <p className="font-semibold" style={{ color: neuStyles.textPrimary }}>
                    {extraction.itens.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: neuStyles.textMuted }}>Valor Total</p>
                  <p className="font-semibold text-emerald-500">
                    {formatCurrency(extraction.total.valor_nfe)}
                  </p>
                </div>
              </div>

              {/* Emitente/Destinatário */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t" style={{ borderColor: neuStyles.border }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: neuStyles.textMuted }}>Emitente</p>
                  <p className="text-sm font-medium" style={{ color: neuStyles.textPrimary }}>
                    {extraction.emitente.razao_social}
                  </p>
                  <p className="text-xs" style={{ color: neuStyles.textSecondary }}>
                    CNPJ: {extraction.emitente.cnpj}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: neuStyles.textMuted }}>Destinatário</p>
                  <p className="text-sm font-medium" style={{ color: neuStyles.textPrimary }}>
                    {extraction.destinatario.razao_social}
                  </p>
                  <p className="text-xs" style={{ color: neuStyles.textSecondary }}>
                    CNPJ: {extraction.destinatario.cnpj}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
              style={{
                backgroundColor: neuStyles.cardBg,
                color: neuStyles.textSecondary
              }}
            >
              <span className="text-sm">Ver itens da nota ({extraction.itens.length})</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Items List */}
            {showDetails && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: neuStyles.cardBg,
                  boxShadow: neuStyles.shadowInset
                }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${neuStyles.border}` }}>
                      <th className="text-left p-3" style={{ color: neuStyles.textMuted }}>Descrição</th>
                      <th className="text-center p-3" style={{ color: neuStyles.textMuted }}>Qtd</th>
                      <th className="text-right p-3" style={{ color: neuStyles.textMuted }}>Valor Unit.</th>
                      <th className="text-right p-3" style={{ color: neuStyles.textMuted }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraction.itens.map((item, idx) => (
                      <tr 
                        key={idx}
                        style={{ borderBottom: `1px solid ${neuStyles.border}` }}
                      >
                        <td className="p-3">
                          <p style={{ color: neuStyles.textPrimary }}>{item.descricao}</p>
                          <div className="flex gap-2 mt-1">
                            {item.ncm && (
                              <span className="text-xs px-1.5 py-0.5 rounded" 
                                style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                                NCM: {item.ncm}
                              </span>
                            )}
                            {item.lote && (
                              <span className="text-xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: isDark ? 'rgba(45,212,191,0.2)' : 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
                                Lote: {item.lote}
                              </span>
                            )}
                            {item.registro_anvisa && (
                              <span className="text-xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                                ANVISA: {item.registro_anvisa}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center" style={{ color: neuStyles.textSecondary }}>
                          {item.quantidade} {item.unidade}
                        </td>
                        <td className="p-3 text-right" style={{ color: neuStyles.textSecondary }}>
                          {formatCurrency(item.valor_unitario)}
                        </td>
                        <td className="p-3 text-right font-medium" style={{ color: neuStyles.textPrimary }}>
                          {formatCurrency(item.valor_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Integrar ao Estoque
              </Button>
              <Button variant="secondary" className="gap-2">
                <Eye className="w-4 h-4" />
                Pré-visualizar
              </Button>
              <Button variant="secondary" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NFEUploader

