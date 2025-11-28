/**
 * ICARUS v5.0 - RAGAS Evaluation System
 * 
 * Implementação de métricas RAGAS (Retrieval Augmented Generation Assessment)
 * para avaliação da qualidade do sistema RAG.
 * 
 * Métricas implementadas:
 * - Faithfulness: Resposta baseada no contexto recuperado
 * - Answer Relevancy: Relevância da resposta para a pergunta
 * - Context Precision: Precisão dos documentos recuperados
 * - Context Recall: Cobertura dos documentos relevantes
 * - Answer Correctness: Correção factual da resposta
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'

// ============ TIPOS ============

export interface RAGASInput {
  question: string
  answer: string
  contexts: string[]
  groundTruth?: string
}

export interface RAGASMetrics {
  faithfulness: number
  answerRelevancy: number
  contextPrecision: number
  contextRecall: number
  answerCorrectness?: number
  overallScore: number
}

export interface RAGASEvaluationResult {
  input: RAGASInput
  metrics: RAGASMetrics
  details: RAGASDetails
  timestamp: string
  evaluationId: string
}

export interface RAGASDetails {
  faithfulness: {
    claims: string[]
    supportedClaims: string[]
    score: number
  }
  answerRelevancy: {
    generatedQuestions: string[]
    similarityScores: number[]
    score: number
  }
  contextPrecision: {
    relevantContexts: number
    totalContexts: number
    score: number
  }
  contextRecall: {
    coveredStatements: number
    totalStatements: number
    score: number
  }
  answerCorrectness?: {
    factualOverlap: number
    semanticSimilarity: number
    score: number
  }
}

export interface RAGASBatchResult {
  evaluations: RAGASEvaluationResult[]
  aggregatedMetrics: RAGASMetrics
  summary: RAGASSummary
}

export interface RAGASSummary {
  totalEvaluations: number
  averageOverallScore: number
  metricDistribution: {
    excellent: number  // >= 0.8
    good: number       // >= 0.6
    fair: number       // >= 0.4
    poor: number       // < 0.4
  }
  recommendations: string[]
}

// ============ FUNÇÕES UTILITÁRIAS ============

/**
 * Extrai claims/afirmações de um texto
 */
function extractClaims(text: string): string[] {
  // Divide o texto em sentenças e filtra afirmações
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
  
  return sentences
}

/**
 * Calcula similaridade semântica simplificada (Jaccard)
 */
function calculateJaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / union.size
}

/**
 * Verifica se um claim é suportado pelos contextos
 */
function isClaimSupported(claim: string, contexts: string[]): boolean {
  const claimWords = new Set(claim.toLowerCase().split(/\s+/))
  
  for (const context of contexts) {
    const contextWords = new Set(context.toLowerCase().split(/\s+/))
    const overlap = [...claimWords].filter(w => contextWords.has(w)).length
    const overlapRatio = overlap / claimWords.size
    
    // Considera suportado se > 50% das palavras estão no contexto
    if (overlapRatio > 0.5) {
      return true
    }
  }
  
  return false
}

/**
 * Gera perguntas hipotéticas a partir de uma resposta
 */
function generateHypotheticalQuestions(answer: string): string[] {
  const sentences = extractClaims(answer)
  
  // Converte afirmações em perguntas (simplificado)
  return sentences.slice(0, 3).map(sentence => {
    // Remove pontuação e converte em pergunta
    const cleaned = sentence.replace(/[.!?]+$/, '')
    return `O que ${cleaned.toLowerCase()}?`
  })
}

// ============ MÉTRICAS RAGAS ============

/**
 * Calcula Faithfulness: proporção de claims suportados pelo contexto
 */
export function calculateFaithfulness(
  answer: string,
  contexts: string[]
): { score: number; claims: string[]; supportedClaims: string[] } {
  const claims = extractClaims(answer)
  
  if (claims.length === 0) {
    return { score: 1.0, claims: [], supportedClaims: [] }
  }
  
  const supportedClaims = claims.filter(claim => isClaimSupported(claim, contexts))
  const score = supportedClaims.length / claims.length
  
  return { score, claims, supportedClaims }
}

