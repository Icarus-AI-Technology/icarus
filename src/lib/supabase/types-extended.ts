/**
 * Supabase Database Types - ICARUS v5.0
 * Extended schema for complete OPME management system
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ============ CORE ============
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'admin' | 'manager' | 'user' | 'viewer'
          tenant_id: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user' | 'viewer'
          tenant_id: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'user' | 'viewer'
          tenant_id?: string
          active?: boolean
          updated_at?: string
        }
      }

      tenants: {
        Row: {
          id: string
          name: string
          cnpj: string
          plan: 'starter' | 'professional' | 'enterprise'
          active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj: string
          plan?: 'starter' | 'professional' | 'enterprise'
          active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          cnpj?: string
          plan?: 'starter' | 'professional' | 'enterprise'
          active?: boolean
          settings?: Json
          updated_at?: string
        }
      }

      // ============ PRODUTOS ============
      produtos: {
        Row: {
          id: string
          tenant_id: string
          codigo: string
          nome: string
          descricao: string | null
          categoria_id: string | null
          tipo: 'OPME' | 'Consignado' | 'Compra'
          anvisa_registro: string | null
          fabricante_id: string | null
          unidade_medida: string
          preco_custo: number
          preco_venda: number
          margem_lucro: number
          estoque_minimo: number
          estoque_atual: number
          ativo: boolean
          foto_url: string | null
          metadados: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          codigo: string
          nome: string
          descricao?: string | null
          categoria_id?: string | null
          tipo: 'OPME' | 'Consignado' | 'Compra'
          anvisa_registro?: string | null
          fabricante_id?: string | null
          unidade_medida: string
          preco_custo: number
          preco_venda: number
          margem_lucro?: number
          estoque_minimo?: number
          estoque_atual?: number
          ativo?: boolean
          foto_url?: string | null
          metadados?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          nome?: string
          descricao?: string | null
          categoria_id?: string | null
          tipo?: 'OPME' | 'Consignado' | 'Compra'
          anvisa_registro?: string | null
          fabricante_id?: string | null
          unidade_medida?: string
          preco_custo?: number
          preco_venda?: number
          margem_lucro?: number
          estoque_minimo?: number
          estoque_atual?: number
          ativo?: boolean
          foto_url?: string | null
          metadados?: Json
          updated_at?: string
        }
      }

      categorias: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          descricao: string | null
          parent_id: string | null
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nome: string
          descricao?: string | null
          parent_id?: string | null
          ativo?: boolean
          created_at?: string
        }
        Update: {
          nome?: string
          descricao?: string | null
          parent_id?: string | null
          ativo?: boolean
        }
      }

      // ============ CLIENTES ============
      clientes: {
        Row: {
          id: string
          tenant_id: string
          tipo: 'hospital' | 'clinica' | 'medico'
          cnpj_cpf: string
          nome: string
          razao_social: string | null
          contato: string | null
          email: string | null
          telefone: string | null
          endereco: Json
          credito_limite: number
          credito_disponivel: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          tipo: 'hospital' | 'clinica' | 'medico'
          cnpj_cpf: string
          nome: string
          razao_social?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: Json
          credito_limite?: number
          credito_disponivel?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          tipo?: 'hospital' | 'clinica' | 'medico'
          cnpj_cpf?: string
          nome?: string
          razao_social?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: Json
          credito_limite?: number
          credito_disponivel?: number
          ativo?: boolean
          updated_at?: string
        }
      }

      // ============ CIRURGIAS ============
      cirurgias: {
        Row: {
          id: string
          tenant_id: string
          numero: string
          paciente_nome: string
          paciente_cpf: string | null
          hospital_id: string
          medico_id: string
          tipo_cirurgia: string
          data_cirurgia: string
          status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
          valor_total: number
          observacoes: string | null
          metadados: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          numero: string
          paciente_nome: string
          paciente_cpf?: string | null
          hospital_id: string
          medico_id: string
          tipo_cirurgia: string
          data_cirurgia: string
          status?: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
          valor_total?: number
          observacoes?: string | null
          metadados?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          numero?: string
          paciente_nome?: string
          paciente_cpf?: string | null
          hospital_id?: string
          medico_id?: string
          tipo_cirurgia?: string
          data_cirurgia?: string
          status?: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
          valor_total?: number
          observacoes?: string | null
          metadados?: Json
          updated_at?: string
        }
      }

      cirurgias_produtos: {
        Row: {
          id: string
          cirurgia_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          preco_total: number
          lote: string | null
          validade: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cirurgia_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          preco_total: number
          lote?: string | null
          validade?: string | null
          created_at?: string
        }
        Update: {
          quantidade?: number
          preco_unitario?: number
          preco_total?: number
          lote?: string | null
          validade?: string | null
        }
      }

      // ============ FINANCEIRO ============
      contas_receber: {
        Row: {
          id: string
          tenant_id: string
          numero: string
          cliente_id: string
          cirurgia_id: string | null
          valor: number
          valor_pago: number
          data_emissao: string
          data_vencimento: string
          data_pagamento: string | null
          status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          numero: string
          cliente_id: string
          cirurgia_id?: string | null
          valor: number
          valor_pago?: number
          data_emissao: string
          data_vencimento: string
          data_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          valor?: number
          valor_pago?: number
          data_vencimento?: string
          data_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento?: string | null
          observacoes?: string | null
          updated_at?: string
        }
      }

      contas_pagar: {
        Row: {
          id: string
          tenant_id: string
          numero: string
          fornecedor_id: string
          valor: number
          valor_pago: number
          data_emissao: string
          data_vencimento: string
          data_pagamento: string | null
          status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento: string | null
          categoria: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          numero: string
          fornecedor_id: string
          valor: number
          valor_pago?: number
          data_emissao: string
          data_vencimento: string
          data_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento?: string | null
          categoria?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          valor?: number
          valor_pago?: number
          data_vencimento?: string
          data_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento?: string | null
          categoria?: string | null
          observacoes?: string | null
          updated_at?: string
        }
      }

      // ============ FORNECEDORES ============
      fornecedores: {
        Row: {
          id: string
          tenant_id: string
          cnpj: string
          razao_social: string
          nome_fantasia: string | null
          contato: string | null
          email: string | null
          telefone: string | null
          endereco: Json
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          cnpj: string
          razao_social: string
          nome_fantasia?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: Json
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          cnpj?: string
          razao_social?: string
          nome_fantasia?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: Json
          ativo?: boolean
          updated_at?: string
        }
      }

      // ============ ESTOQUE ============
      movimentacoes_estoque: {
        Row: {
          id: string
          tenant_id: string
          produto_id: string
          tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
          quantidade: number
          valor_unitario: number
          valor_total: number
          lote: string | null
          validade: string | null
          origem: string | null
          destino: string | null
          referencia_id: string | null
          observacoes: string | null
          usuario_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          produto_id: string
          tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
          quantidade: number
          valor_unitario: number
          valor_total: number
          lote?: string | null
          validade?: string | null
          origem?: string | null
          destino?: string | null
          referencia_id?: string | null
          observacoes?: string | null
          usuario_id: string
          created_at?: string
        }
        Update: {
          quantidade?: number
          valor_unitario?: number
          valor_total?: number
          lote?: string | null
          validade?: string | null
          observacoes?: string | null
        }
      }

      // ============ ANALYTICS / IA ============
      icarus_predictions: {
        Row: {
          id: string
          tenant_id: string
          tipo: string
          entidade_id: string | null
          input_data: Json
          prediction_data: Json
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          tipo: string
          entidade_id?: string | null
          input_data: Json
          prediction_data: Json
          confidence: number
          created_at?: string
        }
        Update: {
          prediction_data?: Json
          confidence?: number
        }
      }

      icarus_logs: {
        Row: {
          id: string
          tenant_id: string
          usuario_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          usuario_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          details?: Json
        }
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      get_dashboard_stats: {
        Args: { tenant_id: string }
        Returns: Json
      }
      calculate_inventory_value: {
        Args: { tenant_id: string }
        Returns: number
      }
    }

    Enums: {
      user_role: 'admin' | 'manager' | 'user' | 'viewer'
      tenant_plan: 'starter' | 'professional' | 'enterprise'
      produto_tipo: 'OPME' | 'Consignado' | 'Compra'
      cliente_tipo: 'hospital' | 'clinica' | 'medico'
      cirurgia_status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
      financeiro_status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
      estoque_tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
    }
  }
}
