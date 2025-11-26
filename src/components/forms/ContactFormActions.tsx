/**
 * ContactFormActions - Formulário de Contato usando React 19 Actions API
 * 
 * Este componente demonstra o uso das novas APIs do React 19:
 * - useActionState: Para gerenciar estado de ações async
 * - useOptimistic: Para updates otimistas
 * - useFormStatus: Para estado de submissão
 * - Actions API: Para mutações de dados
 * 
 * @example
 * ```tsx
 * <ContactFormActions />
 * ```
 */

import React, { useActionState, useOptimistic, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { InputV19, TextareaV19 } from '@/components/ui/InputV19';
import { cn } from '@/lib/utils';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Estado do formulário
interface FormState {
  status: 'idle' | 'success' | 'error';
  message: string;
  errors?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
}

// Dados do formulário
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Action do servidor (simulada - em produção seria uma Server Action)
async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Simular delay de rede
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Extrair dados
  const data: ContactFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    message: formData.get('message') as string,
  };

  // Validação
  const errors: FormState['errors'] = {};

  if (!data.name || data.name.length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email inválido';
  }

  if (data.phone && !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(data.phone)) {
    errors.phone = 'Telefone inválido. Use: (11) 99999-9999';
  }

  if (!data.message || data.message.length < 10) {
    errors.message = 'Mensagem deve ter pelo menos 10 caracteres';
  }

  // Se houver erros, retornar
  if (Object.keys(errors).length > 0) {
    return {
      status: 'error',
      message: 'Por favor, corrija os erros abaixo.',
      errors,
    };
  }

  // Simular salvamento no backend
  try {
    // Em produção, isso seria uma chamada ao Supabase ou API
    console.log('Dados enviados:', data);

    // Simular possível erro (10% de chance)
    if (Math.random() < 0.1) {
      throw new Error('Erro de conexão');
    }

    return {
      status: 'success',
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    };
  } catch {
    return {
      status: 'error',
      message: 'Ocorreu um erro ao enviar. Por favor, tente novamente.',
    };
  }
}

// Botão de submit com estado de loading
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'w-full px-6 py-4 rounded-xl',
        'bg-[#6366F1] text-white font-semibold',
        'shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]',
        'hover:bg-[#4F46E5] hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]',
        'focus:outline-none focus:ring-4 focus:ring-[#6366F1]/30',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2'
      )}
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          Enviar Mensagem
        </>
      )}
    </button>
  );
}

// Mensagem de feedback
function FeedbackMessage({ state }: { state: FormState }) {
  if (state.status === 'idle') return null;

  return (
    <div
      className={cn(
        'p-4 rounded-xl flex items-start gap-3',
        state.status === 'success' && 'bg-[var(--success-color)]/10 text-[var(--success-color)]',
        state.status === 'error' && 'bg-[var(--error-color)]/10 text-[var(--error-color)]'
      )}
    >
      {state.status === 'success' ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      )}
      <span className="text-sm">{state.message}</span>
    </div>
  );
}

/**
 * ContactFormActions - Formulário usando React 19 Actions API
 */
export function ContactFormActions() {
  const formRef = useRef<HTMLFormElement>(null);
  
  // Estado inicial
  const initialState: FormState = {
    status: 'idle',
    message: '',
  };

  // useActionState - Nova API do React 19
  const [state, formAction] = useActionState(submitContactForm, initialState);

  // useOptimistic - Para feedback instantâneo (opcional)
  // Comentado para uso futuro - demonstração da API disponível
  const [_optimisticMessage, _addOptimistic] = useOptimistic(
    state.message,
    (_current, newMessage: string) => newMessage
  );

  // Reset form on success
  React.useEffect(() => {
    if (state.status === 'success' && formRef.current) {
      formRef.current.reset();
    }
  }, [state.status]);

  return (
    <div className={cn(
      'max-w-xl mx-auto p-8 rounded-2xl',
      'bg-[var(--surface-raised)]',
      'shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]'
    )}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Entre em Contato
        </h2>
        <p className="text-[var(--text-secondary)]">
          Preencha o formulário abaixo e nossa equipe entrará em contato.
        </p>
      </div>

      <form 
        ref={formRef}
        action={formAction}
        className="space-y-6"
      >
        <InputV19
          name="name"
          label="Nome Completo"
          placeholder="Seu nome"
          required
          error={state.errors?.name}
          variant="neomorphic"
        />

        <InputV19
          name="email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          required
          error={state.errors?.email}
          variant="neomorphic"
        />

        <InputV19
          name="phone"
          type="tel"
          label="Telefone"
          placeholder="(11) 99999-9999"
          helperText="Opcional"
          error={state.errors?.phone}
          variant="neomorphic"
        />

        <TextareaV19
          name="message"
          label="Mensagem"
          placeholder="Como podemos ajudar?"
          required
          rows={5}
          error={state.errors?.message}
          variant="neomorphic"
        />

        <FeedbackMessage state={state} />

        <SubmitButton />
      </form>

      {/* Badge React 19 */}
      <div className="mt-6 text-center">
        <span className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
          'bg-[#6366F1]/10 text-[#6366F1] text-xs font-medium'
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
          Powered by React 19 Actions API
        </span>
      </div>
    </div>
  );
}

export default ContactFormActions;

