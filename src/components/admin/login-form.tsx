"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithEmail } from "@/lib/auth-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Logs de Depuração: Confirmar credenciais antes de enviar
      console.log("Enviando credenciais:", { email });

      const result = await loginWithEmail(email, password);
      console.log("Dados recebidos:", result);

      if (result) {
        // Captura flexível de slug conforme solicitado pelo usuário
        const businessSlug =
          result.data?.user?.business?.slug ||
          result.data?.business?.slug ||
          result.user?.business?.slug ||
          result.business?.slug ||
          result.slug;

        if (!businessSlug) {
          console.warn(
            ">>> [LOGIN_FLOW] Login realizado, mas nenhum slug de estúdio foi encontrado na resposta.",
          );
          setError(
            "Sua conta não possui um estúdio vinculado. Verifique os cookies do navegador ou contate o suporte.",
          );
          setIsLoading(false);
          return;
        }

        // Se houver um token na resposta, salva no localStorage para contornar problemas de cookies
        const token =
          result.token ||
          result.data?.token ||
          result.session?.id ||
          result.session?.sessionToken ||
          result.data?.session?.id;

        if (token && typeof token === "string") {
          localStorage.setItem("auth_token", token);
        }

        console.log(
          `>>> [LOGIN_FLOW] Slug encontrado: ${businessSlug}. Redirecionando...`,
        );

        // Implementa o fluxo de navegação dinâmica
        router.push(`/admin/${businessSlug}/dashboard/overview`);
        return;
      } else {
        console.warn(">>> [LOGIN_FLOW] Falha nas credenciais ou sessão nula");
        setError(
          "Não foi possível validar sua sessão. Por favor, verifique se os cookies estão habilitados no seu navegador.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      console.error(">>> [LOGIN_FLOW] Erro crítico no handleSubmit:", err);
      setError("Ocorreu um erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Lock className="w-6 h-6 text-primary" />
          Login Administrativo
        </CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push("/admin/register")}
              >
                Cadastre-se
              </Button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
