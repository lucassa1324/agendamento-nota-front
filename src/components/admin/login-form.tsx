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
import { loginWithEmail, logout } from "@/lib/auth-client";

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
      // Limpeza de Cache: Tenta deslogar para limpar cookies de sessões anteriores
      console.log(">>> [AUTH] Limpando sessões anteriores...");
      await logout().catch(() => {});

      // Logs de Depuração: Confirmar credenciais antes de enviar
      console.log("Enviando credenciais:", { email });

      const result = await loginWithEmail(email, password);
      console.log("Dados recebidos:", result);

      if (result) {
        // Se houver um token na resposta, salva no localStorage para contornar problemas de cookies em localhost
        const token =
          result.token ||
          result.data?.token ||
          result.session?.id ||
          result.session?.sessionToken || // Padrão better-auth
          result.data?.session?.id;

        if (token && typeof token === "string") {
          console.log(
            ">>> [LOGIN_FLOW] Token encontrado e salvo:",
            `${token.substring(0, 10)}...`,
          );
          localStorage.setItem("auth_token", token);
        } else {
          console.warn(
            ">>> [LOGIN_FLOW] Nenhum token encontrado no resultado do login:",
            result,
          );
        }
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
          console.log(
            ">>> [LOGIN_FLOW] Objeto completo para debug:",
            JSON.stringify(result, null, 2),
          );
          // Redirecionamento temporário para debug ou erro se o slug for nulo
          setError("Dados do estúdio não encontrados. Verifique o console.");
          setIsLoading(false);
          return;
        }

        console.log(
          `>>> [LOGIN_FLOW] Slug encontrado: ${businessSlug}. Redirecionando...`,
        );

        // Implementa o fluxo de navegação dinâmica conforme solicitado
        const slug = businessSlug;
        router.push(`/admin/${slug}/dashboard/overview`);

        // Timeout de segurança: se o router.push falhar em 3 segundos, tenta forçar via window.location
        setTimeout(() => {
          if (window.location.pathname === "/admin") {
            console.warn(
              ">>> [LOGIN_FLOW] Redirecionamento SPA parece ter falhado. Forçando recarregamento...",
            );
            window.location.href = `/admin/${slug}/dashboard/overview`;
          }
        }, 3000);

        return;
      } else {
        console.warn(">>> [LOGIN_FLOW] Falha nas credenciais (Email/Senha)");
        setError("Email ou senha incorretos");
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
