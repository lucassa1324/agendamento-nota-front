import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ASAAS_API_KEY, ASAAS_API_URL } from "@/lib/asaas";

const normalizeEnvValue = (value?: string) =>
  value?.trim().replace(/^['"]|['"]$/g, "") || "";

const extractEnvValueFromContent = (content: string, key: string) => {
  const regex = new RegExp(`^${key}=(.*)$`, "m");
  const match = content.match(regex);
  if (!match?.[1]) {
    return "";
  }
  return normalizeEnvValue(match[1]);
};

const readEnvFallback = async (key: string) => {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "front_end", ".env.local"),
  ];

  for (const envPath of candidates) {
    try {
      const content = await readFile(envPath, "utf8");
      const value = extractEnvValueFromContent(content, key);
      if (value) {
        return value;
      }
    } catch { }
  }

  return "";
};

type AsaasPaymentLink = {
  url?: string;
  paymentLinkUrl?: string;
  shortUrl?: string;
  errors?: Array<{ description?: string }>;
};

class AsaasApiError extends Error {
  asaasData?: unknown;
  status?: number;

  constructor(message: string, options?: { asaasData?: unknown; status?: number }) {
    super(message);
    this.name = "AsaasApiError";
    this.asaasData = options?.asaasData;
    this.status = options?.status;
  }
}

const formatDateToYmd = (date: Date) => date.toISOString().split("T")[0];

const resolveAsaasErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "object" && payload) {
    const asaasPayload = payload as { errors?: Array<{ description?: string }> };
    const firstError = asaasPayload.errors?.[0]?.description;
    if (firstError) {
      return firstError;
    }
  }
  return fallback;
};