/**
 * Calcula Answer Relevancy: similaridade entre pergunta original e perguntas geradas
 */
export function calculateAnswerRelevancy(
  question: string,
  answer: string
): { score: number; generatedQuestions: string[]; similarityScores: number[] } {
  const generatedQuestions = generateHypotheticalQuestions(answer)
  
  if (generatedQuestions.length === 0) {
    return { score: 0, generatedQuestions: [], similarityScores: [] }
  }
  
  const similarityScores = generatedQuestions.map(gq => 
    calculateJaccardSimilarity(question, gq)
  )
  
  const score = similarityScores.reduce((a, b) => a + b, 0) / similarityScores.length
  
  return { score, generatedQuestions, similarityScores }
}

/**
 * Calcula Context Precision: proporção de contextos relevantes
 */
export function calculateContextPrecision(
  question: string,
  contexts: string[]
): { score: number; relevantContexts: number; totalContexts: number } {
  if (contexts.length === 0) {
    return { score: 0, relevantContexts: 0, totalContexts: 0 }
  }
  
  // Um contexto é relevante se tem similaridade > 0.2 com a pergunta
  const relevantContexts = contexts.filter(ctx => 
    calculateJaccardSimilarity(question, ctx) > 0.2
  ).length
  
  const score = relevantContexts / contexts.length
  
  return { score, relevantContexts, totalContexts: contexts.length }
}

/**
 * Calcula Context Recall: cobertura das informações do ground truth
 */
export function calculateContextRecall(
  contexts: string[],
  groundTruth?: string
): { score: number; coveredStatements: number; totalStatements: number } {
  if (!groundTruth) {
    return { score: 1.0, coveredStatements: 0, totalStatements: 0 }
  }
  
  const groundTruthStatements = extractClaims(groundTruth)
  
  if (groundTruthStatements.length === 0) {
    return { score: 1.0, coveredStatements: 0, totalStatements: 0 }
  }
  
  const coveredStatements = groundTruthStatements.filter(statement =>
    isClaimSupported(statement, contexts)
  ).length
  
  const score = coveredStatements / groundTruthStatements.length
  
  return { score, coveredStatements, totalStatements: groundTruthStatements.length }
}

/**
 * Calcula Answer Correctness: correção factual comparada ao ground truth
 */
export function calculateAnswerCorrectness(
  answer: string,
  groundTruth?: string
): { score: number; factualOverlap: number; semanticSimilarity: number } | undefined {
  if (!groundTruth) {
    return undefined
  }
  
  // Overlap factual: claims da resposta que estão no ground truth
  const answerClaims = extractClaims(answer)
  const groundTruthClaims = extractClaims(groundTruth)
  
  if (answerClaims.length === 0) {
    return { score: 0, factualOverlap: 0, semanticSimilarity: 0 }
  }
  
  const supportedByGroundTruth = answerClaims.filter(claim =>
    groundTruthClaims.some(gt => calculateJaccardSimilarity(claim, gt) > 0.5)
  ).length
  
  const factualOverlap = supportedByGroundTruth / answerClaims.length
  
  // Similaridade semântica geral
  const semanticSimilarity = calculateJaccardSimilarity(answer, groundTruth)
  
  // Score combinado (média ponderada)
  const score = (factualOverlap * 0.6) + (semanticSimilarity * 0.4)
  
  return { score, factualOverlap, semanticSimilarity }
}

// ============ AVALIAÇÃO PRINCIPAL ============

/**
 * Executa avaliação RAGAS completa
 */
