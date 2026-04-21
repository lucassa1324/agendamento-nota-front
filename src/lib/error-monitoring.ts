type ErrorPayload = {
  message: string;
  source?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
};

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: unknown, context?: unknown) => void;
      captureMessage: (message: string, context?: unknown) => void;
    };
  }
}

export function captureAppError(payload: ErrorPayload) {
  const normalizedPayload = {
    message: payload?.message || "Erro não identificado",
    source: payload?.source || "unknown",
    stack: payload?.stack || "",
    metadata: payload?.metadata || {},
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && window.Sentry?.captureMessage) {
    window.Sentry.captureMessage(normalizedPayload.message, {
      level: "error",
      extra: {
        source: normalizedPayload.source,
        stack: normalizedPayload.stack,
        ...normalizedPayload.metadata,
        timestamp: normalizedPayload.timestamp,
      },
    });
    return;
  }

  // In dev, avoid triggering Next.js error overlay for telemetry-only logs.
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[APP_ERROR_MONITOR] ${normalizedPayload.message}`,
      normalizedPayload,
    );
    return;
  }

  console.error(`[APP_ERROR_MONITOR] ${normalizedPayload.message}`, normalizedPayload);
}
