/**
 * Web Vitals Monitoring - ICARUS v5.0
 * Conformidade: RDC 59/751/188 ANVISA
 *
 * Tracks Core Web Vitals (LCP, INP, CLS, FCP, TTFB)
 * Integrates with Vercel Analytics when available
 */
import { onLCP, onINP, onCLS, onFCP, onTTFB, type Metric } from 'web-vitals'
import { perfLogger } from '@/lib/utils/logger'

type MetricRating = 'good' | 'needs-improvement' | 'poor'

interface MetricReport {
  name: string
  value: number
  rating: MetricRating
  delta: number
  id: string
  navigationType: string
}

/**
 * Send metrics to analytics endpoint or console
 */
function reportMetric(metric: Metric): void {
  const report: MetricReport = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    perfLogger.info(`${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
  }

  // Send to Vercel Analytics if available
  if (typeof window !== 'undefined' && (window as { va?: (event: string, data: object) => void }).va) {
    (window as { va: (event: string, data: object) => void }).va('event', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    })
  }

  // Send to custom analytics endpoint (optional)
  if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      // Use keepalive to ensure the request completes even if the page is closed
      keepalive: true,
    }).catch(() => {
      // Silent fail - don't break the app if analytics fails
    })
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point
 */
export function initWebVitals(): void {
  // Largest Contentful Paint - target: < 2.5s
  onLCP(reportMetric)

  // Interaction to Next Paint (replaces FID) - target: < 200ms
  onINP(reportMetric)

  // Cumulative Layout Shift - target: < 0.1
  onCLS(reportMetric)

  // First Contentful Paint - target: < 1.8s
  onFCP(reportMetric)

  // Time to First Byte - target: < 800ms
  onTTFB(reportMetric)
}

/**
 * Performance thresholds for alerting
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // milliseconds
  INP: { good: 200, poor: 500 },        // milliseconds
  CLS: { good: 0.1, poor: 0.25 },       // score
  FCP: { good: 1800, poor: 3000 },      // milliseconds
  TTFB: { good: 800, poor: 1800 },      // milliseconds
} as const

/**
 * Check if a metric value is acceptable
 */
export function isMetricAcceptable(
  metricName: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): boolean {
  const threshold = PERFORMANCE_THRESHOLDS[metricName]
  return value <= threshold.good
}
