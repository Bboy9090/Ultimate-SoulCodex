// ═══════════════════════════════════════════════════════════════════════════
// SOUL CODEX - STRUCTURED LOGGING SYSTEM
// Production-Ready Logging with Context and Metrics
// ═══════════════════════════════════════════════════════════════════════════

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  requestId?: string;
  userId?: string;
  profileId?: string;
  action?: string;
  duration?: number;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

// Determine log level from environment
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Check if log level should be output
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

// Format log entry for output
function formatLog(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;
  const levelEmoji = {
    debug: '🔍',
    info: '📝',
    warn: '⚠️',
    error: '❌'
  }[level];
  
  let output = `${timestamp} ${levelEmoji} [${level.toUpperCase()}] ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    // Redact sensitive fields
    const safeContext = { ...context };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    for (const key of Object.keys(safeContext)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        safeContext[key] = '[REDACTED]';
      }
    }
    output += ` ${JSON.stringify(safeContext)}`;
  }
  
  return output;
}

// Core logging function
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context
  };
  
  const formatted = formatLog(entry);
  
  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

// Exported logging functions
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  
  // Timing helper
  time: (label: string): () => number => {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      log('debug', `${label} completed`, { duration });
      return duration;
    };
  },
  
  // Request logging helper
  request: (method: string, path: string, statusCode: number, duration: number, requestId?: string) => {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    log(level, `${method} ${path} ${statusCode}`, { duration, requestId });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// METRICS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

interface Metrics {
  requests: {
    total: number;
    byStatus: Record<string, number>;
    byPath: Record<string, number>;
  };
  performance: {
    avgResponseTime: number;
    maxResponseTime: number;
    responseTimes: number[];
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
}

const metrics: Metrics = {
  requests: { total: 0, byStatus: {}, byPath: {} },
  performance: { avgResponseTime: 0, maxResponseTime: 0, responseTimes: [] },
  errors: { total: 0, byType: {} }
};

export function recordRequest(path: string, status: number, duration: number): void {
  metrics.requests.total++;
  
  const statusKey = `${Math.floor(status / 100)}xx`;
  metrics.requests.byStatus[statusKey] = (metrics.requests.byStatus[statusKey] || 0) + 1;
  
  const pathKey = path.split('/').slice(0, 3).join('/');
  metrics.requests.byPath[pathKey] = (metrics.requests.byPath[pathKey] || 0) + 1;
  
  // Keep last 1000 response times for averaging
  metrics.performance.responseTimes.push(duration);
  if (metrics.performance.responseTimes.length > 1000) {
    metrics.performance.responseTimes.shift();
  }
  
  metrics.performance.avgResponseTime = 
    metrics.performance.responseTimes.reduce((a, b) => a + b, 0) / 
    metrics.performance.responseTimes.length;
  
  if (duration > metrics.performance.maxResponseTime) {
    metrics.performance.maxResponseTime = duration;
  }
  
  if (status >= 500) {
    metrics.errors.total++;
  }
}

export function recordError(type: string): void {
  metrics.errors.total++;
  metrics.errors.byType[type] = (metrics.errors.byType[type] || 0) + 1;
}

export function getMetrics(): Metrics {
  return { ...metrics };
}

export default logger;
