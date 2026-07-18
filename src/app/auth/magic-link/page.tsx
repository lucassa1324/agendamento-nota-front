"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Token não encontrado na URL.");
      return;
    }

    const validate = async () => {
      try {
        const response = await fetch(
          `/api-proxy/api/users/magic-link/validate`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setErrorMsg(data.message || "Link inválido ou expirado.");
          return;
        }

        setStatus("success");

        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } catch {
        setStatus("error");
        setErrorMsg("Erro de conexão. Tente novamente.");
      }
    };

    validate();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Validando acesso..."}
            {status === "success" && "Login realizado!"}
            {status === "error" && "Erro no acesso"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-muted-foreground">
              Aguarde enquanto validamos seu link de acesso.
            </p>
          )}
          {status === "success" && (
            <p className="text-muted-foreground">
              Redirecionando para o painel...
            </p>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <p className="text-muted-foreground">{errorMsg}</p>
              <p className="text-sm">
                <a
                  href="/admin"
                  className="text-primary hover:underline font-medium"
                >
                  Ir para o login
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
