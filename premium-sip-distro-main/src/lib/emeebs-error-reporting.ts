type EmeebsErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type EmeebsEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: EmeebsErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __emeebsEvents?: EmeebsEvents;
  }
}

export function reportEmeebsError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__emeebsEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
