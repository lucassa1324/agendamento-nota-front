import { NextResponse } from "next/server";
import { ASAAS_API_URL, ASAAS_API_KEY } from "@/lib/asaas";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!ASAAS_API_KEY) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // 1. Find Customer
    const customerRes = await fetch(`${ASAAS_API_URL}/customers?email=${email}`, {
      headers: { access_token: ASAAS_API_KEY },
    });
    const customerData = await customerRes.json();
    const customer = customerData.data?.[0];

    if (!customer) {
      return NextResponse.json({ 
        status: "Sem Cadastro", 
        history: [],
        lastPayment: null,
        nextInvoice: null
      });
    }

    // 2. Get Subscriptions
    const subsRes = await fetch(`${ASAAS_API_URL}/subscriptions?customer=${customer.id}`, {
      headers: { access_token: ASAAS_API_KEY },
    });
    const subsData = await subsRes.json();
    const subscription = subsData.data?.[0];

    // 3. Get Payments (History)
    const paymentsRes = await fetch(`${ASAAS_API_URL}/payments?customer=${customer.id}&limit=5`, {
      headers: { access_token: ASAAS_API_KEY },
    });
    const paymentsData = await paymentsRes.json();
    
    // Calculate fields
    let status = "Inativo";
    if (subscription) {
        if (subscription.status === "ACTIVE") status = "Ativo";
        else if (subscription.status === "OVERDUE") status = "Vencido";
        else status = subscription.status; // EXPIRED, etc.
    } else {
        // Check if there are paid payments recently
        // ... simplified logic
    }

    const lastPayment = paymentsData.data?.find((p: any) => p.status === "RECEIVED" || p.status === "CONFIRMED");
    const nextInvoice = paymentsData.data?.find((p: any) => p.status === "PENDING" || p.status === "OVERDUE");

    return NextResponse.json({
      status,
      history: paymentsData.data?.map((p: any) => ({
        id: p.id,
        value: p.value,
        dueDate: p.dueDate,
        status: p.status,
        invoiceUrl: p.invoiceUrl
      })) || [],
      lastPaymentDate: lastPayment?.paymentDate || lastPayment?.clientPaymentDate || null,
      nextInvoiceDate: nextInvoice?.dueDate || subscription?.nextDueDate || null,
    });

  } catch (error: any) {
    console.error("Error fetching financial details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
