import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/config/supabase-client'
import { toast } from 'sonner'

/**
 * Hook genérico para integração com Supabase
 * Substitui mock data por dados reais em todos os 46 módulos
 */

export interface ModuleDataOptions {
  tableName: string
  selectFields?: string
  orderBy?: { column: string; ascending?: boolean }
  filters?: Record<string, any>
  enableRealtime?: boolean
}

/**
 * Hook para buscar dados de qualquer módulo
 */
export function useModuleData<T = any>(options: ModuleDataOptions) {
  const { tableName, selectFields = '*', orderBy, filters, enableRealtime = false } = options

  const query = useQuery({
    queryKey: [tableName, filters, orderBy],
    queryFn: async () => {
      let query = supabase
        .from(tableName)
        .select(selectFields)

      // Aplica filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      // Aplica ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true })
      }

      const { data, error } = await query

      if (error) {
        toast.error(`Erro ao carregar dados: ${error.message}`)
        throw error
      }

      return data as T[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  })

  // Realtime subscription (opcional)
  if (enableRealtime && query.data) {
    supabase
      .channel(`${tableName}-changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          // Invalida query para refetch
          useQueryClient().invalidateQueries({ queryKey: [tableName] })
        }
      )
      .subscribe()
  }

  return query
}

/**
 * Hook para criar/atualizar/deletar dados
 */
export function useModuleMutation(tableName: string) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast.success('Registro criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast.success('Registro atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] })
      toast.success('Registro removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover: ${error.message}`)
    },
  })

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  }
}

/**
 * Hooks específicos por módulo
 */

// Sprint 1 - Analytics
export function useKPIData() {
  return useModuleData({
    tableName: 'kpis',
    orderBy: { column: 'created_at', ascending: false },
  })
}

export function useDashboardData(dashboardId?: string) {
  return useModuleData({
    tableName: 'dashboards',
    filters: dashboardId ? { id: dashboardId } : undefined,
  })
}

export function usePredicoesData(tipo: 'demanda' | 'inadimplencia' | 'churn' | 'estoque') {
  return useModuleData({
    tableName: 'predicoes',
    filters: { tipo },
    orderBy: { column: 'data_previsao', ascending: false },
  })
}

export function useRelatoriosData() {
  return useModuleData({
    tableName: 'relatorios',
    selectFields: '*, usuario:usuarios(nome)',
    orderBy: { column: 'gerado_em', ascending: false },
  })
}

// Sprint 2 - Cadastros
export function useGruposOPME() {
  return useModuleData({
    tableName: 'grupos_produtos',
    selectFields: '*, familias:familias_produtos(count)',
    orderBy: { column: 'nome', ascending: true },
  })
}

export function useUsuarios() {
  return useModuleData({
    tableName: 'usuarios',
    selectFields: '*, perfil:perfis_acesso(*)',
    orderBy: { column: 'nome', ascending: true },
  })
}

export function useInventarios() {
  return useModuleData({
    tableName: 'inventarios',
    selectFields: '*, divergencias:inventario_divergencias(count)',
    orderBy: { column: 'data_inicio', ascending: false },
  })
}

export function useLeads() {
  return useModuleData({
    tableName: 'leads',
    selectFields: '*, responsavel:usuarios(nome)',
    orderBy: { column: 'created_at', ascending: false },
  })
}

// Sprint 3 - Estoque/IoT
export function useConsignacao() {
  return useModuleData({
    tableName: 'consignacao',
    selectFields: '*, hospital:hospitais(nome), items:consignacao_items(count)',
    filters: { status: 'ativo' },
  })
}

export function useLotesRastreabilidade() {
  return useModuleData({
    tableName: 'lotes_rastreabilidade',
    selectFields: '*, produto:produtos(*), eventos:rastreabilidade_eventos(count)',
    orderBy: { column: 'data_entrada', ascending: false },
    enableRealtime: true, // Tempo real para rastreabilidade
  })
}

export function useSensoresIoT() {
  return useModuleData({
    tableName: 'sensores_iot',
    selectFields: '*, ultima_leitura:leituras_iot(temperatura, umidade, timestamp)',
    filters: { ativo: true },
    enableRealtime: true, // Tempo real para sensores
  })
}

export function useManutencoes() {
  return useModuleData({
    tableName: 'manutencoes',
    selectFields: '*, equipamento:equipamentos(nome, tipo)',
    orderBy: { column: 'proxima_data', ascending: true },
  })
}

// Sprint 4 - Compras
export function useCompras() {
  return useModuleData({
    tableName: 'compras',
    selectFields: '*, fornecedor:fornecedores(nome_fantasia), items:compra_items(count)',
    orderBy: { column: 'data_pedido', ascending: false },
  })
}