export function evaluateRAG(input: RAGASInput): RAGASEvaluationResult {
  const { question, answer, contexts, groundTruth } = input
  
  // Calcular métricas individuais
  const faithfulnessResult = calculateFaithfulness(answer, contexts)
  const answerRelevancyResult = calculateAnswerRelevancy(question, answer)
  const contextPrecisionResult = calculateContextPrecision(question, contexts)
  const contextRecallResult = calculateContextRecall(contexts, groundTruth)
  const answerCorrectnessResult = calculateAnswerCorrectness(answer, groundTruth)
  
  // Montar métricas
  const metrics: RAGASMetrics = {
    faithfulness: faithfulnessResult.score,
    answerRelevancy: answerRelevancyResult.score,
    contextPrecision: contextPrecisionResult.score,
    contextRecall: contextRecallResult.score,
    answerCorrectness: answerCorrectnessResult?.score,
    overallScore: 0,
  }
  
  // Calcular score geral (média ponderada)
  const weights = {
    faithfulness: 0.25,
    answerRelevancy: 0.25,
    contextPrecision: 0.20,
    contextRecall: 0.15,
    answerCorrectness: 0.15,
  }
  
  let totalWeight = weights.faithfulness + weights.answerRelevancy + 
                    weights.contextPrecision + weights.contextRecall
  
  metrics.overallScore = 
    (metrics.faithfulness * weights.faithfulness) +
    (metrics.answerRelevancy * weights.answerRelevancy) +
    (metrics.contextPrecision * weights.contextPrecision) +
    (metrics.contextRecall * weights.contextRecall)
  
  if (metrics.answerCorrectness !== undefined) {
    totalWeight += weights.answerCorrectness
    metrics.overallScore += metrics.answerCorrectness * weights.answerCorrectness
  }
  
  metrics.overallScore /= totalWeight
  
  // Montar detalhes
  const details: RAGASDetails = {
    faithfulness: faithfulnessResult,
    answerRelevancy: answerRelevancyResult,
    contextPrecision: contextPrecisionResult,
    contextRecall: contextRecallResult,
    answerCorrectness: answerCorrectnessResult,
  }
  
  return {
    input,
    metrics,
    details,
    timestamp: new Date().toISOString(),
    evaluationId: crypto.randomUUID(),
  }
}

/**
 * Executa avaliação em lote
 */
export function evaluateRAGBatch(inputs: RAGASInput[]): RAGASBatchResult {
  const evaluations = inputs.map(input => evaluateRAG(input))
  
  // Agregar métricas
  const aggregatedMetrics: RAGASMetrics = {
    faithfulness: 0,
    answerRelevancy: 0,
    contextPrecision: 0,
    contextRecall: 0,
    answerCorrectness: 0,
    overallScore: 0,
  }
  
  let correctnessCount = 0
  
  for (const evaluation of evaluations) {
    aggregatedMetrics.faithfulness += evaluation.metrics.faithfulness
    aggregatedMetrics.answerRelevancy += evaluation.metrics.answerRelevancy
    aggregatedMetrics.contextPrecision += evaluation.metrics.contextPrecision
    aggregatedMetrics.contextRecall += evaluation.metrics.contextRecall
    aggregatedMetrics.overallScore += evaluation.metrics.overallScore
    
    if (evaluation.metrics.answerCorrectness !== undefined) {
      aggregatedMetrics.answerCorrectness! += evaluation.metrics.answerCorrectness
      correctnessCount++
    }
  }
  
  const n = evaluations.length
  aggregatedMetrics.faithfulness /= n
  aggregatedMetrics.answerRelevancy /= n
  aggregatedMetrics.contextPrecision /= n
  aggregatedMetrics.contextRecall /= n
  aggregatedMetrics.overallScore /= n
  
  if (correctnessCount > 0) {
    aggregatedMetrics.answerCorrectness! /= correctnessCount
  } else {
    aggregatedMetrics.answerCorrectness = undefined
  }
  
  // Gerar sumário
  const summary = generateSummary(evaluations, aggregatedMetrics)
  
  return {
    evaluations,
    aggregatedMetrics,
    summary,
  }
}

