/**
 * Tipos do Banco de Dados Supabase - ICARUS v5.0
 * Schema completo para sistema de gestão OPME
 * Idioma: PT-BR
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
      empresas: {
        Row: {
          id: string
          nome: string
          cnpj: string
          plano: 'inicial' | 'profissional' | 'empresarial'
          ativo: boolean
          configuracoes: Json
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          nome: string
          cnpj: string
          plano?: 'inicial' | 'profissional' | 'empresarial'
          ativo?: boolean
          configuracoes?: Json
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          nome?: string
          cnpj?: string
          plano?: 'inicial' | 'profissional' | 'empresarial'
          ativo?: boolean
          configuracoes?: Json
          atualizado_em?: string
        }
      }

      usuarios: {
        Row: {
          id: string
          email: string
          nome_completo: string
          avatar_url: string | null
          papel: 'admin' | 'gerente' | 'usuario' | 'visualizador'
          empresa_id: string
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          email: string
          nome_completo: string
          avatar_url?: string | null
          papel?: 'admin' | 'gerente' | 'usuario' | 'visualizador'
          empresa_id: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          email?: string
          nome_completo?: string
          avatar_url?: string | null
          papel?: 'admin' | 'gerente' | 'usuario' | 'visualizador'
          ativo?: boolean
          atualizado_em?: string
        }
      }

      // ============ PRODUTOS ============
      categorias: {
        Row: {
          id: string
          empresa_id: string
          nome: string
          descricao: string | null
          categoria_pai_id: string | null
          ativo: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nome: string
          descricao?: string | null
          categoria_pai_id?: string | null
          ativo?: boolean
          criado_em?: string
        }
        Update: {
          nome?: string
          descricao?: string | null
          categoria_pai_id?: string | null
          ativo?: boolean
        }
      }

      fornecedores: {
        Row: {
          id: string
          empresa_id: string
          cnpj: string
          razao_social: string
          nome_fantasia: string | null
          contato: string | null
          email: string | null
          telefone: string | null
          endereco: Json
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
          cnpj: string
          razao_social: string
          nome_fantasia?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: Json
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
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
          atualizado_em?: string
        }
      }

      produtos: {
        Row: {
          id: string
          empresa_id: string
          codigo: string
          nome: string
          descricao: string | null
          categoria_id: string | null
          tipo: 'OPME' | 'Consignado' | 'Compra'
          registro_anvisa: string | null
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
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
          codigo: string
          nome: string
          descricao?: string | null
          categoria_id?: string | null
          tipo: 'OPME' | 'Consignado' | 'Compra'
          registro_anvisa?: string | null
          fabricante_id?: string | null
          unidade_medida: string
          preco_custo?: number
          preco_venda?: number
          margem_lucro?: number
          estoque_minimo?: number
          estoque_atual?: number
          ativo?: boolean
          foto_url?: string | null
          metadados?: Json
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          codigo?: string
          nome?: string
          descricao?: string | null
          categoria_id?: string | null
          tipo?: 'OPME' | 'Consignado' | 'Compra'
          registro_anvisa?: string | null
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
          atualizado_em?: string
        }
      }

      // ============ CLIENTES ============
      clientes: {
        Row: {
          id: string
          empresa_id: string
          tipo: 'hospital' | 'clinica' | 'medico'
          cnpj_cpf: string
          nome: string
          razao_social: string | null
          contato: string | null
          email: string | null
          telefone: string | null
          endereco: Json
          limite_credito: number
          credito_disponivel: number
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
          tipo: 'hospital' | 'clinica' | 'medico'
          cnpj_cpf: string
          nome: string
          razao_social?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: Json
          limite_credito?: number
          credito_disponivel?: number
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
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
          limite_credito?: number
          credito_disponivel?: number
          ativo?: boolean
          atualizado_em?: string
        }
      }

      // ============ CIRURGIAS ============
      cirurgias: {
        Row: {
          id: string
          empresa_id: string
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
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
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
          criado_em?: string
          atualizado_em?: string
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
          atualizado_em?: string
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
          criado_em: string
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
          criado_em?: string
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
          empresa_id: string
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
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
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
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          valor?: number
          valor_pago?: number
          data_vencimento?: string
          data_pagamento?: string | null
          status?: 'pendente' | 'pago' | 'vencido' | 'cancelado'
          forma_pagamento?: string | null
          observacoes?: string | null
          atualizado_em?: string
        }
      }

      contas_pagar: {
        Row: {
          id: string
          empresa_id: string
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
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
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
          criado_em?: string
          atualizado_em?: string
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
          atualizado_em?: string
        }
      }

      // ============ ESTOQUE ============
      movimentacoes_estoque: {
        Row: {
          id: string
          empresa_id: string
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
          criado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
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
          criado_em?: string
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
      icarus_previsoes: {
        Row: {
          id: string
          empresa_id: string
          tipo: string
          entidade_id: string | null
          dados_entrada: Json
          dados_previsao: Json
          confianca: number
          criado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
          tipo: string
          entidade_id?: string | null
          dados_entrada: Json
          dados_previsao: Json
          confianca: number
          criado_em?: string
        }
        Update: {
          dados_previsao?: Json
          confianca?: number
        }
      }

      icarus_registros: {
        Row: {
          id: string
          empresa_id: string
          usuario_id: string | null
          acao: string
          tipo_entidade: string | null
          entidade_id: string | null
          detalhes: Json
          endereco_ip: string | null
          navegador: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          empresa_id: string
          usuario_id?: string | null
          acao: string
          tipo_entidade?: string | null
          entidade_id?: string | null
          detalhes?: Json
          endereco_ip?: string | null
          navegador?: string | null
          criado_em?: string
        }
        Update: {
          detalhes?: Json
        }
      }
    }

    Views: {
      produtos_estoque_baixo: {
        Row: {
          id: string
          empresa_id: string
          codigo: string
          nome: string
          estoque_atual: number
          estoque_minimo: number
          deficit: number
          categoria: string | null
        }
      }

      contas_receber_vencidas: {
        Row: {
          id: string
          empresa_id: string
          numero: string
          cliente_id: string
          cliente_nome: string
          valor: number
          valor_pago: number
          saldo_devedor: number
          data_vencimento: string
          dias_vencido: number
        }
      }

      cirurgias_proximas: {
        Row: {
          id: string
          empresa_id: string
          numero: string
          paciente_nome: string
          tipo_cirurgia: string
          data_cirurgia: string
          hospital: string
          medico: string
          valor_total: number
          status: string
        }
      }
    }

    Functions: {
      obter_estatisticas_dashboard: {
        Args: { id_empresa: string }
        Returns: Json
      }
      calcular_valor_estoque: {
        Args: { id_empresa: string }
        Returns: number
      }
    }

    Enums: {
      papel_usuario: 'admin' | 'gerente' | 'usuario' | 'visualizador'
      plano_empresa: 'inicial' | 'profissional' | 'empresarial'
      tipo_produto: 'OPME' | 'Consignado' | 'Compra'
      tipo_cliente: 'hospital' | 'clinica' | 'medico'
      status_cirurgia: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
      status_financeiro: 'pendente' | 'pago' | 'vencido' | 'cancelado'
      tipo_movimentacao: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
    }
  }
}

// Tipos auxiliares para uso na aplicação
export type Empresa = Database['public']['Tables']['empresas']['Row']
export type NovaEmpresa = Database['public']['Tables']['empresas']['Insert']
export type AtualizarEmpresa = Database['public']['Tables']['empresas']['Update']

export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type NovoUsuario = Database['public']['Tables']['usuarios']['Insert']
export type AtualizarUsuario = Database['public']['Tables']['usuarios']['Update']

export type Produto = Database['public']['Tables']['produtos']['Row']
export type NovoProduto = Database['public']['Tables']['produtos']['Insert']
export type AtualizarProduto = Database['public']['Tables']['produtos']['Update']

export type Cliente = Database['public']['Tables']['clientes']['Row']
export type NovoCliente = Database['public']['Tables']['clientes']['Insert']
export type AtualizarCliente = Database['public']['Tables']['clientes']['Update']

export type Cirurgia = Database['public']['Tables']['cirurgias']['Row']
export type NovaCirurgia = Database['public']['Tables']['cirurgias']['Insert']
export type AtualizarCirurgia = Database['public']['Tables']['cirurgias']['Update']

export type ContaReceber = Database['public']['Tables']['contas_receber']['Row']
export type NovaContaReceber = Database['public']['Tables']['contas_receber']['Insert']
export type AtualizarContaReceber = Database['public']['Tables']['contas_receber']['Update']

export type ContaPagar = Database['public']['Tables']['contas_pagar']['Row']
export type NovaContaPagar = Database['public']['Tables']['contas_pagar']['Insert']
export type AtualizarContaPagar = Database['public']['Tables']['contas_pagar']['Update']

export type MovimentacaoEstoque = Database['public']['Tables']['movimentacoes_estoque']['Row']
export type NovaMovimentacaoEstoque = Database['public']['Tables']['movimentacoes_estoque']['Insert']

export type PrevisaoIcarus = Database['public']['Tables']['icarus_previsoes']['Row']
export type NovaPrevisaoIcarus = Database['public']['Tables']['icarus_previsoes']['Insert']

export type RegistroAuditoria = Database['public']['Tables']['icarus_registros']['Row']
export type NovoRegistroAuditoria = Database['public']['Tables']['icarus_registros']['Insert']

// Enums
export type PapelUsuario = Database['public']['Enums']['papel_usuario']
export type PlanoEmpresa = Database['public']['Enums']['plano_empresa']
export type TipoProduto = Database['public']['Enums']['tipo_produto']
export type TipoCliente = Database['public']['Enums']['tipo_cliente']
export type StatusCirurgia = Database['public']['Enums']['status_cirurgia']
export type StatusFinanceiro = Database['public']['Enums']['status_financeiro']
export type TipoMovimentacao = Database['public']['Enums']['tipo_movimentacao']
