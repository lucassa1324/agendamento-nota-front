import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, description, screenshot, url, userAgent, metadata } =
      await req.json();

    if (!description || !type) {
      return NextResponse.json(
        { error: "Tipo e descrição são obrigatórios." },
        { status: 400 },
      );
    }

    const requestOrigin = new URL(req.url).origin;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "/api-proxy").replace(
      /\/$/,
      "",
    );
    const backendUrl = apiBase.startsWith("http")
      ? apiBase
      : `${requestOrigin}${apiBase}`;

    const response = await fetch(`${backendUrl}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        description,
        screenshot,
        url,
        userAgent,
        metadata,
      }),
      cache: "no-store",
    });

    const responseData = await response
      .json()
      .catch(() => ({ error: "Resposta inválida do servidor." }));

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData?.error || "Falha ao registrar feedback." },
        { status: response.status || 500 },
      );
    }

    return NextResponse.json({
      message: "Feedback recebido com sucesso!",
      id: responseData?.id,
      screenshotUrl: responseData?.screenshotUrl,
    });
  } catch (error) {
    console.error("Erro ao processar feedback:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar feedback." },
      { status: 500 },
    );
  }
}
