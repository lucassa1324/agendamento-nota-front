"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getSession, signIn, LANDING_PAGE_URL } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  id?: string;
  email?: string;
  slug?: string;
  role?: string;
  businessId?: string;
  emailVerified?: boolean;
  business?: {
    slug?: string;
  };
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const hasCheckedSession = useRef(false);

  const isVerified = searchParams.get("verified") === "true";

  const getSessionWithTimeout = useCallback(async () => {
    return await Promise.race([
      getSession(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("SESSION_TIMEOUT")), 6000);
      }),
    ]);
  }, []);

  // Função auxiliar para redirecionar baseada na role (Regra de Ouro)
  const handleRoleRedirection = useCallback(
    (user: AuthUser & { email?: string }) => {
      console.log(
        ">>> [DEBUG_ROLES] Analisando usuário para redirecionamento:",
        {
          email: user.email,
          role: user.role,
          slug: user.slug,
          emailVerified: user.emailVerified,
          businessSlug: user?.business?.slug,
        },
      );

      // 1º Lugar: Verificação de E-mail (exceto se for Super Admin logado manualmente)
      if (
        user.emailVerified === false &&
        user.role !== "SUPER_ADMIN" &&
        user.email !== "lucassa1324@gmail.com"
      ) {
        console.log(">>> [LOGIN_FLOW] E-mail consta como não verificado. Fazendo check final antes de redirecionar...");
        
        // Check final para evitar loops se a sessão estiver levemente desatualizada
        getSession().then(({ data }) => {
          if (data?.user?.emailVerified) {
             console.log(">>> [LOGIN_FLOW] Check final revelou e-mail JÁ VERIFICADO. Prosseguindo...");
             handleRoleRedirection(data.user as AuthUser);
          } else {
             console.log(">>> [LOGIN_FLOW] E-mail realmente não verificado. Redirecionando para pendência.");
             localStorage.setItem("pending_verification_email", user.email || "");
             router.push("/admin/pending-verification");
          }
        });
        return true;
      }

      // Se verificou agora, limpa o localStorage
      if (user.emailVerified) {
        localStorage.removeItem("pending_verification_email");
      }

      // PRIORIDADE MÁXIMA: SUPER_ADMIN ou Email do Proprietário (Lucas)
      // Usamos um "Hard Redirect" para limpar contextos de negócio/tenant
      if (
        user.role === "SUPER_ADMIN" ||
        user.email === "lucassa1324@gmail.com"
      ) {
        console.log(
          ">>> [LOGIN_FLOW] SUPER_ADMIN detectado. Forçando HARD REDIRECT para /admin/master",
        );
        window.location.href = "/admin/master";
        return true;
      }

      // 2º Lugar: Verificação de Administrador de Negócio (Multi-tenant)
      const businessSlug = user?.slug || user?.business?.slug;
      if (user.role?.toLowerCase() === "admin" && businessSlug) {
        console.log(
          `>>> [LOGIN_FLOW] ADMIN detectado. Redirecionando para /admin/${businessSlug}/dashboard/overview`,
        );
        router.push(`/admin/${businessSlug}/dashboard/overview`);
        return true;
      }

      // 3º Lugar: Usuário sem negócio ou sem role definida (Fallback)
      console.warn(
        ">>> [LOGIN_FLOW] Usuário sem role ADMIN/SUPER_ADMIN ou sem slug.",
      );
      return false;
    },
    [router],
  );

  // Verifica se já existe sessão ao carregar a página
  useEffect(() => {
    if (hasCheckedSession.current) {
      return;
    }
    hasCheckedSession.current = true;

    const checkSession = async () => {
      if (isVerified) {
        toast({
          title: "E-mail confirmado!",
          description: "Sua conta foi verificada com sucesso.",
        });
      }

      try {
        const { data } = await getSessionWithTimeout();
        if (data?.session) {
          console.log(
            ">>> [LOGIN_FORM] Sessão ativa encontrada. Redirecionando...",
          );
          const user = data.user as AuthUser;
          if (!handleRoleRedirection(user)) {
            console.warn(
              ">>> [LOGIN_FORM] Sessão encontrada mas sem slug ou role vinculados.",
            );
          }
        }
      } catch (err) {
        if (err instanceof Error && err.message === "SESSION_TIMEOUT") {
          console.warn(">>> [ADMIN_WARN] Timeout ao verificar sessão.");
          return;
        }
        console.warn(">>> [ADMIN_WARN] Erro ao verificar sessão:", err);
      }
    };
    checkSession();
  }, [getSessionWithTimeout, handleRoleRedirection, isVerified, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();

      if (!normalizedEmail || !normalizedPassword) {
        setError("Email e senha são obrigatórios.");
        setIsLoading(false);
        return;
      }

      console.log(">>> [LOGIN_FLOW] Iniciando login nativo com better-auth:", {
        email: normalizedEmail,
      });

      const result = await signIn.email({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      const { data, error: authError } = result;

      if (authError) {
        setError(authError.message || "Email ou senha incorretos.");
        setIsLoading(false);
        return;
      }

      const userData = data?.user as AuthUser;

      if (userData?.id) {
        let resolvedUser = userData;
        if (typeof userData.emailVerified === "undefined") {
          try {
            const { data: sessionData } = await getSessionWithTimeout();
            if (sessionData?.user) {
              resolvedUser = sessionData.user as AuthUser;
            }
          } catch (sessionError) {
            console.warn(">>> [LOGIN_FLOW] Falha ao buscar sessão pós-login:", sessionError);
          }
        }

        console.log(
          ">>> [LOGIN_FLOW] Login bem-sucedido. Payload recebido:",
          resolvedUser,
        );

        if (!handleRoleRedirection(resolvedUser)) {
          console.warn(">>> [LOGIN_FLOW] Sem slug ou role vinculados.");
          setError(
            "Sua conta não possui as permissões necessárias ou um estúdio vinculado.",
          );
          setIsLoading(false);
          return;
        }
      } else {
        console.warn(
          ">>> [LOGIN_FLOW] Login retornou sem dados de usuário válidos.",
        );
        setError("Erro inesperado no login (Resposta do servidor incompleta).");
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
        <CardTitle className="text-2xl text-center">
          Login Administrativo
        </CardTitle>
        <CardDescription className="text-center">
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
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
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => {
                  const url = LANDING_PAGE_URL 
                    ? `${LANDING_PAGE_URL}/register`
                    : "/admin/register";
                  
                  if (url.startsWith("http")) {
                    window.location.href = url;
                  } else {
                    router.push(url);
                  }
                }}
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
