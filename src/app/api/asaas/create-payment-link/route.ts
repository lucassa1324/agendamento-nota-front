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

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

type AsaasPayment = {
  status?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
};

const isPayableStatus = (status?: string) =>
  status === "PENDING" || status === "OVERDUE";

export async function POST(req: Request) {
  try {
    const {
      customerEmail,
      customerName,
      customerCpfCnpj,
      businessId,
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
      if (!resolvedCustomerCpfCnpj) {
        throw new Error("CPF não encontrado para este usuário.");
      }
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

    // 3. Buscar sempre o preço oficial configurado no painel Master (evita valor hardcoded no front)
    let subscriptionValue = 49.9;
    try {
      const pricingResponse = await fetch(
        `${targetUrl}/api/business/settings/pricing`,
        {
          method: "GET",
          cache: "no-store",
        },
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

    // 4. Criar Assinatura (Subscription)
    // Verifica se já tem assinatura ativa para evitar duplicidade
    const subscriptionsResponse = await fetch(
      `${asaasApiUrl}/subscriptions?customer=${customerId}&status=ACTIVE`,
      {
        headers: { access_token: asaasApiKey },
      },
    );
    const subscriptions = await subscriptionsResponse.json();

    let subscriptionId = subscriptions.data?.[0]?.id;

    if (!subscriptionId) {
      const createSubscriptionResponse = await fetch(
        `${asaasApiUrl}/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: asaasApiKey,
            "x-forwarded-for": clientIp,
          },
          body: JSON.stringify({
            customer: customerId,
            billingType: "UNDEFINED", // Permite ao usuário escolher (Boleto/Pix/Cartão) na tela de pagamento
            value: subscriptionValue,
            nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Vence amanhã
            cycle: "MONTHLY",
            description: planName
              ? `Assinatura Plano ${planName} - Aura Sistema`
              : "Assinatura Plano Pro - Aura Sistema",
            externalReference: businessId,
            remoteIp: clientIp,
          }),
        },
      );

      const newSubscription = await createSubscriptionResponse.json();
      if (newSubscription.errors) {
        throw new Error(newSubscription.errors[0].description);
      }
      subscriptionId = newSubscription.id;
    }

    const findPayableInvoiceUrl = async () => {
      for (let attempt = 0; attempt < 4; attempt++) {
        const pendingResponse = await fetch(
          `${asaasApiUrl}/payments?subscription=${subscriptionId}&status=PENDING&limit=10`,
          {
            headers: { access_token: asaasApiKey },
          },
        );
        const pendingPayload = (await pendingResponse.json()) as {
          data?: AsaasPayment[];
        };
        const pendingPayment = pendingPayload.data?.find((payment) =>
          isPayableStatus(payment?.status || "PENDING"),
        );
        const pendingUrl = pendingPayment?.invoiceUrl || pendingPayment?.bankSlipUrl;
        if (pendingUrl) {
          return pendingUrl;
        }

        const overdueResponse = await fetch(
          `${asaasApiUrl}/payments?subscription=${subscriptionId}&status=OVERDUE&limit=10`,
          {
            headers: { access_token: asaasApiKey },
          },
        );
        const overduePayload = (await overdueResponse.json()) as {
          data?: AsaasPayment[];
        };
        const overduePayment = overduePayload.data?.find((payment) =>
          isPayableStatus(payment?.status || "OVERDUE"),
        );
        const overdueUrl = overduePayment?.invoiceUrl || overduePayment?.bankSlipUrl;
        if (overdueUrl) {
          return overdueUrl;
        }

        await wait(1200);
      }
      return "";
    };

    const payableUrl = await findPayableInvoiceUrl();
    if (payableUrl) {
      return NextResponse.json({ url: payableUrl });
    }

    const createPaymentResponse = await fetch(`${asaasApiUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: asaasApiKey,
        "x-forwarded-for": clientIp,
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "UNDEFINED",
        value: subscriptionValue,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        description: planName
          ? `Assinatura Plano ${planName} - Aura Sistema`
          : "Assinatura Plano Pro - Aura Sistema",
        externalReference: businessId,
        remoteIp: clientIp,
      }),
    });
    const newPayment = await createPaymentResponse.json();
    if (newPayment?.errors) {
      throw new Error(
        newPayment.errors?.[0]?.description ||
        "Erro ao criar nova cobrança no Asaas",
      );
    }
    const fallbackUrl = newPayment?.invoiceUrl || newPayment?.bankSlipUrl;

    if (fallbackUrl) {
      return NextResponse.json({ url: fallbackUrl });
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível gerar o link de pagamento neste momento. Tente novamente em instantes.",
      },
      { status: 500 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro na integração com Asaas:", errorMessage);
    return NextResponse.json(
      { error: errorMessage || "Erro ao processar pagamento" },
      { status: 500 },
    );
  }
}