/**
 * Gera sumário da avaliação
 */
function generateSummary(
  evaluations: RAGASEvaluationResult[],
  aggregatedMetrics: RAGASMetrics
): RAGASSummary {
  const distribution = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
  }
  
  for (const evaluation of evaluations) {
    const score = evaluation.metrics.overallScore
    if (score >= 0.8) distribution.excellent++
    else if (score >= 0.6) distribution.good++
    else if (score >= 0.4) distribution.fair++
    else distribution.poor++
  }
  
  // Gerar recomendações baseadas nas métricas
  const recommendations: string[] = []
  
  if (aggregatedMetrics.faithfulness < 0.7) {
    recommendations.push(
      'Melhorar a fidelidade: As respostas contêm informações não suportadas pelo contexto. ' +
      'Considere ajustar o prompt para ser mais conservador.'
    )
  }
  
  if (aggregatedMetrics.answerRelevancy < 0.6) {
    recommendations.push(
      'Melhorar relevância: As respostas não estão bem alinhadas com as perguntas. ' +
      'Revise o prompt para focar mais na pergunta original.'
    )
  }
  
  if (aggregatedMetrics.contextPrecision < 0.5) {
    recommendations.push(
      'Melhorar precisão do contexto: Muitos documentos irrelevantes estão sendo recuperados. ' +
      'Ajuste os parâmetros de busca ou o threshold de similaridade.'
    )
  }
  
  if (aggregatedMetrics.contextRecall < 0.6) {
    recommendations.push(
      'Melhorar recall do contexto: Documentos relevantes não estão sendo recuperados. ' +
      'Considere aumentar o número de documentos recuperados ou melhorar os embeddings.'
    )
  }
  
  if (recommendations.length === 0) {
    recommendations.push(
      'O sistema RAG está performando bem! Continue monitorando as métricas.'
    )
  }
  
  return {
    totalEvaluations: evaluations.length,
    averageOverallScore: aggregatedMetrics.overallScore,
    metricDistribution: distribution,
    recommendations,
  }
}

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export interface UseRAGASReturn {
  evaluate: (input: RAGASInput) => RAGASEvaluationResult
  evaluateBatch: (inputs: RAGASInput[]) => RAGASBatchResult
  lastResult: RAGASEvaluationResult | null
  lastBatchResult: RAGASBatchResult | null
  isEvaluating: boolean
}

export function useRAGAS(): UseRAGASReturn {
  const [lastResult, setLastResult] = useState<RAGASEvaluationResult | null>(null)
  const [lastBatchResult, setLastBatchResult] = useState<RAGASBatchResult | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const evaluate = useCallback((input: RAGASInput): RAGASEvaluationResult => {
    setIsEvaluating(true)
    try {
      const result = evaluateRAG(input)
      setLastResult(result)
      logger.info('RAGAS evaluation completed', { 
        overallScore: result.metrics.overallScore 
      })
      return result
    } finally {
      setIsEvaluating(false)
    }
  }, [])

  const evaluateBatchFn = useCallback((inputs: RAGASInput[]): RAGASBatchResult => {
    setIsEvaluating(true)
    try {
      const result = evaluateRAGBatch(inputs)
      setLastBatchResult(result)
      logger.info('RAGAS batch evaluation completed', {
        totalEvaluations: result.summary.totalEvaluations,
        averageScore: result.summary.averageOverallScore,
      })
      return result
    } finally {
      setIsEvaluating(false)
    }
  }, [])

  return {
    evaluate,
    evaluateBatch: evaluateBatchFn,
    lastResult,
    lastBatchResult,
    isEvaluating,
  }
}

// ============ EXPORTS ============

export default {
  evaluateRAG,
  evaluateRAGBatch,
  calculateFaithfulness,
  calculateAnswerRelevancy,
  calculateContextPrecision,
  calculateContextRecall,
  calculateAnswerCorrectness,
  useRAGAS,
}

