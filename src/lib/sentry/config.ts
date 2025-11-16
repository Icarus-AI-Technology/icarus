/**
 * Sentry Configuration
 *
 * Error tracking and performance monitoring setup
 */

import * as Sentry from '@sentry/react'
import React from 'react'

/**
 * Initialize Sentry for error tracking and performance monitoring
 *
 * @param dsn - Sentry DSN from environment variables
 * @param environment - Current environment (development, staging, production)
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE

  // Only initialize if DSN is configured
  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn,
    environment,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Set sample rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,

    integrations: [
      // Replay integration for session recordings
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),

      // Browser tracing integration for performance monitoring
      Sentry.browserTracingIntegration(),

      // Browser profiling integration
      Sentry.browserProfilingIntegration(),

      // React-specific integration
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
      }),
    ],

    // Filter out specific errors you don't want to track
    beforeSend(event, hint) {
      const error = hint.originalException

      // Don't send errors in development (unless explicitly enabled)
      if (environment === 'development' && !import.meta.env.VITE_SENTRY_FORCE_ENABLE) {
        return null
      }

      // Filter out known non-critical errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message)

        // Filter out network errors (optional)
        if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
          return null
        }

        // Filter out ResizeObserver errors (benign browser issue)
        if (message.includes('ResizeObserver loop')) {
          return null
        }
      }

      return event
    },

    // Add custom tags to all events
    initialScope: {
      tags: {
        app_version: import.meta.env.VITE_APP_VERSION || '5.0.3',
        app_name: 'ICARUS-ERP',
      },
    },
  })
}

/**
 * Capture a custom error to Sentry
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  })
}

/**
 * Capture a custom message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  })
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  Sentry.setUser(user)
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null)
}

// Re-export for convenience
export { Sentry }
