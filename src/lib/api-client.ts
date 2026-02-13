import { getSessionToken, signOut } from "./auth-client";

/**
 * Utilitário global para fetch com interceptação de erros específicos
 * como BUSINESS_SUSPENDED (403).
 */
export async function customFetch(url: string, options: RequestInit = {}) {
  const sessionToken = await getSessionToken();

  // Tentar extrair businessId da URL ou do corpo da requisição
  let businessId = "N/A";
  
  // 1. Verificar na URL
  if (url.includes("/api/business/")) {
    const parts = url.split("/api/business/");
    if (parts[1]) {
      businessId = parts[1].split(/[/?#]/)[0];
    }
  } else if (url.includes("companyId=")) {
    const match = url.match(/companyId=([^&]+)/);
    if (match) businessId = match[1];
  }
  
  // 2. Se for POST/PATCH e ainda for N/A, tentar extrair do body
  if (businessId === "N/A" && options.body && typeof options.body === 'string') {
    try {
      const body = JSON.parse(options.body);
      businessId = body.companyId || body.businessId || body.id || "N/A";
    } catch (e) {
      // Body não é JSON ou erro ao parsear
    }
  }

  console.log('>>> [FRONT_API] Enviando ID:', businessId);
  console.log(`>>> [FRONT_API] Enviando para: ${url}`);

  const headers = new Headers(options.headers || {});
  
  // Garantir Content-Type para requisições com body
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (sessionToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  const response = await fetch(url, {
    credentials: "include", // Equivale a withCredentials: true
    ...options,
    headers,
  });

  // Interceptar erro 403 BUSINESS_SUSPENDED
  if (response.status === 403) {
    const clonedResponse = response.clone();
    try {
      const data = await clonedResponse.json();
      
      // Captura qualquer erro 403 que indique suspensão de estúdio
      const isSuspended = 
        data.error === "BUSINESS_SUSPENDED" || 
        data.code === "BUSINESS_SUSPENDED" ||
        (data.message && data.message.includes("suspenso"));

      if (isSuspended) {
        // EXCEÇÃO: Se estiver no painel Master Admin, não redireciona para permitir que o admin reative
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/master")) {
          console.error(">>> [AUTH_INTERCEPTOR] Estúdio suspenso detectado via 403. Redirecionando globalmente...");
          
          // Redirecionar para tela de suspensão
          window.location.href = "/acesso-suspenso";
          
          // Retornar uma promessa que nunca resolve para interromper o fluxo atual e evitar que a UI tente processar erro
          return new Promise<Response>(() => {});
        }
      }
    } catch (e) {
      // Se não for JSON ou erro inesperado, segue o fluxo normal (ex: Forbidden comum por permissão)
    }
  }

  // Interceptar erro 401 para fallback de cache
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      const cachedStudio = localStorage.getItem('studio_data');
      if (cachedStudio && url.includes('/studio/')) {
        return new Response(cachedStudio, { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }
  }

  return response;
}
