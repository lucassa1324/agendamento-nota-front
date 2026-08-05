
// ==========================================
// CONFIGURAÇÕES DE URL (Consolidado do antigo api-config)
// ==========================================

const DEFAULT_BACKEND_URL = "http://localhost:3001";
const DEFAULT_APP_URL = "http://localhost:3000";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeUrl = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  if (isAbsoluteUrl(trimmed)) return stripTrailingSlash(trimmed);
  return stripTrailingSlash(`https://${trimmed}`);
};

export const API_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_API_URL,
  DEFAULT_BACKEND_URL,
);

export const APP_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_APP_URL,
  DEFAULT_APP_URL,
);

export const AUTH_BASE_PATH = "/api/auth";

export const buildApiUrl = (path: string) => {
  if (isAbsoluteUrl(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildAuthUrl = (path = "") => {
  const normalizedPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${API_BASE_URL}${AUTH_BASE_PATH}${normalizedPath}`;
};

// ==========================================
// CLIENTE DE API E INTERCEPTORS
// ==========================================

let billingGuardActive = false;

function createBillingRequiredResponse() {
  return new Response(JSON.stringify({ error: "BILLING_REQUIRED" }), {
    status: 402,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Utilitário global para fetch com interceptação de erros específicos
 * como BUSINESS_SUSPENDED (403), BILLING_REQUIRED (402) e expiração de sessão (401).
 */
export async function customFetch(url: string, options: RequestInit = {}) {
  // Guard de cobrança no client-side
  if (typeof window !== "undefined") {
    const isDashboardRoute = window.location.pathname.includes("/dashboard");
    const isMinhaContaRoute = window.location.pathname.includes("/dashboard/minha-conta");

    if (billingGuardActive && (isMinhaContaRoute || !isDashboardRoute)) {
      billingGuardActive = false;
    }

    if (billingGuardActive && isDashboardRoute && !isMinhaContaRoute) {
      return createBillingRequiredResponse();
    }
  }

  const { getSessionToken } = await import("./auth-client");
  const sessionToken = await getSessionToken();
  const fullUrl = isAbsoluteUrl(url) || url.startsWith("//") ? url : buildApiUrl(url);

  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (sessionToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  console.log(`>>> [FRONT_API] ${options.method || "GET"} -> ${fullUrl}`);

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    console.error(`>>> [FRONT_API] Falha crítica no fetch para ${fullUrl}:`, error);
    throw error;
  }

  // Interceptadores de status de resposta
  if (typeof window !== "undefined") {
    const isDashboardRoute = window.location.pathname.includes("/dashboard");
    const isMinhaContaRoute = window.location.pathname.includes("/dashboard/minha-conta");

    // 403: Acesso suspenso
    if (
      response.status === 403 &&
      !window.location.pathname.startsWith("/admin") &&
      !isMinhaContaRoute &&
      !window.location.pathname.startsWith("/acesso-suspenso")
    ) {
      console.error(`>>> [FRONT_API] 403 detectado. Redirecionando...`);
      window.location.href = "/acesso-suspenso";
      return new Promise<Response>(() => {}); // Congela a execução atual para evitar loops
    }

    // 402 ou 401 no Dashboard (excluindo minha-conta)
    if ((response.status === 402 || response.status === 401) && isDashboardRoute && !isMinhaContaRoute) {
      if (!billingGuardActive) {
        billingGuardActive = true;
        window.dispatchEvent(
          new CustomEvent("billing-required", {
            detail: { url: fullUrl, sourceStatus: response.status },
          })
        );
      }
      return createBillingRequiredResponse();
    }

    // 401 fora do Dashboard (exemplo: cache do Studio)
    if (response.status === 401 && url.includes("/studio/")) {
      const cachedStudio = localStorage.getItem("studio_data");
      if (cachedStudio) {
        return new Response(cachedStudio, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  return response;
}
