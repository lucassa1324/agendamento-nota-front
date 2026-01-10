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
import { API_BASE_URL, getSession, loginWithEmail } from "@/lib/auth-client";

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
      const result = await loginWithEmail(email, password);
      console.log(">>> [LOGIN_FLOW] Resultado do loginWithEmail:", JSON.stringify(result, null, 2));
      
      if (result) {
        // Se o resultado do login já trouxer o business (o back-end parece já retornar isso no AuthResponse)
        const businessSlug = result.business?.slug || result.slug;
        
        const fetchBusinessWithRetry = async (slugParam?: string, token?: string, retries = 5, delay = 1000, isFirstAttempt = true) => {
          console.log(`>>> [BUSINESS_FETCH] Tentativa ${6-retries}/5. Slug: ${slugParam}. Delay: ${isFirstAttempt ? 500 : delay}ms`);
          try {
            if (isFirstAttempt && !token) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };

            if (token) {
              console.log(">>> [BUSINESS_FETCH] Usando Token de Autorização para a busca.");
              headers.Authorization = `Bearer ${token}`;
            }

            // Se temos um slug, usamos o novo endpoint público/privado para validar/carregar dados
            const fetchUrl = slugParam 
              ? `${API_BASE_URL}/api/studios/slug/${slugParam}`
              : `${API_BASE_URL}/api/auth/business-info`;

            console.log(`>>> [BUSINESS_FETCH] Chamando ${fetchUrl}...`);
            const response = await fetch(fetchUrl, {
              headers,
              credentials: "include",
            });
            
            console.log(">>> [BUSINESS_FETCH] Resposta do back-end (status):", response.status);

            if (response.ok) {
              const data = await response.json();
              console.log(">>> [BUSINESS_FETCH] Dados encontrados:", JSON.stringify(data, null, 2));
              
              // O novo endpoint retorna o objeto do estúdio diretamente ou uma lista
              const businessData = Array.isArray(data) ? data[0] : data;
              const slug = businessData?.slug || slugParam;
              
              if (slug) {
                console.log(`>>> [BUSINESS_FETCH] Sucesso! Redirecionando para: ${slug}.localhost:3000/admin/dashboard`);
                
                // Verifica se estamos em localhost para decidir o formato do redirecionamento
                if (typeof window !== "undefined") {
                  const host = window.location.host;
                  if (host.includes("localhost")) {
                    // Redireciona para o subdomínio no localhost
                    window.location.href = `http://${slug}.localhost:3000/admin/dashboard`;
                  } else {
                    // Para produção ou outros ambientes, usa a rota dinâmica
                    router.push(`/${slug}/admin/dashboard`);
                    router.refresh();
                  }
                }
                return true;
              }
              console.error(">>> [BUSINESS_FETCH] Nenhum slug encontrado no objeto de negócio.");
              setError("Você ainda não possui um negócio cadastrado.");
              setIsLoading(false);
              return false;
            } 
            
            if (response.status === 401 && retries > 0) {
              console.log(`>>> [BUSINESS_FETCH] 401 detectado. Tentando "acordar" a sessão com getSession()...`);
              const sessionCheck = await getSession(token);
              console.log(">>> [BUSINESS_FETCH] Resultado do getSession extra:", sessionCheck ? "Sessão Ativa" : "Sessão INATIVA");
              
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchBusinessWithRetry(slugParam, token, retries - 1, delay * 1.5, false);
            }

            const errorText = await response.text();
            console.error(">>> [BUSINESS_FETCH] Erro definitivo:", response.status, errorText);
            
            if (response.status === 401) {
              setError("Sessão não reconhecida após várias tentativas. Tente recarregar a página.");
            } else if (response.status === 404) {
              setError("Negócio não encontrado. Verifique se o slug está correto.");
            } else {
              setError(`Erro ao carregar dados do negócio (${response.status}).`);
            }
            setIsLoading(false);
            return false;
          } catch (err) {
            console.error(">>> [BUSINESS_FETCH] Erro de rede:", err);
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchBusinessWithRetry(slugParam, token, retries - 1, delay * 1.5, false);
            }
            setError("Erro de conexão ao buscar seu negócio.");
            setIsLoading(false);
            return false;
          }
        };

        await fetchBusinessWithRetry(businessSlug, result.token);
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
