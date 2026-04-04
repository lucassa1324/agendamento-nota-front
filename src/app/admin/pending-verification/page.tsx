"use client";

import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sendVerificationEmail, useSession, getSession } from "@/lib/auth-client";

export default function PendingVerificationPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Verifica se o usuário já está verificado e redireciona para o login se estiver
  useEffect(() => {
    if (session?.user?.emailVerified) {
      console.log(">>> [PENDING_VERIFICATION] Usuário já verificado! Redirecionando para /admin");
      router.replace("/admin?verified=true");
    }
  }, [session, router]);

  useEffect(() => {
    // Tenta pegar o e-mail da sessão ou do localStorage (caso o signUp tenha acabado de acontecer)
    if (session?.user?.email) {
      setEmail(session.user.email);
    } else {
      const pendingEmail = localStorage.getItem("pending_verification_email");
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }
  }, [session]);

  // Forçar uma verificação manual da sessão quando a página carrega
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { data } = await getSession();
        if (data?.user?.emailVerified) {
          router.replace("/admin?verified=true");
        }
      } catch (e) {
        console.warn("Erro ao atualizar sessão:", e);
      }
    };
    refreshSession();
  }, [router]);

  const handleResendEmail = async () => {
    const targetEmail = email || session?.user?.email;
    if (!targetEmail) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar seu endereço de e-mail.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(">>> [PENDING_VERIFICATION] Solicitando reenvio de e-mail para:", targetEmail);
      await sendVerificationEmail({
        email: targetEmail,
        callbackURL: "/email-verified",
      });

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    } catch (error: any) {
      console.error("Erro ao reenviar e-mail:", error);
      
      // Se o erro for 400, provavelmente o usuário já está verificado ou atingiu limite
      if (error?.status === 400 || error?.status === 403) {
        // Tenta atualizar a sessão para ver se o status mudou
        const { data } = await getSession();
        if (data?.user?.emailVerified) {
          toast({
            title: "Você já está verificado!",
            description: "Redirecionando para o sistema...",
          });
          router.replace("/admin?verified=true");
          return;
        }

        toast({
          title: "Aguarde um momento",
          description: "Você já deve ter recebido um e-mail ou sua conta já foi verificada. Tente fazer login ou aguarde alguns minutos para tentar novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(true);
      // Simula um delay para evitar spam de cliques
      setTimeout(() => setIsLoading(false), 5000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-8 h-8 text-primary animate-bounce" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu e-mail</CardTitle>
          <CardDescription className="text-base">
            Enviamos um link de confirmação para:
            <br />
            <span className="font-semibold text-foreground">{email || "seu e-mail"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Clique no link enviado para ativar sua conta.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Após verificar, você poderá acessar seu dashboard.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde para reenviar...
                </>
              ) : (
                "Não recebeu o e-mail? Reenviar"
              )}
            </Button>

            <Button asChild variant="ghost" className="w-full text-muted-foreground">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
