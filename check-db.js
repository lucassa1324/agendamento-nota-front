
const companyId = process.argv[2];
const customBaseUrl = process.argv[3];
const token = process.argv[4] || process.env.CHECK_DB_TOKEN || "";

if (!companyId) {
  console.error("Uso: node check-db.js <companyId> [baseUrl] [token]");
  process.exit(1);
}

async function checkDBServicesColor() {
  console.log(`>>> Verificando banco para empresa: ${companyId}`);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const baseUrl =
    customBaseUrl ||
    process.env.CHECK_DB_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const requestHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const candidates = [
    `http://127.0.0.1:3001/api/settings/draft/${companyId}`,
    `${normalizedBaseUrl}/api-proxy/api/settings/draft/${companyId}`,
    `${normalizedBaseUrl}/api/settings/draft/${companyId}`,
    `https://api.agendamentonota.com.br/api/settings/draft/${companyId}`,
  ];

  const urls = Array.from(new Set(candidates));
  let lastNetworkError = null;
  let response = null;
  let selectedUrl = "";

  for (const url of urls) {
    console.log(`>>> Tentando URL: ${url}`);
    try {
      const currentResponse = await fetch(url, {
        method: "GET",
        headers: requestHeaders,
      });

      if (!currentResponse.ok) {
        const body = await currentResponse.text();
        console.error(
          `❌ Resposta inválida (${currentResponse.status}) em ${url}: ${currentResponse.statusText}`,
        );
        console.error("Resposta do servidor:", body);
        continue;
      }

      response = currentResponse;
      selectedUrl = url;
      break;
    } catch (err) {
      lastNetworkError = err;
      console.error(
        `❌ Erro de rede/fetch em ${url}:`,
        err instanceof Error ? err.message : err,
      );
      if (err?.cause) {
        console.error("Causa:", err.cause);
      }
    }
  }

  if (!response) {
    if (lastNetworkError) {
      console.error(
        "❌ Nenhuma URL respondeu com sucesso. Último erro de rede:",
        lastNetworkError instanceof Error
          ? lastNetworkError.message
          : lastNetworkError,
      );
    } else {
      console.error("❌ Nenhuma URL respondeu com sucesso.");
    }
    process.exit(1);
  }

  console.log(`>>> URL funcional encontrada: ${selectedUrl}`);

  try {
    const data = await response.json();

    // O backend costuma retornar { siteCustomization: { ... } } ou o objeto direto
    const config = data.siteCustomization || data;

    console.log('\n--- RESULTADO DO BANCO (DRAFT) ---');

    // 1. Verifica na raiz
    const rootServices = config.services || {};
    console.log('Raiz (config.services):', {
      bgColor: rootServices.bgColor,
      appearance_bgColor: rootServices.appearance?.bgColor,
      appearance_backgroundColor: rootServices.appearance?.backgroundColor,
    });

    // 2. Verifica no home.servicesSection
    const home = config.home || {};
    const servicesSection = home.servicesSection || home.services_section || {};
    console.log('Home (home.servicesSection):', {
      bgColor: servicesSection.bgColor,
      appearance_bgColor: servicesSection.appearance?.bgColor,
      appearance_backgroundColor: servicesSection.appearance?.backgroundColor,
    });

    // 3. Verifica no layoutGlobal.services
    const layout = config.layoutGlobal || config.layout_global || {};
    const layoutServices = layout.services || layout.servicesSection || {};
    console.log('Layout (layoutGlobal.services):', {
      bgColor: layoutServices.bgColor,
      appearance_bgColor: layoutServices.appearance?.bgColor,
      appearance_backgroundColor: layoutServices.appearance?.backgroundColor,
    });

    console.log('\n--- OBJETO SERVICES COMPLETO NO HOME ---');
    console.log(JSON.stringify(servicesSection, null, 2));

    if (!servicesSection.appearance && !servicesSection.bgColor) {
      console.log('\n⚠️ ALERTA: O objeto servicesSection no banco está sem informações de cor!');
    }

  } catch (error) {
    console.error(
      "❌ Erro ao executar verificação:",
      error instanceof Error ? error.message : error,
    );
  }
}

checkDBServicesColor();
