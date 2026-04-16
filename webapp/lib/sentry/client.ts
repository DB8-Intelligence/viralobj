import * as Sentry from '@sentry/nextjs';

/**
 * Inicializa Sentry. Chamar em app/layout.tsx.
 * Sem SENTRY_DSN ou SENTRY_ENABLED=false, funciona como no-op.
 */
export function initSentry() {
  const sentryEnabled = process.env.SENTRY_ENABLED === 'true';
  const sentryDsn = process.env.SENTRY_DSN;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!sentryEnabled || !sentryDsn) {
    console.log('[Sentry] Disabled or DSN not configured');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: isProduction ? 'production' : 'development',
      tracesSampleRate: isProduction ? 0.1 : 1.0,
    });
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
  }
}

export function captureException(
  error: Error | unknown,
  context?: { tags?: Record<string, string>; data?: Record<string, unknown> }
) {
  if (process.env.SENTRY_ENABLED !== 'true') {
    console.error('[Error]', error, context);
    return;
  }

  Sentry.captureException(error, {
    tags: context?.tags,
    contexts: { custom: context?.data },
  });
}

export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  if (process.env.SENTRY_ENABLED !== 'true') {
    console.log(`[${level.toUpperCase()}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

export function logGenerationStep(
  jobId: string,
  step: string,
  status: 'started' | 'completed' | 'failed',
  duration?: number,
  metadata?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message: `[Generation] ${step} - ${status.toUpperCase()}`,
    data: { jobId, step, status, duration, ...metadata },
    level: status === 'failed' ? 'error' : 'info',
    category: 'generation',
    timestamp: Date.now() / 1000,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[${step}] ${status} ${duration ? `(${duration.toFixed(2)}s)` : ''}`
    );
  }
}

export function logCost(
  jobId: string,
  provider: string,
  cost: number,
  unit: 'usd' | 'brl' = 'usd'
) {
  if (process.env.LOG_COSTS !== 'true') return;

  Sentry.addBreadcrumb({
    message: `Cost: ${cost.toFixed(4)} ${unit.toUpperCase()} (${provider})`,
    data: { jobId, provider, cost, unit },
    level: 'info',
    category: 'cost',
    timestamp: Date.now() / 1000,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Cost] ${provider}: ${cost} ${unit}`);
  }
}

export function setUserContext(userId: string, email?: string) {
  if (process.env.SENTRY_ENABLED !== 'true') return;
  Sentry.setUser({ id: userId, email });
}

export function clearUserContext() {
  if (process.env.SENTRY_ENABLED !== 'true') return;
  Sentry.setUser(null);
}
