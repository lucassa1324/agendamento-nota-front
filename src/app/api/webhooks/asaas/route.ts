import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { companies, db, user } from "../../../../lib/db-webhook";

const ASAAS_API_URL =
  process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    console.log(`[ASAAS_WEBHOOK] Evento recebido: ${event.event}`);

    if (
      event.event === "PAYMENT_CONFIRMED" ||
      event.event === "PAYMENT_RECEIVED"
    ) {
      const payment = event.payment;
      const customerId = payment.customer;

      if (!ASAAS_API_KEY) {
        console.error("ASAAS_API_KEY não configurada");
        return NextResponse.json(
          { error: "Erro de configuração" },
          { status: 500 },
        );
      }

      // Buscar dados do cliente no Asaas para obter o email
      const customerResponse = await fetch(
        `${ASAAS_API_URL}/customers/${customerId}`,
        {
          headers: { access_token: ASAAS_API_KEY },
        },
      );

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        const email = customerData.email;

        if (email) {
          console.log(
            `[ASAAS_WEBHOOK] Processando pagamento para email: ${email}`,
          );

          // 1. Buscar usuário pelo email
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.email, email));

          if (userData) {
            // 2. Ativar usuário
            await db
              .update(user)
              .set({ active: true, updatedAt: new Date() })
              .where(eq(user.id, userData.id));

            // 3. Ativar estúdio vinculado (se houver)
            const [companyData] = await db
              .select()
              .from(companies)
              .where(eq(companies.ownerId, userData.id));

            if (companyData) {
              await db
                .update(companies)
                .set({ active: true, updatedAt: new Date() })
                .where(eq(companies.id, companyData.id));
              console.log(
                `[ASAAS_WEBHOOK] Estúdio ${companyData.name} ativado.`,
              );
            }

            console.log(
              `[ASAAS_WEBHOOK] Usuário ${userData.email} ativado com sucesso.`,
            );
          } else {
            console.warn(
              `[ASAAS_WEBHOOK] Usuário não encontrado no sistema para email ${email}`,
            );
          }
        } else {
          console.warn(
            `[ASAAS_WEBHOOK] Email não encontrado no cadastro do cliente Asaas ${customerId}`,
          );
        }
      } else {
        console.error(
          `[ASAAS_WEBHOOK] Erro ao buscar cliente ${customerId} no Asaas`,
        );
      }
    } else if (event.event === "PAYMENT_OVERDUE") {
      console.log(`[ASAAS_WEBHOOK] Pagamento vencido recebido.`);
      // Implementar lógica de bloqueio se necessário
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("[ASAAS_WEBHOOK_ERROR]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
