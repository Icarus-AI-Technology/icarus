import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeuButton } from './neu-button';

export interface NeuModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

/**
 * NeuModal - Neumorphic Modal Component
 *
 * A modal dialog with neumorphic design following ICARUS OraclusX patterns.
 * Supports multiple sizes, custom footers, and overlay interactions.
 *
 * @example
 * // Basic modal
 * <NeuModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar ação"
 *   description="Tem certeza que deseja continuar?"
 * >
 *   <p>Conteúdo do modal</p>
 * </NeuModal>
 *
 * @example
 * // Modal with custom footer
 * <NeuModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Editar Produto"
 *   size="lg"
 *   footer={
 *     <div className="flex gap-3 justify-end">
 *       <NeuButton variant="secondary" onClick={handleCancel}>
 *         Cancelar
 *       </NeuButton>
 *       <NeuButton variant="primary" onClick={handleSave}>
 *         Salvar
 *       </NeuButton>
 *     </div>
 *   }
 * >
 *   <form>...</form>
 * </NeuModal>
 */
export const NeuModal: React.FC<NeuModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full bg-gradient-to-br from-white to-gray-50',
          'rounded-2xl',
          'shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,1)]',
          'max-h-[90vh] overflow-hidden flex flex-col',
          'animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm text-gray-600"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'ml-4 p-2 rounded-xl text-gray-400 hover:text-gray-600',
                  'transition-all duration-200',
                  'shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)]',
                  'hover:shadow-[6px_6px_12px_rgba(0,0,0,0.12),-6px_-6px_12px_rgba(255,255,255,0.95)]',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-200 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

NeuModal.displayName = 'NeuModal';
