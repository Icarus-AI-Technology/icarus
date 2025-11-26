/**
 * ConfirmModal - Modal de confirmação usando HeroUI
 * 
 * Modal reutilizável para confirmações de ações críticas.
 * Integrado com OraclusX Design System.
 * 
 * @example
 * ```tsx
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Excluir Produto"
 *   message="Tem certeza que deseja excluir este produto?"
 *   confirmLabel="Excluir"
 *   variant="danger"
 * />
 * ```
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ConfirmModalProps {
  /** Se o modal está aberto */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback quando confirmado */
  onConfirm: () => void | Promise<void>;
  /** Título do modal */
  title: string;
  /** Mensagem/conteúdo do modal */
  message: React.ReactNode;
  /** Label do botão de confirmação */
  confirmLabel?: string;
  /** Label do botão de cancelamento */
  cancelLabel?: string;
  /** Variante visual */
  variant?: ModalVariant;
  /** Se está processando */
  isLoading?: boolean;
  /** Tamanho do modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Desabilitar fechamento ao clicar fora */
  isDismissable?: boolean;
  /** Mostrar botão de fechar */
  showCloseButton?: boolean;
}

const variantConfig: Record<ModalVariant, {
  icon: typeof Info;
  iconColor: string;
  confirmColor: 'primary' | 'success' | 'warning' | 'danger';
  bgGradient: string;
}> = {
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    confirmColor: 'primary',
    bgGradient: 'from-blue-500/10 to-transparent',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-[var(--success-color)]',
    confirmColor: 'success',
    bgGradient: 'from-green-500/10 to-transparent',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-[var(--warning-color)]',
    confirmColor: 'warning',
    bgGradient: 'from-amber-500/10 to-transparent',
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-[var(--error-color)]',
    confirmColor: 'danger',
    bgGradient: 'from-red-500/10 to-transparent',
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
  isLoading = false,
  size = 'md',
  isDismissable = true,
  showCloseButton = true,
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isDismissable={isDismissable && !isLoading}
      hideCloseButton={!showCloseButton}
      backdrop="blur"
      classNames={{
        wrapper: 'z-[100]',
        backdrop: 'bg-black/50',
        base: cn(
          'bg-[var(--surface-raised)]',
          'border border-[var(--border-default)]',
          'shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]'
        ),
        header: 'border-b border-[var(--border-default)]',
        body: 'py-6',
        footer: 'border-t border-[var(--border-default)]',
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-full bg-gradient-to-br',
                config.bgGradient
              )}>
                <Icon className={cn('w-5 h-5', config.iconColor)} />
              </div>
              <span className="text-[var(--text-primary)] font-semibold">
                {title}
              </span>
            </ModalHeader>
            
            <ModalBody>
              <div className="text-[var(--text-secondary)]">
                {message}
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button
                variant="flat"
                onPress={onCloseModal}
                isDisabled={isLoading}
                className="bg-[var(--surface-inset)]"
              >
                {cancelLabel}
              </Button>
              <Button
                color={config.confirmColor}
                onPress={handleConfirm}
                isLoading={isLoading}
                className={cn(
                  config.confirmColor === 'primary' && 'bg-[#6366F1] text-white',
                  config.confirmColor === 'danger' && 'bg-[var(--error-color)] text-white'
                )}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/**
 * FormModal - Modal para formulários usando HeroUI
 * 
 * Modal genérico para formulários com suporte a validação.
 */
export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  title: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isValid?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  size = 'lg',
  isValid = true,
}: FormModalProps) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isDismissable={!isLoading}
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        wrapper: 'z-[100]',
        backdrop: 'bg-black/50',
        base: cn(
          'bg-[var(--surface-raised)]',
          'border border-[var(--border-default)]',
          'shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]',
          'max-h-[90vh]'
        ),
        header: 'border-b border-[var(--border-default)]',
        body: 'py-6',
        footer: 'border-t border-[var(--border-default)]',
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader>
              <span className="text-[var(--text-primary)] font-semibold">
                {title}
              </span>
            </ModalHeader>
            
            <ModalBody>
              {children}
            </ModalBody>
            
            <ModalFooter>
              <Button
                variant="flat"
                onPress={onCloseModal}
                isDisabled={isLoading}
                className="bg-[var(--surface-inset)]"
              >
                {cancelLabel}
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
                isDisabled={!isValid}
                className="bg-[#6366F1] text-white"
              >
                {submitLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ConfirmModal;
