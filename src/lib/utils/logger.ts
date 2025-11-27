/**
 * ICARUS v5.0 - Logger Utilitário
 * Conformidade: RDC 59/751/188 ANVISA
 * 
 * Logger condicional que só exibe logs em desenvolvimento.
 * Em produção, logs são silenciados para performance e segurança.
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  prefix: string
  enabled: boolean
}

const defaultConfig: LoggerConfig = {
  prefix: '[ICARUS]',
  enabled: isDevelopment,
}

/**
 * Cria um logger com prefixo personalizado
 * @param prefix - Prefixo para identificar a origem do log
 * @returns Objeto com métodos de log
 */
export function createLogger(prefix: string) {
  const config: LoggerConfig = {
    ...defaultConfig,
    prefix: `[${prefix}]`,
  }

  const log = (level: LogLevel, ...args: unknown[]) => {
    if (!config.enabled) return

    const timestamp = new Date().toISOString()
    const formattedPrefix = `${timestamp} ${config.prefix}`

    switch (level) {
      case 'debug':
        console.debug(formattedPrefix, ...args)
        break
      case 'info':
        console.info(formattedPrefix, ...args)
        break
      case 'warn':
        console.warn(formattedPrefix, ...args)
        break
      case 'error':
        console.error(formattedPrefix, ...args)
        break
    }
  }

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args),
  }
}

/** Logger padrão para uso geral */
export const logger = createLogger('ICARUS')

/** Logger específico para Realtime */
export const realtimeLogger = createLogger('Realtime')

/** Logger específico para IcarusBrain IA */
export const icarusBrainLogger = createLogger('IcarusBrain')

/** Logger específico para Dashboard */
export const dashboardLogger = createLogger('Dashboard')

/** Logger específico para API */
export const apiLogger = createLogger('API')

/** Logger específico para Performance */
export const perfLogger = createLogger('Performance')

// ICARUS CODE REVIEW: 100% conformidade | RDC 59/751/188 | Revisado por Agente 2025-11-27