export function useNotasEntrada() {
  return useModuleData({
    tableName: 'notas_fiscais_entrada',
    selectFields: '*, fornecedor:fornecedores(nome_fantasia), items:nfe_items(count)',
    orderBy: { column: 'data_emissao', ascending: false },
  })
}

// Sprint 5 - Vendas/CRM
export function useOportunidades() {
  return useModuleData({
    tableName: 'oportunidades',
    selectFields: '*, cliente:clientes(nome), responsavel:usuarios(nome)',
    orderBy: { column: 'valor', ascending: false },
  })
}

export function useCampanhas() {
  return useModuleData({
    tableName: 'campanhas_marketing',
    selectFields: '*, leads_gerados:leads(count)',
    orderBy: { column: 'data_inicio', ascending: false },
  })
}

// Sprint 6 - Financeiro
export function useContasReceber() {
  return useModuleData({
    tableName: 'contas_receber',
    selectFields: '*, cliente:clientes(nome), score_inadimplencia',
    filters: { status: ['pendente', 'vencido'] },
    orderBy: { column: 'data_vencimento', ascending: true },
  })
}

export function useFaturamentos() {
  return useModuleData({
    tableName: 'faturamentos',
    selectFields: '*, convenio:convenios(nome), items:faturamento_items(count)',
    orderBy: { column: 'data_faturamento', ascending: false },
  })
}

export function useNFeSaida() {
  return useModuleData({
    tableName: 'notas_fiscais_saida',
    selectFields: '*, cliente:clientes(nome), status_sefaz',
    orderBy: { column: 'data_emissao', ascending: false },
  })
}

// Sprint 7 - Compliance
export function useAuditorias() {
  return useModuleData({
    tableName: 'auditorias',
    selectFields: '*, findings:auditoria_findings(count), auditor:usuarios(nome)',
    orderBy: { column: 'data_auditoria', ascending: false },
  })
}

export function useNotificacoes() {
  return useModuleData({
    tableName: 'notificacoes',
    filters: { lida: false },
    orderBy: { column: 'created_at', ascending: false },
    enableRealtime: true, // Tempo real para notificações
  })
}

// Sprint 8 - IA
export function useAgentesIA() {
  return useModuleData({
    tableName: 'agentes_ia',
    selectFields: '*, execucoes:agent_executions(count)',
    filters: { ativo: true },
  })
}

export function useWorkflows() {
  return useModuleData({
    tableName: 'workflows',
    selectFields: '*, execucoes:workflow_executions(count)',
    orderBy: { column: 'updated_at', ascending: false },
  })
}

// Sprint 9 - Sistema/Integrações
export function useIntegracoes() {
  return useModuleData({
    tableName: 'integracoes',
    selectFields: '*, logs:integration_logs(count)',
    filters: { ativa: true },
  })
}

export function useWebhooks() {
  return useModuleData({
    tableName: 'webhooks',
    selectFields: '*, eventos:webhook_events(count)',
    orderBy: { column: 'created_at', ascending: false },
  })
}

// Sprint 10 - Cirurgias
export function useLicitacoes() {
  return useModuleData({
    tableName: 'licitacoes',
    selectFields: '*, propostas:licitacao_propostas(count)',
    orderBy: { column: 'data_abertura', ascending: false },
  })
}

export function useTabelasPrecos() {
  return useModuleData({
    tableName: 'tabelas_precos',
    selectFields: '*, convenio:convenios(nome), items:tabela_preco_items(count)',
    filters: { vigente: true },
  })
}

// ========================================
// HOOKS ADICIONAIS - MÉDIO PRAZO
// ========================================

// Sprint 4 - Compras (2 adicionais)
export function useComprasInternacionais() {
  return useModuleData({
    tableName: 'compras_internacionais',
    selectFields: '*, fornecedor:fornecedores(nome_fantasia), status_li, status_di',
    orderBy: { column: 'data_proforma', ascending: false },
  })
}

export function useViabilidadeImportacao() {
  return useModuleData({
    tableName: 'simulacoes_importacao',
    selectFields: '*, produto:produtos(nome), cenarios:cenarios_importacao(count)',
    orderBy: { column: 'created_at', ascending: false },
  })
}

// Sprint 5 - Vendas/CRM (2 adicionais)
export function useTabelasPrecosImport() {
  return useModuleData({
    tableName: 'importacoes_tabelas_precos',
    selectFields: '*, usuario:usuarios(nome), status, items_processados',
    orderBy: { column: 'data_importacao', ascending: false },
  })
}

