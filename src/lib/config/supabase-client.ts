import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ ICARUS: Supabase credentials not found in environment variables.\n' +
    'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    global: {
      headers: {
        'x-application-name': 'ICARUS-v5.0'
      }
    }
  }
);

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  hasCredentials: !!(supabaseUrl && supabaseAnonKey),
  isConfigured: !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co')
};

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return supabaseConfig.isConfigured;
}

// Type definitions for database tables (PT-BR)
export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          nome: string;
          cnpj: string;
          endereco: string | null;
          cidade: string | null;
          estado: string | null;
          telefone: string | null;
          email: string | null;
          status: 'ativo' | 'inativo' | 'suspenso';
          criado_em: string;
          atualizado_em: string;
        };
        Insert: Omit<Database['public']['Tables']['empresas']['Row'], 'id' | 'criado_em' | 'atualizado_em'> & {
          id?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: Partial<Database['public']['Tables']['empresas']['Insert']>;
      };
      perfis: {
        Row: {
          id: string;
          empresa_id: string | null;
          nome_completo: string | null;
          email: string | null;
          papel: 'admin' | 'gerente' | 'usuario' | 'visualizador';
          url_avatar: string | null;
          telefone: string | null;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
      };
      categorias_produtos: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          codigo: string | null;
          especialidade: string | null;
          descricao: string | null;
          status: 'ativo' | 'inativo';
          criado_em: string;
          atualizado_em: string;
        };
      };
      fabricantes: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          cnpj: string | null;
          pais: string;
          telefone: string | null;
          email: string | null;
          website: string | null;
          status: 'ativo' | 'inativo';
          criado_em: string;
          atualizado_em: string;
        };
      };
      produtos: {
        Row: {
          id: string;
          empresa_id: string;
          categoria_id: string | null;
          fabricante_id: string | null;
          nome: string;
          codigo: string;
          codigo_anvisa: string | null;
          tipo_produto: 'ortese' | 'protese' | 'material_especial' | 'implante' | null;
          especialidade: string | null;
          descricao: string | null;
          preco_custo: number | null;
          preco_venda: number | null;
          quantidade_estoque: number;
          estoque_minimo: number;
          estoque_maximo: number | null;
          unidade: string;
          status: 'ativo' | 'inativo' | 'descontinuado';
          criado_em: string;
          atualizado_em: string;
        };
        Insert: Omit<Database['public']['Tables']['produtos']['Row'], 'id' | 'criado_em' | 'atualizado_em'> & {
          id?: string;
          quantidade_estoque?: number;
          estoque_minimo?: number;
          unidade?: string;
          status?: 'ativo' | 'inativo' | 'descontinuado';
        };
        Update: Partial<Database['public']['Tables']['produtos']['Insert']>;
      };
      hospitais: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          cnpj: string | null;
          endereco: string | null;
          cidade: string | null;
          estado: string | null;
          telefone: string | null;
          email: string | null;
          tipo_contrato: 'consignacao' | 'compra_direta' | 'ambos' | null;
          status: 'ativo' | 'inativo' | 'suspenso';
          criado_em: string;
          atualizado_em: string;
        };
      };
      medicos: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          crm: string;
          crm_estado: string | null;
          especialidade: string | null;
          telefone: string | null;
          email: string | null;
          hospitais_ids: string[] | null;
          status: 'ativo' | 'inativo';
          criado_em: string;
          atualizado_em: string;
        };
      };
      cirurgias: {
        Row: {
          id: string;
          empresa_id: string;
          hospital_id: string | null;
          medico_id: string | null;
          numero_protocolo: string;
          nome_paciente: string;
          cpf_paciente: string | null;
          nome_procedimento: string;
          codigo_procedimento: string | null;
          data_agendada: string;
          data_realizada: string | null;
          status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';
          valor_estimado: number | null;
          valor_final: number | null;
          observacoes: string | null;
          criado_em: string;
          atualizado_em: string;
        };
      };
      itens_cirurgia: {
        Row: {
          id: string;
          cirurgia_id: string;
          produto_id: string | null;
          quantidade: number;
          preco_unitario: number | null;
          preco_total: number | null;
          tipo_item: 'usado' | 'devolvido' | 'consignado' | null;
          numero_lote: string | null;
          numero_serie: string | null;
          observacoes: string | null;
          criado_em: string;
        };
      };
      notas_fiscais: {
        Row: {
          id: string;
          empresa_id: string;
          cirurgia_id: string | null;
          hospital_id: string | null;
          numero_nota: string;
          tipo_nota: 'nfe' | 'nfse' | 'recibo' | null;
          data_emissao: string;
          data_vencimento: string | null;
          valor_total: number;
          valor_impostos: number;
          valor_desconto: number;
          valor_liquido: number;
          status: 'pendente' | 'aprovada' | 'enviada' | 'paga' | 'cancelada';
          url_xml: string | null;
          url_pdf: string | null;
          observacoes: string | null;
          criado_em: string;
          atualizado_em: string;
        };
      };
      contas_receber: {
        Row: {
          id: string;
          empresa_id: string;
          nota_fiscal_id: string | null;
          hospital_id: string | null;
          descricao: string;
          valor_original: number;
          valor_recebido: number;
          saldo: number;
          data_vencimento: string;
          data_pagamento: string | null;
          status: 'pendente' | 'parcial' | 'paga' | 'vencida' | 'cancelada';
          metodo_pagamento: string | null;
          observacoes: string | null;
          criado_em: string;
          atualizado_em: string;
        };
      };
      movimentacoes_estoque: {
        Row: {
          id: string;
          empresa_id: string;
          produto_id: string;
          tipo_movimentacao: 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'devolucao';
          quantidade: number;
          preco_unitario: number | null;
          preco_total: number | null;
          referencia_id: string | null;
          tipo_referencia: string | null;
          numero_lote: string | null;
          numero_serie: string | null;
          observacoes: string | null;
          criado_por: string | null;
          criado_em: string;
        };
      };
    };
  };
};
