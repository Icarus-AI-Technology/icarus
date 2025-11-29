/**
 * ChatAttachments - Componente de Anexos para ChatWidget
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Suporte a PDF, XML, imagens com OCR via Claude Vision
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Paperclip, X, FileText, Image, FileCode, 
  Loader2, CheckCircle, AlertCircle, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'

export interface AttachedFile {
  id: string
  file: File
  type: 'pdf' | 'image' | 'xml' | 'other'
  preview?: string
  status: 'pending' | 'uploading' | 'ready' | 'error'
  base64?: string
}

interface ChatAttachmentsProps {
  attachments: AttachedFile[]
  onAttach: (files: AttachedFile[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
  maxFiles?: number
  maxSizeMB?: number
}

const FILE_ICONS = {
  pdf: FileText,
  image: Image,
  xml: FileCode,
  other: FileText,
}

const FILE_COLORS = {
  pdf: 'text-red-400',
  image: 'text-cyan-400',
  xml: 'text-emerald-400',
  other: 'text-slate-400',
}

export function ChatAttachments({
  attachments,
  onAttach,
  onRemove,
  disabled = false,
  maxFiles = 5,
  maxSizeMB = 10,
}: ChatAttachmentsProps) {
  const { isDark } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const getFileType = (file: File): AttachedFile['type'] => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
    if (ext === 'xml') return 'xml'
    return 'other'
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
    })
  }

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validações
    if (attachments.length + fileArray.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    const validFiles: AttachedFile[] = []

    for (const file of fileArray) {
      // Validar tamanho
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} excede ${maxSizeMB}MB`)
        continue
      }

      // Validar tipo
      const type = getFileType(file)
      if (type === 'other') {
        toast.warning(`${file.name}: tipo não suportado para OCR`)
      }

      // Criar preview para imagens
      let preview: string | undefined
      if (type === 'image') {
        preview = URL.createObjectURL(file)
      }

      // Converter para base64
      const base64 = await fileToBase64(file)

      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type,
        preview,
        status: 'ready',
        base64,
      })
    }

    if (validFiles.length > 0) {
      onAttach(validFiles)
      toast.success(`${validFiles.length} arquivo(s) anexado(s)`)
    }
  }, [attachments.length, maxFiles, maxSizeMB, onAttach])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [disabled, processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = '' // Reset input
    }
  }, [processFiles])

  const cardBg = isDark ? 'bg-slate-800/70' : 'bg-slate-100'

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-4 transition-all duration-200',
          isDragging 
            ? 'border-violet-500 bg-violet-500/10' 
            : 'border-slate-600 hover:border-slate-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.xml"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div 
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <Upload className={cn(
            'w-8 h-8 transition-colors',
            isDragging ? 'text-violet-400' : 'text-slate-500'
          )} />
          <p className="text-sm text-slate-400 text-center">
            {isDragging 
              ? 'Solte os arquivos aqui'
              : 'Arraste documentos ou clique para anexar'
            }
          </p>
          <p className="text-xs text-slate-500">
            PDF, imagens, XML • Máx {maxSizeMB}MB
          </p>
        </div>
      </div>

      {/* Attached Files List */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {attachments.map((attachment) => {
              const Icon = FILE_ICONS[attachment.type]
              const color = FILE_COLORS[attachment.type]

              return (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl',
                    cardBg
                  )}
                >
                  {/* Preview ou Ícone */}
                  {attachment.preview ? (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.file.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={cn('p-2 rounded-lg', isDark ? 'bg-slate-700' : 'bg-slate-200')}>
                      <Icon className={cn('w-5 h-5', color)} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(attachment.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {attachment.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    )}
                    {attachment.status === 'ready' && (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                    {attachment.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemove(attachment.id)}
                      disabled={disabled}
                      className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Botão de Anexo para o Input do Chat
 */
interface AttachButtonProps {
  onClick: () => void
  hasAttachments: boolean
  disabled?: boolean
}

export function AttachButton({ onClick, hasAttachments, disabled }: AttachButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-2 rounded-lg transition-colors relative',
        hasAttachments 
          ? 'text-violet-400 hover:text-violet-300' 
          : 'text-slate-400 hover:text-slate-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title="Anexar documento"
    >
      <Paperclip className="w-5 h-5" />
      {hasAttachments && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[10px] text-white flex items-center justify-center">
          {hasAttachments ? '!' : ''}
        </span>
      )}
    </button>
  )
}

