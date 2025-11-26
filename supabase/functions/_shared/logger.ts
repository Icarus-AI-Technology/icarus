/**
 * ICARUS v5.0 - Structured Logging
 *
 * JSON-formatted logging for observability
 * Compatible with Supabase Edge Functions runtime
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  empresaId?: string;
  function?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration_ms?: number;
  [key: string]: unknown;
}

/**
 * Structured logger class
 */
export class Logger {
  private context: LogContext;
  private startTime: number;

  constructor(functionName: string, requestId?: string) {
    this.context = {
      function: functionName,
      requestId: requestId || crypto.randomUUID(),
    };
    this.startTime = Date.now();
  }

  /**
   * Set additional context
   */
  setContext(ctx: Partial<LogContext>): void {
    this.context = { ...this.context, ...ctx };
  }

  /**
   * Get request ID
   */
  getRequestId(): string {
    return this.context.requestId || '';
  }

  /**
   * Get elapsed time since logger creation
   */
  getElapsedMs(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Format and output log entry
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      duration_ms: this.getElapsedMs(),
      ...data,
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  /**
   * Debug level log
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Info level log
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Warning level log
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Error level log
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData: Record<string, unknown> = { ...data };

    if (error instanceof Error) {
      errorData.error = {
        name: error.name,
        message: error.message,
        // Only include stack in development
        stack: Deno.env.get('ENVIRONMENT') !== 'production' ? error.stack : undefined,
      };
    } else if (error) {
      errorData.error = { name: 'Unknown', message: String(error) };
    }

    this.log('error', message, errorData);
  }

  /**
   * Log API request
   */
  logRequest(req: Request, data?: Record<string, unknown>): void {
    this.info('Request received', {
      method: req.method,
      url: new URL(req.url).pathname,
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin'),
      ...data,
    });
  }

  /**
   * Log API response
   */
  logResponse(status: number, data?: Record<string, unknown>): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this.log(level, 'Response sent', {
      status,
      ...data,
    });
  }

  /**
   * Log external API call
   */
  logExternalCall(service: string, data?: Record<string, unknown>): void {
    this.info(`External API call: ${service}`, data);
  }

  /**
   * Log external API response
   */
  logExternalResponse(service: string, status: number, data?: Record<string, unknown>): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this.log(level, `External API response: ${service}`, {
      status,
      ...data,
    });
  }

  /**
   * Log database operation
   */
  logDbOperation(operation: string, table: string, data?: Record<string, unknown>): void {
    this.debug(`DB: ${operation} ${table}`, data);
  }

  /**
   * Log AI/LLM call
   */
  logAICall(model: string, data?: Record<string, unknown>): void {
    this.info(`AI call: ${model}`, data);
  }

  /**
   * Log AI/LLM response with token usage
   */
  logAIResponse(model: string, tokens: { input: number; output: number }, data?: Record<string, unknown>): void {
    this.info(`AI response: ${model}`, {
      tokens_input: tokens.input,
      tokens_output: tokens.output,
      tokens_total: tokens.input + tokens.output,
      ...data,
    });
  }

  /**
   * Log rate limit event
   */
  logRateLimit(identifier: string, limit: number, window: string): void {
    this.warn('Rate limit exceeded', {
      identifier,
      limit,
      window,
    });
  }

  /**
   * Log security event
   */
  logSecurity(event: string, data?: Record<string, unknown>): void {
    this.warn(`Security: ${event}`, data);
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(functionName: string, requestId?: string): Logger {
  return new Logger(functionName, requestId);
}

/**
 * Middleware to add request logging
 */
export function withLogging(
  functionName: string,
  handler: (req: Request, logger: Logger) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const logger = createLogger(functionName);
    logger.logRequest(req);

    try {
      const response = await handler(req, logger);
      logger.logResponse(response.status);
      return response;
    } catch (error) {
      logger.error('Unhandled error', error);
      throw error;
    }
  };
}
