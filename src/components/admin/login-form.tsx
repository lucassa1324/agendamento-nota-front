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
import { signIn } from "@/lib/auth-client";

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

      const { data, error: authError } = await signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (authError) {
        console.error(">>> [LOGIN_FLOW] Erro no signIn:", authError);
        if (authError.status === 401) {
          setError("Email ou senha incorretos.");
        } else {
          setError(authError.message || "Erro ao realizar login.");
        }
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log(">>> [LOGIN_FLOW] Login bem-sucedido. Dados:", data);

        // No better-auth, o slug costuma vir nos metadados do usuário ou em uma tabela vinculada
        // biome-ignore lint/suspicious/noExplicitAny: Acesso dinâmico a propriedades do better-auth
        const user = data.user as any;
        const businessSlug = user?.business?.slug || user?.slug;

        if (!businessSlug) {
          console.warn(">>> [LOGIN_FLOW] Login 200, mas sem slug.");
          setError(
            "Sua conta foi autenticada, mas não encontramos um estúdio vinculado.",
          );
          setIsLoading(false);
          return;
        }

        console.log(
          `>>> [LOGIN_FLOW] Sucesso! Redirecionando para: ${businessSlug}`,
        );

        // Delay de estabilização para garantir que o navegador processe o Set-Cookie
        setTimeout(() => {
          router.push(`/admin/${businessSlug}/dashboard/overview`);
        }, 500);
      }
    } catch (err: unknown) {
      console.error(">>> [LOGIN_FLOW] Erro crítico:", err);
      setError("Não foi possível conectar ao servidor. Verifique sua conexão.");
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