export function useVideoCallsManager() {
  return useModuleData({
    tableName: 'video_calls',
    selectFields: '*, participantes:call_participantes(count), gravacao_url',
    orderBy: { column: 'agendado_para', ascending: false },
  })
}

// Sprint 6 - Financeiro (3 adicionais)
export function useGestaoContabil() {
  return useModuleData({
    tableName: 'lancamentos_contabeis',
    selectFields: '*, plano_conta:plano_contas(codigo, nome)',
    orderBy: { column: 'data_lancamento', ascending: false },
  })
}

export function useRelatoriosFinanceiros() {
  return useModuleData({
    tableName: 'relatorios_financeiros',
    selectFields: '*, tipo, gerado_por:usuarios(nome)',
    orderBy: { column: 'gerado_em', ascending: false },
  })
}

export function useRelatoriosRegulatorios() {
  return useModuleData({
    tableName: 'relatorios_regulatorios',
    selectFields: '*, tipo, status_envio, protocolo_rfb',
    filters: { competencia: new Date().getFullYear().toString() },
    orderBy: { column: 'competencia', ascending: false },
  })
}

// Sprint 7 - Compliance (1 adicional)
export function useComplianceAvancado() {
  return useModuleData({
    tableName: 'compliance_checks',
    selectFields: '*, tipo, status, gaps:compliance_gaps(count)',
    orderBy: { column: 'ultima_verificacao', ascending: false },
  })
}

// Sprint 8 - IA e Automação (6 adicionais)
export function useChatbotMetrics() {
  return useModuleData({
    tableName: 'chatbot_metricas',
    selectFields: '*, conversas_total, satisfacao_media, intencoes:chatbot_intencoes(count)',
    orderBy: { column: 'data', ascending: false },
  })
}

export function useVoiceAnalytics() {
  return useModuleData({
    tableName: 'voice_analytics',
    selectFields: '*, transcricoes:voice_transcricoes(count), sentimento_medio',
    orderBy: { column: 'data_analise', ascending: false },
  })
}

export function useVoiceBiometrics() {
  return useModuleData({
    tableName: 'voice_biometrics',
    selectFields: '*, usuario:usuarios(nome), ultima_verificacao, taxa_acerto',
    filters: { ativo: true },
  })
}

export function useVoiceMacros() {
  return useModuleData({
    tableName: 'voice_macros',
    selectFields: '*, comando, acao, usuario:usuarios(nome), vezes_usado',
    orderBy: { column: 'vezes_usado', ascending: false },
  })
}

export function useTooltipAnalytics() {
  return useModuleData({
    tableName: 'tooltip_analytics',
    selectFields: '*, tooltip_id, visualizacoes, cliques, tempo_medio',
    orderBy: { column: 'visualizacoes', ascending: false },
  })
}

export function useAutomacaoIA() {
  return useModuleData({
    tableName: 'automacoes_ia',
    selectFields: '*, nome, tipo, status, execucoes:automacao_execucoes(count)',
    filters: { ativo: true },
  })
}

// Sprint 9 - Sistema e Integrações (5 adicionais)
export function useConfiguracoesAvancadas() {
  return useModuleData({
    tableName: 'configuracoes_sistema',
    selectFields: '*, categoria, chave, valor, tipo',
    orderBy: { column: 'categoria', ascending: true },
  })
}

export function useSystemHealth() {
  return useModuleData({
    tableName: 'system_health_metrics',
    selectFields: '*, servico, status, uptime, ultima_verificacao',
    orderBy: { column: 'ultima_verificacao', ascending: false },
    enableRealtime: true, // Monitoramento em tempo real
  })
}

export function useIntegracoesAvancadas() {
  return useModuleData({
    tableName: 'integracoes_config',
    selectFields: '*, nome, tipo, status, ultima_sync',
    filters: { ativa: true },
  })
}

export function useIntegrationsManager() {
  return useModuleData({
    tableName: 'api_tokens',
    selectFields: '*, nome, tipo, rate_limit, requests_hoje',
    orderBy: { column: 'requests_hoje', ascending: false },
  })
}

export function useLogisticaAvancada() {
  return useModuleData({
    tableName: 'rotas_entrega',
    selectFields: '*, motorista:usuarios(nome), veiculo:veiculos(*), entregas:entregas(count)',
    filters: { data: new Date().toISOString().split('T')[0] },
  })
}

/**
 * Hook para estatísticas/KPIs agregados
 */
export function useModuleStats(tableName: string, aggregations: string[]) {
  return useQuery({
    queryKey: [tableName, 'stats', aggregations],
    queryFn: async () => {
      // Implementar agregações personalizadas
      // Ex: count, sum, avg, etc.
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      return {
        total: count || 0,
        // Adicionar mais agregações conforme necessário
      }
    },
  })
}

