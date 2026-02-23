"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function SuspensePage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Garante limpeza de dados sensíveis ao entrar na tela de bloqueio
    // Isso evita que o Header (se visível) mostre dados de outro estúdio/sessão anterior
    if (typeof window !== "undefined") {
      // Limpeza preventiva de chaves específicas que podem causar confusão visual
      localStorage.removeItem("siteProfile");
      localStorage.removeItem("studioSettings");
      localStorage.removeItem("services");
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      if (typeof window !== "undefined") {
        // Limpeza agressiva para garantir que não reste nada da sessão anterior
        localStorage.clear();
        sessionStorage.clear();
        // Redirecionamento forçado para garantir reload da aplicação
        window.location.href = "/admin";
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="mb-6 p-4 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={48} />
      </div>

      <h1 className="text-4xl font-bold mb-4">Acesso Interrompido</h1>

      <div className="max-w-md space-y-4 mb-8">
        <p className="text-xl text-muted-foreground">
          Entre em contato com a administração para regularizar seu acesso.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          className="px-8"
          onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
        >
          Falar com Suporte
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="px-8"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Saindo..." : "Voltar ao Login"}
        </Button>
      </div>
    </div>
  );
}
