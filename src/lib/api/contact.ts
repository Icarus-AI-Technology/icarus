/**
 * Contact API Service - ICARUS v5.0
 * 
 * Simula POST /api/contact (backend ainda não implementado)
 * Valida dados com Zod antes de enviar
 * Integra com Supabase quando disponível
 */
import { z } from 'zod'
import { supabase } from '@/lib/config/supabase-client'

// Schema de validação
export const contactSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .min(5, 'Email é obrigatório'),
  telefone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/.test(val),
      'Telefone inválido (formato: (11) 98765-4321)'
    ),
  mensagem: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),
})

export type ContactFormData = z.infer<typeof contactSchema>

export interface ContactResponse {
  success: boolean
  message: string
  data?: {
    id: string
    created_at: string
  }
}

/**
 * Envia mensagem de contato
 * 
 * @param data - Dados do formulário validados
 * @returns Promise<ContactResponse>
 */
export async function submitContact(data: ContactFormData): Promise<ContactResponse> {
  try {
    // Validar dados com Zod
    const validated = contactSchema.parse(data)

    // TODO: Implementar POST real quando backend estiver pronto
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(validated),
    // })
    // return response.json()

    // SIMULAÇÃO: Salvar no Supabase (opcional)
    const shouldSaveToSupabase = false // Mudar para true quando tabela existir

    if (shouldSaveToSupabase) {
      const { data: savedData, error } = await supabase
        .from('contatos')
        .insert([
          {
            nome: validated.nome,
            email: validated.email,
            telefone: validated.telefone || null,
            mensagem: validated.mensagem,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Erro ao salvar no Supabase:', error)
        throw new Error('Erro ao salvar mensagem')
      }

      return {
        success: true,
        message: 'Mensagem enviada com sucesso!',
        data: {
          id: savedData.id,
          created_at: savedData.created_at,
        },
      }
    }

    // SIMULAÇÃO: Apenas log no console
    console.log('📧 Mensagem de contato:', validated)

    // Simular delay de rede (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: 'Mensagem enviada com sucesso! (simulado)',
      data: {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Dados inválidos: ' + error.errors.map((e) => e.message).join(', '),
      }
    }

    return {
      success: false,
      message: 'Erro ao enviar mensagem. Por favor, tente novamente.',
    }
  }
}

/**
 * Script SQL para criar tabela no Supabase (executar no SQL Editor):
 * 
 * ```sql
 * CREATE TABLE IF NOT EXISTS contatos (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   nome VARCHAR(100) NOT NULL,
 *   email VARCHAR(255) NOT NULL,
 *   telefone VARCHAR(20),
 *   mensagem TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   status VARCHAR(20) DEFAULT 'novo'
 * );
 * 
 * -- Índices
 * CREATE INDEX idx_contatos_email ON contatos(email);
 * CREATE INDEX idx_contatos_created_at ON contatos(created_at DESC);
 * CREATE INDEX idx_contatos_status ON contatos(status);
 * 
 * -- RLS (Row Level Security)
 * ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;
 * 
 * -- Policy para inserção pública (qualquer um pode enviar contato)
 * CREATE POLICY "Permitir inserção pública" ON contatos
 *   FOR INSERT
 *   WITH CHECK (true);
 * 
 * -- Policy para leitura apenas por usuários autenticados
 * CREATE POLICY "Permitir leitura por admins" ON contatos
 *   FOR SELECT
 *   USING (auth.role() = 'authenticated');
 * ```
 */

