/**
 * Tipos TypeScript gerados a partir do schema Supabase
 * ICARUS v5.0 - Schema PT-BR
 *
 * Todas as tabelas e campos estão em português brasileiro
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
      // =====================================================
      // TABELA: empresas (Distribuidoras OPME)
      // =====================================================
      empresas: {
        Row: {
          id: string
          nome: string
          razao_social: string | null
          cnpj: string
          inscricao_estadual: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          telefone: string | null
          email: string | null
          site: string | null
          status: 'ativo' | 'inativo' | 'suspenso'
          configuracoes: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          razao_social?: string | null
          cnpj: string
          inscricao_estadual?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          telefone?: string | null
          email?: string | null
          site?: string | null
          status?: 'ativo' | 'inativo' | 'suspenso'
          configuracoes?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          razao_social?: string | null
          cnpj?: string
          inscricao_estadual?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          telefone?: string | null
          email?: string | null
          site?: string | null
          status?: 'ativo' | 'inativo' | 'suspenso'
          configuracoes?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: perfis (Perfis de Usuários)
      // =====================================================
      perfis: {
        Row: {
          id: string
          empresa_id: string | null
          nome_completo: string
          email: string
          cargo: 'admin' | 'gerente' | 'vendedor' | 'usuario' | 'visualizador'
          avatar_url: string | null
          telefone: string | null
          celular: string | null
          departamento: string | null
          permissoes: Json
          ativo: boolean
          ultimo_acesso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          empresa_id?: string | null
          nome_completo: string
          email: string
          cargo?: 'admin' | 'gerente' | 'vendedor' | 'usuario' | 'visualizador'
          avatar_url?: string | null
          telefone?: string | null
          celular?: string | null
          departamento?: string | null
          permissoes?: Json
          ativo?: boolean
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          nome_completo?: string
          email?: string
          cargo?: 'admin' | 'gerente' | 'vendedor' | 'usuario' | 'visualizador'
          avatar_url?: string | null
          telefone?: string | null
          celular?: string | null
          departamento?: string | null
          permissoes?: Json
          ativo?: boolean
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: categorias_produtos (Categorias OPME)
      // =====================================================
      categorias_produtos: {
        Row: {
          id: string
          empresa_id: string | null
          nome: string
          codigo: string | null
          especialidade: string | null
          descricao: string | null
          parent_id: string | null
          ordem: number
          status: 'ativo' | 'inativo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          nome: string
          codigo?: string | null
          especialidade?: string | null
          descricao?: string | null
          parent_id?: string | null
          ordem?: number
          status?: 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          nome?: string
          codigo?: string | null
          especialidade?: string | null
          descricao?: string | null
          parent_id?: string | null
          ordem?: number
          status?: 'ativo' | 'inativo'
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: fabricantes (Fabricantes de OPME)
      // =====================================================
      fabricantes: {
        Row: {
          id: string
          empresa_id: string | null
          nome: string
          razao_social: string | null
          cnpj: string | null
          pais: string
          endereco: string | null
          cidade: string | null
          estado: string | null
          telefone: string | null
          email: string | null
          site: string | null
          contato_principal: string | null
          status: 'ativo' | 'inativo'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          nome: string
          razao_social?: string | null
          cnpj?: string | null
          pais?: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          telefone?: string | null
          email?: string | null
          site?: string | null
          contato_principal?: string | null
          status?: 'ativo' | 'inativo'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          nome?: string
          razao_social?: string | null
          cnpj?: string | null
          pais?: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          telefone?: string | null
          email?: string | null
          site?: string | null
          contato_principal?: string | null
          status?: 'ativo' | 'inativo'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: produtos (Produtos OPME)
      // =====================================================
      produtos: {
        Row: {
          id: string
          empresa_id: string | null
          categoria_id: string | null
          fabricante_id: string | null
          nome: string
          codigo: string
          codigo_barras: string | null
          registro_anvisa: string | null
          tipo_produto: 'ortese' | 'protese' | 'material_especial' | 'implante' | 'instrumental' | null
          especialidade: string | null
          descricao: string | null
          especificacoes: Json
          preco_custo: number | null
          preco_venda: number
          margem_lucro: number | null
          estoque_atual: number
          estoque_minimo: number
          estoque_maximo: number | null
          ponto_reposicao: number | null
          unidade_medida: string
          controla_lote: boolean
          controla_validade: boolean
          controla_serie: boolean
          imagem_url: string | null
          imagens_adicionais: string[] | null
          tags: string[] | null
          status: 'ativo' | 'inativo' | 'descontinuado'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          categoria_id?: string | null
          fabricante_id?: string | null
          nome: string
          codigo: string
          codigo_barras?: string | null
          registro_anvisa?: string | null
          tipo_produto?: 'ortese' | 'protese' | 'material_especial' | 'implante' | 'instrumental' | null
          especialidade?: string | null
          descricao?: string | null
          especificacoes?: Json
          preco_custo?: number | null
          preco_venda: number
          margem_lucro?: number | null
          estoque_atual?: number
          estoque_minimo?: number
          estoque_maximo?: number | null
          ponto_reposicao?: number | null
          unidade_medida?: string
          controla_lote?: boolean
          controla_validade?: boolean
          controla_serie?: boolean
          imagem_url?: string | null
          imagens_adicionais?: string[] | null
          tags?: string[] | null
          status?: 'ativo' | 'inativo' | 'descontinuado'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          categoria_id?: string | null
          fabricante_id?: string | null
          nome?: string
          codigo?: string
          codigo_barras?: string | null
          registro_anvisa?: string | null
          tipo_produto?: 'ortese' | 'protese' | 'material_especial' | 'implante' | 'instrumental' | null
          especialidade?: string | null
          descricao?: string | null
          especificacoes?: Json
          preco_custo?: number | null
          preco_venda?: number
          margem_lucro?: number | null
          estoque_atual?: number
          estoque_minimo?: number
          estoque_maximo?: number | null
          ponto_reposicao?: number | null
          unidade_medida?: string
          controla_lote?: boolean
          controla_validade?: boolean
          controla_serie?: boolean
          imagem_url?: string | null
          imagens_adicionais?: string[] | null
          tags?: string[] | null
          status?: 'ativo' | 'inativo' | 'descontinuado'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: hospitais (Hospitais Clientes)
      // =====================================================
      hospitais: {
        Row: {
          id: string
          empresa_id: string | null
          nome: string
          razao_social: string | null
          cnpj: string | null
          inscricao_estadual: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          telefone: string | null
          email: string | null
          site: string | null
          contato_principal: string | null
          cargo_contato: string | null
          email_contato: string | null
          telefone_contato: string | null
          tipo_hospital: string | null
          numero_leitos: number | null
          especialidades: string[] | null
          convenios: string[] | null
          status: 'ativo' | 'inativo' | 'prospecto'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          nome: string
          razao_social?: string | null
          cnpj?: string | null
          inscricao_estadual?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          telefone?: string | null
          email?: string | null
          site?: string | null
          contato_principal?: string | null
          cargo_contato?: string | null
          email_contato?: string | null
          telefone_contato?: string | null
          tipo_hospital?: string | null
          numero_leitos?: number | null
          especialidades?: string[] | null
          convenios?: string[] | null
          status?: 'ativo' | 'inativo' | 'prospecto'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          nome?: string
          razao_social?: string | null
          cnpj?: string | null
          inscricao_estadual?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          telefone?: string | null
          email?: string | null
          site?: string | null
          contato_principal?: string | null
          cargo_contato?: string | null
          email_contato?: string | null
          telefone_contato?: string | null
          tipo_hospital?: string | null
          numero_leitos?: number | null
          especialidades?: string[] | null
          convenios?: string[] | null
          status?: 'ativo' | 'inativo' | 'prospecto'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: medicos (Médicos Cirurgiões)
      // =====================================================
      medicos: {
        Row: {
          id: string
          empresa_id: string | null
          hospital_id: string | null
          nome_completo: string
          crm: string
          crm_estado: string
          cpf: string | null
          especialidade: string | null
          subespecialidade: string | null
          telefone: string | null
          celular: string | null
          email: string | null
          data_nascimento: string | null
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          banco: string | null
          agencia: string | null
          conta: string | null
          pix: string | null
          status: 'ativo' | 'inativo'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          hospital_id?: string | null
          nome_completo: string
          crm: string
          crm_estado: string
          cpf?: string | null
          especialidade?: string | null
          subespecialidade?: string | null
          telefone?: string | null
          celular?: string | null
          email?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          banco?: string | null
          agencia?: string | null
          conta?: string | null
          pix?: string | null
          status?: 'ativo' | 'inativo'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          hospital_id?: string | null
          nome_completo?: string
          crm?: string
          crm_estado?: string
          cpf?: string | null
          especialidade?: string | null
          subespecialidade?: string | null
          telefone?: string | null
          celular?: string | null
          email?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          banco?: string | null
          agencia?: string | null
          conta?: string | null
          pix?: string | null
          status?: 'ativo' | 'inativo'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: cirurgias (Cirurgias/Procedimentos)
      // =====================================================
      cirurgias: {
        Row: {
          id: string
          empresa_id: string | null
          numero_cirurgia: string
          hospital_id: string | null
          medico_id: string | null
          paciente_nome: string
          paciente_cpf: string | null
          paciente_convenio: string | null
          paciente_carteirinha: string | null
          procedimento: string
          cid: string | null
          data_cirurgia: string
          hora_inicio: string | null
          hora_fim: string | null
          sala_cirurgica: string | null
          status_cirurgia: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada'
          status_faturamento: 'pendente' | 'em_faturamento' | 'faturado' | 'pago'
          valor_total: number
          valor_hospital: number | null
          valor_medico: number | null
          observacoes: string | null
          documentos: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          numero_cirurgia: string
          hospital_id?: string | null
          medico_id?: string | null
          paciente_nome: string
          paciente_cpf?: string | null
          paciente_convenio?: string | null
          paciente_carteirinha?: string | null
          procedimento: string
          cid?: string | null
          data_cirurgia: string
          hora_inicio?: string | null
          hora_fim?: string | null
          sala_cirurgica?: string | null
          status_cirurgia?: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada'
          status_faturamento?: 'pendente' | 'em_faturamento' | 'faturado' | 'pago'
          valor_total: number
          valor_hospital?: number | null
          valor_medico?: number | null
          observacoes?: string | null
          documentos?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          numero_cirurgia?: string
          hospital_id?: string | null
          medico_id?: string | null
          paciente_nome?: string
          paciente_cpf?: string | null
          paciente_convenio?: string | null
          paciente_carteirinha?: string | null
          procedimento?: string
          cid?: string | null
          data_cirurgia?: string
          hora_inicio?: string | null
          hora_fim?: string | null
          sala_cirurgica?: string | null
          status_cirurgia?: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada'
          status_faturamento?: 'pendente' | 'em_faturamento' | 'faturado' | 'pago'
          valor_total?: number
          valor_hospital?: number | null
          valor_medico?: number | null
          observacoes?: string | null
          documentos?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: itens_cirurgia (Itens/Materiais por Cirurgia)
      // =====================================================
      itens_cirurgia: {
        Row: {
          id: string
          cirurgia_id: string | null
          produto_id: string | null
          nome_produto: string
          codigo_produto: string | null
          quantidade: number
          valor_unitario: number
          valor_total: number
          lote: string | null
          validade: string | null
          numero_serie: string | null
          status_item: 'solicitado' | 'separado' | 'entregue' | 'utilizado' | 'devolvido'
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cirurgia_id?: string | null
          produto_id?: string | null
          nome_produto: string
          codigo_produto?: string | null
          quantidade: number
          valor_unitario: number
          valor_total: number
          lote?: string | null
          validade?: string | null
          numero_serie?: string | null
          status_item?: 'solicitado' | 'separado' | 'entregue' | 'utilizado' | 'devolvido'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cirurgia_id?: string | null
          produto_id?: string | null
          nome_produto?: string
          codigo_produto?: string | null
          quantidade?: number
          valor_unitario?: number
          valor_total?: number
          lote?: string | null
          validade?: string | null
          numero_serie?: string | null
          status_item?: 'solicitado' | 'separado' | 'entregue' | 'utilizado' | 'devolvido'
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: notas_fiscais (Notas Fiscais)
      // =====================================================
      notas_fiscais: {
        Row: {
          id: string
          empresa_id: string | null
          cirurgia_id: string | null
          hospital_id: string | null
          numero_nf: string
          serie_nf: string
          tipo_nf: 'entrada' | 'saida' | 'servico'
          modelo_nf: string | null
          chave_acesso: string | null
          data_emissao: string
          data_saida: string | null
          natureza_operacao: string | null
          cfop: string | null
          valor_produtos: number
          valor_servicos: number | null
          valor_desconto: number | null
          valor_frete: number | null
          valor_seguro: number | null
          valor_outras_despesas: number | null
          valor_icms: number | null
          valor_ipi: number | null
          valor_pis: number | null
          valor_cofins: number | null
          valor_iss: number | null
          valor_total: number
          status_nf: 'rascunho' | 'emitida' | 'autorizada' | 'cancelada' | 'denegada'
          protocolo_autorizacao: string | null
          data_autorizacao: string | null
          mensagem_retorno: string | null
          xml_nfe: string | null
          pdf_danfe: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          cirurgia_id?: string | null
          hospital_id?: string | null
          numero_nf: string
          serie_nf: string
          tipo_nf: 'entrada' | 'saida' | 'servico'
          modelo_nf?: string | null
          chave_acesso?: string | null
          data_emissao: string
          data_saida?: string | null
          natureza_operacao?: string | null
          cfop?: string | null
          valor_produtos: number
          valor_servicos?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_seguro?: number | null
          valor_outras_despesas?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_pis?: number | null
          valor_cofins?: number | null
          valor_iss?: number | null
          valor_total: number
          status_nf?: 'rascunho' | 'emitida' | 'autorizada' | 'cancelada' | 'denegada'
          protocolo_autorizacao?: string | null
          data_autorizacao?: string | null
          mensagem_retorno?: string | null
          xml_nfe?: string | null
          pdf_danfe?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          cirurgia_id?: string | null
          hospital_id?: string | null
          numero_nf?: string
          serie_nf?: string
          tipo_nf?: 'entrada' | 'saida' | 'servico'
          modelo_nf?: string | null
          chave_acesso?: string | null
          data_emissao?: string
          data_saida?: string | null
          natureza_operacao?: string | null
          cfop?: string | null
          valor_produtos?: number
          valor_servicos?: number | null
          valor_desconto?: number | null
          valor_frete?: number | null
          valor_seguro?: number | null
          valor_outras_despesas?: number | null
          valor_icms?: number | null
          valor_ipi?: number | null
          valor_pis?: number | null
          valor_cofins?: number | null
          valor_iss?: number | null
          valor_total?: number
          status_nf?: 'rascunho' | 'emitida' | 'autorizada' | 'cancelada' | 'denegada'
          protocolo_autorizacao?: string | null
          data_autorizacao?: string | null
          mensagem_retorno?: string | null
          xml_nfe?: string | null
          pdf_danfe?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: contas_receber (Contas a Receber)
      // =====================================================
      contas_receber: {
        Row: {
          id: string
          empresa_id: string | null
          cirurgia_id: string | null
          hospital_id: string | null
          nota_fiscal_id: string | null
          numero_duplicata: string | null
          descricao: string
          valor_original: number
          valor_desconto: number | null
          valor_juros: number | null
          valor_multa: number | null
          valor_pago: number | null
          valor_saldo: number
          data_emissao: string
          data_vencimento: string
          data_pagamento: string | null
          forma_pagamento: string | null
          status_recebimento: 'aberto' | 'vencido' | 'pago_parcial' | 'pago' | 'cancelado'
          banco_destino: string | null
          agencia_destino: string | null
          conta_destino: string | null
          comprovante_url: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          cirurgia_id?: string | null
          hospital_id?: string | null
          nota_fiscal_id?: string | null
          numero_duplicata?: string | null
          descricao: string
          valor_original: number
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_pago?: number | null
          valor_saldo: number
          data_emissao: string
          data_vencimento: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          status_recebimento?: 'aberto' | 'vencido' | 'pago_parcial' | 'pago' | 'cancelado'
          banco_destino?: string | null
          agencia_destino?: string | null
          conta_destino?: string | null
          comprovante_url?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          cirurgia_id?: string | null
          hospital_id?: string | null
          nota_fiscal_id?: string | null
          numero_duplicata?: string | null
          descricao?: string
          valor_original?: number
          valor_desconto?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_pago?: number | null
          valor_saldo?: number
          data_emissao?: string
          data_vencimento?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          status_recebimento?: 'aberto' | 'vencido' | 'pago_parcial' | 'pago' | 'cancelado'
          banco_destino?: string | null
          agencia_destino?: string | null
          conta_destino?: string | null
          comprovante_url?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // =====================================================
      // TABELA: movimentacoes_estoque (Movimentações de Estoque)
      // =====================================================
      movimentacoes_estoque: {
        Row: {
          id: string
          empresa_id: string | null
          produto_id: string | null
          tipo_movimentacao: 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'devolucao'
          quantidade: number
          valor_unitario: number | null
          valor_total: number | null
          lote: string | null
          validade: string | null
          numero_serie: string | null
          referencia_id: string | null
          referencia_tipo: string | null
          observacoes: string | null
          usuario_id: string | null
          data_movimentacao: string
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id?: string | null
          produto_id?: string | null
          tipo_movimentacao: 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'devolucao'
          quantidade: number
          valor_unitario?: number | null
          valor_total?: number | null
          lote?: string | null
          validade?: string | null
          numero_serie?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          observacoes?: string | null
          usuario_id?: string | null
          data_movimentacao?: string
          created_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          produto_id?: string | null
          tipo_movimentacao?: 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'devolucao'
          quantidade?: number
          valor_unitario?: number | null
          valor_total?: number | null
          lote?: string | null
          validade?: string | null
          numero_serie?: string | null
          referencia_id?: string | null
          referencia_tipo?: string | null
          observacoes?: string | null
          usuario_id?: string | null
          data_movimentacao?: string
          created_at?: string
        }
      }

      // =====================================================
      // TABELA: leads (Leads/Prospects)
      // =====================================================
      leads: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          empresa: string | null
          cargo: string | null
          mensagem: string | null
          origem: string | null
          status: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'descartado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone?: string | null
          empresa?: string | null
          cargo?: string | null
          mensagem?: string | null
          origem?: string | null
          status?: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'descartado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          empresa?: string | null
          cargo?: string | null
          mensagem?: string | null
          origem?: string | null
          status?: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'descartado'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types para facilitar uso
export type Empresa = Database['public']['Tables']['empresas']['Row']
export type EmpresaInsert = Database['public']['Tables']['empresas']['Insert']
export type EmpresaUpdate = Database['public']['Tables']['empresas']['Update']

export type Perfil = Database['public']['Tables']['perfis']['Row']
export type PerfilInsert = Database['public']['Tables']['perfis']['Insert']
export type PerfilUpdate = Database['public']['Tables']['perfis']['Update']

export type CategoriaProduto = Database['public']['Tables']['categorias_produtos']['Row']
export type CategoriaProdutoInsert = Database['public']['Tables']['categorias_produtos']['Insert']
export type CategoriaProdutoUpdate = Database['public']['Tables']['categorias_produtos']['Update']

export type Fabricante = Database['public']['Tables']['fabricantes']['Row']
export type FabricanteInsert = Database['public']['Tables']['fabricantes']['Insert']
export type FabricanteUpdate = Database['public']['Tables']['fabricantes']['Update']

export type Produto = Database['public']['Tables']['produtos']['Row']
export type ProdutoInsert = Database['public']['Tables']['produtos']['Insert']
export type ProdutoUpdate = Database['public']['Tables']['produtos']['Update']

export type Hospital = Database['public']['Tables']['hospitais']['Row']
export type HospitalInsert = Database['public']['Tables']['hospitais']['Insert']
export type HospitalUpdate = Database['public']['Tables']['hospitais']['Update']

export type Medico = Database['public']['Tables']['medicos']['Row']
export type MedicoInsert = Database['public']['Tables']['medicos']['Insert']
export type MedicoUpdate = Database['public']['Tables']['medicos']['Update']

export type Cirurgia = Database['public']['Tables']['cirurgias']['Row']
export type CirurgiaInsert = Database['public']['Tables']['cirurgias']['Insert']
export type CirurgiaUpdate = Database['public']['Tables']['cirurgias']['Update']

export type ItemCirurgia = Database['public']['Tables']['itens_cirurgia']['Row']
export type ItemCirurgiaInsert = Database['public']['Tables']['itens_cirurgia']['Insert']
export type ItemCirurgiaUpdate = Database['public']['Tables']['itens_cirurgia']['Update']

export type NotaFiscal = Database['public']['Tables']['notas_fiscais']['Row']
export type NotaFiscalInsert = Database['public']['Tables']['notas_fiscais']['Insert']
export type NotaFiscalUpdate = Database['public']['Tables']['notas_fiscais']['Update']

export type ContaReceber = Database['public']['Tables']['contas_receber']['Row']
export type ContaReceberInsert = Database['public']['Tables']['contas_receber']['Insert']
export type ContaReceberUpdate = Database['public']['Tables']['contas_receber']['Update']

export type MovimentacaoEstoque = Database['public']['Tables']['movimentacoes_estoque']['Row']
export type MovimentacaoEstoqueInsert = Database['public']['Tables']['movimentacoes_estoque']['Insert']
export type MovimentacaoEstoqueUpdate = Database['public']['Tables']['movimentacoes_estoque']['Update']

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']
