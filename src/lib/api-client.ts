import { getSessionToken } from "./auth-client";

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
    } catch {
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

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: "include", // Equivale a withCredentials: true
      ...options,
      headers,
    });
  } catch (error: unknown) {
    // Tratamento de erro de rede ou CORS (Failed to fetch)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error(">>> [FRONT_API] Erro de rede ou CORS detectado:", errorMessage);

    // Se falhar o fetch e não for erro de conexão local, tentamos verificar se a sessão expirou ou se é bloqueio CORS
    if (typeof window !== "undefined") {
      // Diagnóstico: Se estivermos em uma rota de dashboard, o erro de rede pode ser um bloqueio do navegador (CORS) 
      // causado por headers inválidos ou 403 mal formatado no backend.
      if (!window.location.pathname.startsWith("/admin/master") && window.location.pathname.includes("/dashboard")) {
        console.warn(">>> [FRONT_API] Falha crítica na requisição. Tentando revalidar sessão ou redirecionar por segurança...");
        
        // Em caso de erro de rede persistente em rota protegida, redirecionamos para evitar loops de UI
        // mas damos uma chance para o usuário logar novamente se for apenas sessão expirada.
        // Se o erro for recorrente, o window.location quebrará o loop.
      }
    }
    throw error;
  }

  // Interceptar erro 403 (Acesso Negado / Suspensão)
  if (response.status === 403) {
    // Se for uma rota de API e não estivermos no Master Admin, redirecionar imediatamente
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/master")) {
      console.error(">>> [FRONT_API] 403 Forbidden detectado. Redirecionando via window.location para quebrar loop...");
      
      // Força o redirecionamento total para a página de suspensão
      window.location.href = "/acesso-suspenso";
      
      // Retorna uma promessa que nunca resolve para "congelar" a execução atual
      // e impedir que o restante do código (como .then ou try/catch da UI) execute
      return new Promise<Response>(() => {});
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
