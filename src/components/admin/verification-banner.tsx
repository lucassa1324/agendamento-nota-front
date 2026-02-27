"use client";

import { AlertTriangle, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendVerificationEmail, useSession } from "@/lib/auth-client";

export function VerificationBanner() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Se a sessão estiver carregando ou o usuário já estiver verificado, não mostra nada
  if (!session?.user || session.user.emailVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      await sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/email-verified", // Página de sucesso após verificação (pode ser customizada)
      });

      toast({
        title: "E-mail enviado!",
        description:
          "Verifique sua caixa de entrada (e spam) para validar sua conta.",
      });
    } catch (error) {
      console.error("Erro ao enviar e-mail de verificação:", error);
      toast({
        title: "Erro ao enviar",
        description:
          "Não foi possível enviar o e-mail. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              A tua conta ainda não está verificada
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300/80">
              Verifica o teu e-mail para garantir a segurança dos teus dados.
            </p>
          </div>
        </div>
        <Button
          onClick={handleResendEmail}
          disabled={loading}
          variant="outline"
          size="sm"
          className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-500/50 dark:text-yellow-400 dark:hover:bg-yellow-900/40 w-full sm:w-auto shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Reenviar e-mail
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