export async function POST(req: Request) {
  try {
    const {
      customerEmail,
      customerName,
      customerCpfCnpj,
      businessId,
      planPrice,
      planName,
    } = await req.json();

    console.log(
      `>>> [ASAAS_CREATE_LINK] Iniciando para businessId: ${businessId}, Email: ${customerEmail}, Plano: ${planName || "Pro"}`,
    );

    // Capturar IP do cliente do header x-client-ip
    const clientIp = req.headers.get("x-client-ip") || "127.0.0.1";

    const asaasApiKey =
      normalizeEnvValue(process.env.ASAAS_API_KEY) ||
      normalizeEnvValue(ASAAS_API_KEY) ||
      (await readEnvFallback("ASAAS_API_KEY"));
    const asaasApiUrl =
      normalizeEnvValue(process.env.ASAAS_API_URL) ||
      normalizeEnvValue(ASAAS_API_URL) ||
      (await readEnvFallback("ASAAS_API_URL")) ||
      "https://api-sandbox.asaas.com/v3";
    const targetUrl =
      process.env.API_PROXY_TARGET_URL || "http://127.0.0.1:3001";
    const normalizedCustomerCpfCnpj = String(customerCpfCnpj || "").replace(
      /\D/g,
      "",
    );
    let resolvedCustomerCpfCnpj = normalizedCustomerCpfCnpj;

    if (!resolvedCustomerCpfCnpj && customerEmail) {
      try {
        const usersResponse = await fetch(`${targetUrl}/users/`, {
          method: "GET",
          cache: "no-store",
        });
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const currentUser = Array.isArray(users)
            ? users.find(
              (user: { email?: string; cpfCnpj?: string }) =>
                user.email?.toLowerCase() ===
                String(customerEmail).toLowerCase(),
            )
            : null;
          resolvedCustomerCpfCnpj = String(currentUser?.cpfCnpj || "").replace(
            /\D/g,
            "",
          );
        }
      } catch (error) {
        console.error("Erro ao buscar CPF do usuário no backend:", error);
      }
    }

    const isValidCpfCnpj =
      resolvedCustomerCpfCnpj.length === 11 ||
      resolvedCustomerCpfCnpj.length === 14;
    if (!isValidCpfCnpj) {
      return NextResponse.json(
        {
          error:
            "CPF/CNPJ obrigatório para gerar pagamento. Atualize em Minha Conta.",
        },
        { status: 400 },
      );
    }

    if (!asaasApiKey) {
      console.error("ASAAS_API_KEY não configurada");
      return NextResponse.json(
        { error: "Erro de configuração do servidor" },
        { status: 500 },
      );
    }

    // 1. Verificar se o cliente já existe no Asaas
    const customerSearchResponse = await fetch(
      `${asaasApiUrl}/customers?email=${customerEmail}`,
      {
        headers: { access_token: asaasApiKey },
      },
    );
    const customerSearchResult = await customerSearchResponse.json();

    let customerId = customerSearchResult.data?.[0]?.id;
    const existingCustomerCpfCnpj = String(
      customerSearchResult.data?.[0]?.cpfCnpj || "",
    ).replace(/\D/g, "");

    if (customerId && resolvedCustomerCpfCnpj && !existingCustomerCpfCnpj) {
      const updateCustomerResponse = await fetch(
        `${asaasApiUrl}/customers/${customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            access_token: asaasApiKey,
            "x-forwarded-for": clientIp,
          },
          body: JSON.stringify({
            name: customerName,
            email: customerEmail,
            cpfCnpj: resolvedCustomerCpfCnpj,
            externalReference: businessId,
            remoteIp: clientIp,
          }),
        },
      );
      const updatedCustomer = await updateCustomerResponse.json();
      if (updatedCustomer.errors) {
        throw new Error(updatedCustomer.errors[0].description);
      }
    }

    // 2. Se não existir, criar cliente
    if (!customerId) {
      const createCustomerResponse = await fetch(`${asaasApiUrl}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: asaasApiKey,
          "x-forwarded-for": clientIp,
        },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          cpfCnpj: resolvedCustomerCpfCnpj,
          externalReference: businessId,
          remoteIp: clientIp,
        }),
      });

      const newCustomer = await createCustomerResponse.json();
      if (newCustomer.errors) {
        throw new Error(newCustomer.errors[0].description);
      }
      customerId = newCustomer.id;
    }

    // 3. Buscar preço dinâmico do backend se não for informado pelo front
    let subscriptionValue = planPrice || 49.9; // Valor informado ou padrão
    if (!planPrice) {
      try {
        const pricingResponse = await fetch(
          `${targetUrl}/api/business/settings/pricing`,
        );
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          if (pricingData.price) {
            subscriptionValue = pricingData.price;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar preço dinâmico para Asaas:", error);
      }
    }

    subscriptionValue = Number(subscriptionValue);
    if (!Number.isFinite(subscriptionValue) || subscriptionValue <= 0) {
      return NextResponse.json(
        { error: "Valor do plano inválido para gerar cobrança recorrente." },
        { status: 400 },
      );
    }

    const recurringPaymentLinkPayload = {
      name: planName
        ? `Assinatura ${planName} - ${customerName}`
        : `Assinatura Pro - ${customerName}`,
      description: planName
        ? `Assinatura recorrente (${planName}) - Aura Sistema`
        : "Assinatura recorrente Pro - Aura Sistema",
      billingType: "CREDIT_CARD",
      chargeType: "RECURRENT",
      period: "MONTHLY",
      subscriptionCycle: "MONTHLY",
      value: subscriptionValue,
      dueDateLimitDays: 1,
      endDate: formatDateToYmd(
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      ),
      externalReference: businessId,
    };

    const paymentLinkResponse = await fetch(`${asaasApiUrl}/paymentLinks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
        "x-forwarded-for": clientIp,
      },
      body: JSON.stringify(recurringPaymentLinkPayload),
    });

    const paymentLinkData = (await paymentLinkResponse.json()) as AsaasPaymentLink;
    const checkoutUrl =
      paymentLinkData?.url ||
      paymentLinkData?.paymentLinkUrl ||
      paymentLinkData?.shortUrl;

    if (!paymentLinkResponse.ok || !checkoutUrl) {
      throw new AsaasApiError(
        resolveAsaasErrorMessage(
          paymentLinkData,
          "Falha ao gerar link de pagamento recorrente no Asaas",
        ),
        {
          asaasData: paymentLinkData,
          status: paymentLinkResponse.status,
        },
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: unknown) {
    const err = error as
      | (Error & { response?: { data?: unknown }; asaasData?: unknown })
      | undefined;
    const errorMessage = err?.message || "Erro desconhecido";
    const rawAsaasError = err?.response?.data || err?.asaasData || err?.message;
    try {
      console.log(JSON.stringify(rawAsaasError));
    } catch {
      console.log(String(rawAsaasError));
    }
    console.error("ERRO ASAAS:", rawAsaasError);
    console.error("Erro na integração com Asaas:", errorMessage);
    return NextResponse.json(
      {
        error: errorMessage || "Erro ao processar pagamento",
        asaasError: rawAsaasError || null,
      },
      { status: 500 },
    );
  }
}
