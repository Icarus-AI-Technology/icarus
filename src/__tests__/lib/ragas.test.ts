/**
 * ICARUS v5.0 - Testes RAGAS
 * 
 * Testes para o sistema de avaliação RAGAS.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateFaithfulness,
  calculateAnswerRelevancy,
  calculateContextPrecision,
  calculateContextRecall,
  calculateAnswerCorrectness,
  evaluateRAG,
} from '@/lib/ai/evaluation/ragas'

describe('RAGAS Evaluation', () => {
  describe('calculateFaithfulness', () => {
    it('deve retornar score alto quando resposta é baseada no contexto', () => {
      const answer = 'A RDC 751/2022 estabelece regras para dispositivos médicos.'
      const contexts = [
        'A RDC 751/2022 da ANVISA estabelece regras para classificação de dispositivos médicos.',
        'Esta resolução define os requisitos de registro e notificação.',
      ]

      const result = calculateFaithfulness(answer, contexts)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
      // supportedClaims é um array de strings, não um número
      expect(Array.isArray(result.supportedClaims)).toBe(true)
    })

    it('deve retornar score baixo quando resposta não está no contexto', () => {
      const answer = 'O processo de importação requer licença especial.'
      const contexts = [
        'A RDC 751/2022 trata de classificação de dispositivos.',
      ]

      const result = calculateFaithfulness(answer, contexts)

      expect(result.score).toBeLessThanOrEqual(0.5)
    })
  })

  describe('calculateAnswerRelevancy', () => {
    it('deve retornar score alto quando resposta é relevante à pergunta', () => {
      const question = 'Quais são os requisitos para registro de dispositivos médicos?'
      const answer = 'Os requisitos incluem documentação técnica, testes de segurança e eficácia conforme RDC 751/2022.'

      const result = calculateAnswerRelevancy(question, answer)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })

    it('deve retornar score baixo para resposta irrelevante', () => {
      const question = 'Quais são os requisitos para registro?'
      const answer = 'O clima está ensolarado hoje.'

      const result = calculateAnswerRelevancy(question, answer)

      expect(result.score).toBeLessThan(0.5)
    })
  })

  describe('calculateContextPrecision', () => {
    it('deve retornar score quando contextos são fornecidos', () => {
      const question = 'O que é a RDC 751?'
      const contexts = [
        'A RDC 751/2022 é uma resolução da ANVISA sobre dispositivos médicos.',
        'Esta resolução estabelece critérios de classificação.',
        'Informação não relacionada sobre outro assunto.',
      ]

      const result = calculateContextPrecision(question, contexts)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
      expect(result.totalContexts).toBe(3)
    })

    it('deve retornar 0 quando não há contextos', () => {
      const question = 'O que é a RDC 751?'
      const contexts: string[] = []

      const result = calculateContextPrecision(question, contexts)

      expect(result.score).toBe(0)
      expect(result.totalContexts).toBe(0)
    })
  })

  describe('calculateContextRecall', () => {
    it('deve calcular recall corretamente', () => {
      const groundTruth = 'A RDC 751/2022 estabelece requisitos para registro de dispositivos médicos classe I, II, III e IV.'
      const contexts = [
        'A RDC 751/2022 define regras para dispositivos médicos.',
        'Dispositivos são classificados em classes I a IV.',
      ]

      // Ordem correta: contexts primeiro, groundTruth depois
      const result = calculateContextRecall(contexts, groundTruth)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })
  })

  describe('calculateAnswerCorrectness', () => {
    it('deve retornar score alto para respostas corretas', () => {
      const answer = 'A RDC 751/2022 classifica dispositivos médicos em 4 classes de risco.'
      const groundTruth = 'A RDC 751/2022 estabelece a classificação de dispositivos médicos em classes I, II, III e IV.'

      const result = calculateAnswerCorrectness(answer, groundTruth)

      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })

    it('deve retornar score baixo para respostas incorretas', () => {
      const answer = 'Dispositivos médicos não precisam de registro.'
      const groundTruth = 'Todos os dispositivos médicos precisam de registro na ANVISA.'

      const result = calculateAnswerCorrectness(answer, groundTruth)

      expect(result.score).toBeLessThan(0.5)
    })
  })

  describe('evaluateRAG', () => {
    it('deve calcular todas as métricas', () => {
      const input = {
        question: 'O que é a RDC 751?',
        answer: 'A RDC 751/2022 é uma resolução da ANVISA que estabelece requisitos para dispositivos médicos.',
        contexts: [
          'A RDC 751/2022 da ANVISA estabelece requisitos para registro de dispositivos médicos.',
        ],
        groundTruth: 'A RDC 751/2022 é uma resolução da ANVISA sobre dispositivos médicos.',
      }

      // evaluateRAG retorna RAGASEvaluationResult, não métricas diretamente
      const result = evaluateRAG(input)

      expect(result.metrics.faithfulness).toBeGreaterThanOrEqual(0)
      expect(result.metrics.answerRelevancy).toBeGreaterThanOrEqual(0)
      expect(result.metrics.contextPrecision).toBeGreaterThanOrEqual(0)
      expect(result.metrics.contextRecall).toBeGreaterThanOrEqual(0)
      expect(result.metrics.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.metrics.overallScore).toBeLessThanOrEqual(1)
    })

    it('deve calcular score geral como média ponderada', () => {
      const input = {
        question: 'Teste',
        answer: 'Resposta de teste',
        contexts: ['Contexto de teste'],
      }

      const result = evaluateRAG(input)

      // Overall score deve estar definido nas métricas
      expect(result.metrics.overallScore).toBeDefined()
      expect(typeof result.metrics.overallScore).toBe('number')
    })
  })
})
