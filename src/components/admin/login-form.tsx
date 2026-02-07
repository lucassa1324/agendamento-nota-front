"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
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
import { getSession, signIn } from "@/lib/auth-client";

interface AuthUser {
  slug?: string;
  business?: {
    slug?: string;
  };
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Verifica se já existe sessão ao carregar a página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await getSession();
        if (data?.session) {
          console.log(
            ">>> [LOGIN_FORM] Sessão ativa encontrada. Redirecionando...",
          );
          const user = data.user as AuthUser;
          const businessSlug = user?.business?.slug || user?.slug;

          if (businessSlug) {
            router.push(`/admin/${businessSlug}/dashboard/overview`);
          } else {
            console.warn(
              ">>> [LOGIN_FORM] Sessão encontrada mas sem slug vinculado.",
            );
          }
        }
      } catch (err) {
        console.warn(">>> [ADMIN_WARN] Erro ao verificar sessão:", err);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log(">>> [LOGIN_FLOW] Iniciando login nativo com better-auth:", {
        email,
      });

      const result = await signIn.email({
        email,
        password,
      });

      console.log(">>> [LOGIN_FLOW] Resposta do signIn recebida:", result);

      const { data, error: authError } = result;

      if (authError) {
        console.warn(">>> [ADMIN_WARN] Erro no signIn:", authError);
        setError(authError.message || "Email ou senha incorretos.");
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log(">>> [LOGIN_FLOW] Login bem-sucedido via Better-Auth.");

        const user = data.user as AuthUser;
        const businessSlug = user?.business?.slug || user?.slug;

        if (!businessSlug) {
          console.warn(">>> [LOGIN_FLOW] Sem slug vinculado.");
          setError("Sua conta não possui um estúdio vinculado.");
          setIsLoading(false);
          return;
        }

        console.log(
          `>>> [LOGIN_FLOW] Redirecionando para /admin/${businessSlug}/dashboard/overview`,
        );
        router.push(`/admin/${businessSlug}/dashboard/overview`);
      } else {
        console.warn(">>> [LOGIN_FLOW] Login retornou sem dados e sem erro.");
        setError("Erro inesperado no login.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.warn(">>> [ADMIN_WARN] Erro crítico (catch):", err);
      setError("Não foi possível conectar ao servidor.");
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
