export const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://sandbox.asaas.com/v3";
export const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

export async function createAsaasCustomer(customerData: {
  name: string;
  email: string;
  cpfCnpj?: string;
  externalReference?: string;
}) {
  const response = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.errors?.[0]?.description || "Erro ao criar cliente no Asaas",
    );
  }

  return response.json();
}

export async function createAsaasPaymentLink(paymentData: {
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  chargeType: "DETACHED" | "RECURRENT" | "INSTALLMENT";
  name: string;
  description: string;
  endDate?: string;
  value: number;
  dueDateLimitDays?: number;
  subscriptionCycle?:
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "SEMIANNUALLY"
    | "YEARLY";
  maxInstallmentCount?: number;
}) {
  // Para assinaturas, o endpoint é diferente (/subscriptions), mas o User pediu "Link de Pagamento".
  // Se for assinatura recorrente, geralmente se cria uma assinatura.
  // Mas o Asaas tem "Link de Pagamento" que pode ser cobrado.
  // O user disse "Plano Pro por R$ 49,99/mês", então é assinatura.
  // Mas pediu "gera o link de pagamento no Asaas".
  // O Asaas tem "Payment Links" que podem ser usados para cobrar.
  // Vamos usar a API de paymentLinks se for um link genérico, ou subscriptions se for estruturado.
  // Pela simplicidade "abrir a URL em uma nova aba", talvez o melhor seja criar uma cobrança e pegar o invoiceUrl, ou um link de pagamento.

  // Vou assumir a criação de uma assinatura e retornar o link da fatura/assinatura ou criar um Link de Pagamento fixo.
  // Se o user quer "Link de Pagamento" (PaymentLink feature), é um objeto diferente.

  // Vamos criar um PaymentLink simples para o valor.

  const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.errors?.[0]?.description ||
        "Erro ao criar link de pagamento no Asaas",
    );
  }

  return response.json();
}

export async function createAsaasSubscription(subscriptionData: {
  customer: string; // ID do cliente no Asaas
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY";
  description: string;
}) {
  const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    },
    body: JSON.stringify(subscriptionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.errors?.[0]?.description || "Erro ao criar assinatura no Asaas",
    );
  }

  return response.json();
}
