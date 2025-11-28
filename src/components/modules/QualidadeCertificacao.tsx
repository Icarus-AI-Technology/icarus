/**
 * Módulo: Qualidade Certificação
 * Categoria: Vendas & CRM / Compliance
 * Descrição: Gestão completa de documentos da qualidade, certificações e cartas de comercialização
 * 
 * Funcionalidades:
 * - Upload de documentos gerais da empresa
 * - Documentos exigidos pela ANVISA
 * - Cartas de Comercialização com controle de validade
 * - Alertas preditivos de vencimento
 * - Controle de versões e aprovações
 */

import { GestaoDocumentosQualidade } from './qualidade/GestaoDocumentosQualidade'

export function QualidadeCertificacao() {
  return <GestaoDocumentosQualidade />
}
