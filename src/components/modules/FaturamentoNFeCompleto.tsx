/**
 * ICARUS v5.0 - Módulo: Faturamento NFe Completo
 *
 * Categoria: Core Business
 * Descrição: Emissão de Notas Fiscais Eletrônicas (NF-e)
 *
 * CONTEXTO DE NEGÓCIO:
 * - Distribuidora de dispositivos médicos (OPME) B2B
 * - Faturamento após realização de cirurgias
 * - NF-e obrigatória para todas as vendas
 * - Produtos OPME com tributação específica
 * - Integração com SEFAZ (Secretaria da Fazenda)
 * - Gestão de impostos complexos (ICMS, IPI, PIS, COFINS, ISS)
 * - Contingência obrigatória (emissão offline)
 * - Rastreabilidade: NF-e → Cirurgia → Produtos → Lotes
 *
 * FUNCIONALIDADES:
 * - Emissão de NF-e (modelo 55)
 * - Cálculo automático de impostos por produto
 * - Integração SEFAZ (autorização, consulta, cancelamento)
 * - Contingência FS-DA (offline)
 * - Carta de Correção Eletrônica (CC-e)
 * - Cancelamento de NF-e
 * - Inutilização de numeração
 * - Download XML e DANFE (PDF)
 * - Rastreio de status (pendente → autorizada → cancelada)
 * - Vinculação com cirurgias e clientes
 * - Gestão de séries e numeração
 * - Relatórios fiscais
 *
 * KPIs:
 * - Valor Total Faturado (mês)
 * - Notas Pendentes de Emissão
 * - Notas Canceladas (%)
 * - Total de Impostos (mês)
 * - Tempo Médio de Autorização
 *
 * Abas:
 * - Overview: KPIs + notas recentes + pendências
 * - Pendentes: Notas aguardando emissão
 * - Emitidas: Notas autorizadas pela SEFAZ
 * - Canceladas: Histórico de cancelamentos
 * - Relatórios: Análises fiscais e tributárias
 */

