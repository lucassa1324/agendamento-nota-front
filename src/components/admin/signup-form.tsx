"use client";

import { Lock, Mail, User } from "lucide-react";
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
import { signUp } from "@/lib/auth-client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studioName, setStudioName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log(">>> [SIGNUP] Iniciando cadastro para:", email);

      const { data, error: authError } = await signUp.email({
        email,
        password,
        name,
        // @ts-expect-error - studioName é um campo customizado suportado pelo nosso backend
        studioName,
        callbackURL: "/admin",
      });

      if (authError) {
        console.error(">>> [SIGNUP] Erro no cadastro:", authError);
        setError(authError.message || "Erro ao criar conta.");
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log(
          ">>> [SIGNUP] Cadastro bem-sucedido, redirecionando para login...",
        );
        // Redireciona para a tela de login administrativa usando a URL absoluta do ambiente conforme solicitado
        const adminLoginUrl = `${process.env.NEXT_PUBLIC_ADMIN_URL}/admin`;
        window.location.href = adminLoginUrl;
      }
    } catch (err) {
      console.error(">>> [SIGNUP] Erro inesperado durante o cadastro:", err);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <User className="w-6 h-6 text-primary" />
          Criar Conta
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para se cadastrar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studioName">Nome do Estabelecimento</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="studioName"
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="Ex: Studio da Ana"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
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
                placeholder="Crie uma senha forte"
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

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push("/admin")}
              >
                Fazer login
              </Button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
