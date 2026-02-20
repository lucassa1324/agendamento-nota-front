import { NextResponse } from "next/server";
import { ASAAS_API_KEY, ASAAS_API_URL } from "@/lib/asaas";

export async function POST(req: Request) {
  try {
    const { customerEmail, customerName, customerCpfCnpj } = await req.json();

    if (!ASAAS_API_KEY) {
      console.error("ASAAS_API_KEY não configurada");
      return NextResponse.json(
        { error: "Erro de configuração do servidor" },
        { status: 500 },
      );
    }

    // 1. Verificar se o cliente já existe no Asaas
    const customerSearchResponse = await fetch(
      `${ASAAS_API_URL}/customers?email=${customerEmail}`,
      {
        headers: { access_token: ASAAS_API_KEY },
      },
    );
    const customerSearchResult = await customerSearchResponse.json();

    let customerId = customerSearchResult.data?.[0]?.id;

    // 2. Se não existir, criar cliente
    if (!customerId) {
      const createCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: ASAAS_API_KEY,
        },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          cpfCnpj: customerCpfCnpj,
        }),
      });

      const newCustomer = await createCustomerResponse.json();
      if (newCustomer.errors) {
        throw new Error(newCustomer.errors[0].description);
      }
      customerId = newCustomer.id;
    }

    // 3. Criar Assinatura (Subscription)
    // Verifica se já tem assinatura ativa para evitar duplicidade
    const subscriptionsResponse = await fetch(
      `${ASAAS_API_URL}/subscriptions?customer=${customerId}&status=ACTIVE`,
      {
        headers: { access_token: ASAAS_API_KEY },
      },
    );
    const subscriptions = await subscriptionsResponse.json();

    let subscriptionId = subscriptions.data?.[0]?.id;

    if (!subscriptionId) {
      const createSubscriptionResponse = await fetch(
        `${ASAAS_API_URL}/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: ASAAS_API_KEY,
          },
          body: JSON.stringify({
            customer: customerId,
            billingType: "UNDEFINED", // Permite ao usuário escolher (Boleto/Pix/Cartão) na tela de pagamento
            value: 49.99,
            nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Vence amanhã
            cycle: "MONTHLY",
            description: "Assinatura Plano Pro - Brow Studio",
          }),
        },
      );

      const newSubscription = await createSubscriptionResponse.json();
      if (newSubscription.errors) {
        throw new Error(newSubscription.errors[0].description);
      }
      subscriptionId = newSubscription.id;
    }

    // 4. Obter a URL da primeira cobrança ou da assinatura
    // O Asaas não retorna um link direto para a "assinatura" como um todo para pagamento imediato da primeira,
    // mas sim cria cobranças. Vamos pegar a cobrança pendente mais recente.

    const paymentsResponse = await fetch(
      `${ASAAS_API_URL}/payments?subscription=${subscriptionId}&status=PENDING`,
      {
        headers: { access_token: ASAAS_API_KEY },
      },
    );
    const payments = await paymentsResponse.json();

    if (payments.data && payments.data.length > 0) {
      // Retorna a URL da fatura (invoiceUrl) ou link do boleto (bankSlipUrl)
      // invoiceUrl é a página de pagamento completa do Asaas
      return NextResponse.json({ url: payments.data[0].invoiceUrl });
    }

    // Se não tiver pagamento pendente (ex: acabou de criar e o Asaas ainda não gerou, ou erro),
    // retorna erro ou tenta novamente.
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
