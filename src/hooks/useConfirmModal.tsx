/**
 * useConfirmModal - Hook para usar o modal de confirmação
 * 
 * @example
 * ```tsx
 * const { confirm, ConfirmModalComponent } = useConfirmModal();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Excluir',
 *     message: 'Tem certeza?',
 *     variant: 'danger',
 *   });
 *   
 *   if (confirmed) {
 *     await deleteItem();
 *   }
 * };
 * 
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Excluir</Button>
 *     {ConfirmModalComponent}
 *   </>
 * );
 * ```
 */

import React, { useState, useCallback, useRef } from 'react';
import { ConfirmModal, type ConfirmModalProps } from '@/components/ui/heroui/ConfirmModal';

interface ModalState {
  isOpen: boolean;
  config: Omit<ConfirmModalProps, 'isOpen' | 'onClose' | 'onConfirm'>;
}

export function useConfirmModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    config: { title: '', message: '' },
  });
  
  // Usar ref para o resolver para evitar problemas de closure
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (config: Omit<ConfirmModalProps, 'isOpen' | 'onClose' | 'onConfirm'>): Promise<boolean> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setModalState({
          isOpen: true,
          config,
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmModalComponent = (
    <ConfirmModal
      isOpen={modalState.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...modalState.config}
    />
  );

  return { confirm, ConfirmModalComponent };
}

export default useConfirmModal;

