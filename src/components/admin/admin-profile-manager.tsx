"use client";

import {
  AlertTriangle,
  Calendar,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useStudio } from "@/context/studio-context";
import { useToast } from "@/hooks/use-toast";
import { signOut, updateUser, useSession } from "@/lib/auth-client";
import { SubscriptionCancellationModal } from "./subscription-cancellation-modal";

interface UserWithBusiness {
  business?: {
    subscriptionId?: string;
  };
}

export function AdminProfileManager() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { studio } = useStudio();
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    // phone: "", // Better-auth user object doesn't have phone by default unless customized
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateUser({
        name: profile.name,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado com sucesso.",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Substituindo changePassword do Better Auth por fetch manual para garantir o envio correto do body
      // TESTE: Bypass de proxy recomendado pelo Backend Dev
      // Usando variável de ambiente pública para apontar para o backend correto (local ou prod)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const targetUrl = `${baseUrl}/api/auth/change-password`;
      
      console.log(">>> [CHANGE_PASSWORD] Iniciando troca de senha via FETCH MANUAL (BYPASS PROXY)");
      console.log(">>> [CHANGE_PASSWORD] Target URL:", targetUrl);
      console.log(">>> [CHANGE_PASSWORD] Payload:", {
        newPassword: passwords.new,
        currentPassword: passwords.current,
        revokeOtherSessions: true,
      });

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Enviar cookies de sessão mesmo em requisições cross-origin (bypass proxy)
        body: JSON.stringify({
          newPassword: passwords.new,
          currentPassword: passwords.current,
          revokeOtherSessions: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      // Se deu tudo certo
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso. Redirecionando para login...",
      });

      // Invalidar sessão e redirecionar para login
      console.log(">>> [CHANGE_PASSWORD] Sucesso. Iniciando logout e redirect...");
      await signOut();
      localStorage.clear();
      router.push("/admin");

    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      
      // Tratamento de erro amigável conforme solicitado
      if (
        error.code === "INVALID_PASSWORD" ||
        error.message?.includes("incorrect") ||
        error.message?.includes("Senha atual e nova senha são obrigatórias")
      ) {
         toast({
          title: "Erro",
          description: error.message || "A senha atual informada está incorreta.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNextInvoiceDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    // Cria data para este mês com o mesmo dia
    const nextInvoice = new Date(
      today.getFullYear(),
      today.getMonth(),
      date.getDate(),
    );

    // Se a data deste mês já passou, avança para o próximo mês
    if (nextInvoice < today) {
      nextInvoice.setMonth(nextInvoice.getMonth() + 1);
    }
    return nextInvoice;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail de Login</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-10 bg-muted"
                  value={profile.email}
                  disabled
                  placeholder="seu@email.com"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                O e-mail de login não pode ser alterado diretamente aqui.
              </p>
            </div>

            {studio?.createdAt && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-date">
                    Data de Pagamento da Plataforma
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="payment-date"
                      className="pl-10 bg-muted"
                      value={new Date(studio.createdAt).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                      disabled
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Data de início da sua assinatura.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next-invoice">Data da Próxima Fatura</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="next-invoice"
                      className="pl-10 bg-muted"
                      value={getNextInvoiceDate(
                        studio.createdAt,
                      ).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      disabled
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Previsão da sua próxima cobrança.
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura alterando a senha regularmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Atualizar Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Seção de Cancelamento de Assinatura */}
      <Card className="md:col-span-2 border-red-200 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription className="text-red-600/80">
            Ações sensíveis relacionadas à sua conta e assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-red-200 rounded-lg bg-white">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-red-900">
                Cancelar Assinatura
              </h4>
              <p className="text-xs text-red-700/80 max-w-md">
                Ao cancelar, você perderá acesso aos recursos premium ao final
                do ciclo de cobrança atual. Essa ação não pode ser desfeita.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsCancellationModalOpen(true)}
            >
              Cancelar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionCancellationModal
        isOpen={isCancellationModalOpen}
        onClose={() => setIsCancellationModalOpen(false)}
        subscriptionId={
          (session?.user as unknown as UserWithBusiness)?.business
            ?.subscriptionId
        }
      />
    </div>
  );
}
