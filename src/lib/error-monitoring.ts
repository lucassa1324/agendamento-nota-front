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
  if (typeof window !== "undefined" && window.Sentry?.captureMessage) {
    window.Sentry.captureMessage(payload.message, {
      level: "error",
      extra: {
        source: payload.source,
        stack: payload.stack,
        ...payload.metadata,
      },
    });
    return;
  }

  console.error("[APP_ERROR_MONITOR]", payload);
}
