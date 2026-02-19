import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { description, screenshot, url, userAgent } = await req.json();

    if (!description || !screenshot) {
      return NextResponse.json(
        { error: "Descrição e screenshot são obrigatórios." },
        { status: 400 }
      );
    }

    // TODO: Implementar persistência real (salvar no banco de dados, enviar email, etc.)
    // Por enquanto, apenas logamos no console para simular o recebimento.
    console.log("=== NOVO FEEDBACK RECEBIDO ===");
    console.log("URL:", url);
    console.log("User Agent:", userAgent);
    console.log("Descrição:", description);
    console.log("Screenshot (base64 length):", screenshot.length);
    console.log("==============================");

    return NextResponse.json({ message: "Feedback recebido com sucesso!" });
  } catch (error) {
    console.error("Erro ao processar feedback:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar feedback." },
      { status: 500 }
    );
  }
}
