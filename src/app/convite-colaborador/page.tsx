"use client";

import { CheckCircle2, Loader2, MailWarning, ShieldAlert, UserCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE_URL, useSession } from "@/lib/auth-client";
import { customFetch } from "@/lib/api-client";

type InvitePreviewResponse = {
  success: boolean;
  company?: { id: string; name: string; slug?: string | null } | null;
  member?: {
    name: string;
    email: string;
    isAdmin?: boolean;
    isSecretary?: boolean;
    isProfessional?: boolean;
  } | null;
  expiresAt?: string;
  dashboardUrl?: string;
  error?: string;
};

type InviteAcceptResponse = {
  success: boolean;
  dashboardUrl?: string;
  message?: string;
  error?: string;
};

const STAFF_ENDPOINT = `${API_BASE_URL}/api/staff`;

function InviteCollaboratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const token = searchParams.get("token") || "";
  const companyId = searchParams.get("companyId") || "";
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  const invitePath = useMemo(() => {
    if (!token || !companyId || !email) return "/convite-colaborador";
    return `/convite-colaborador?token=${encodeURIComponent(token)}&companyId=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`;
  }, [token, companyId, email]);

  const [preview, setPreview] = useState<InvitePreviewResponse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!token || !companyId || !email) {
        setPreviewError("Link inválido. Solicite um novo convite ao administrador.");
        setIsLoadingPreview(false);
        return;
      }

      setIsLoadingPreview(true);
      setPreviewError(null);

      try {
        const response = await customFetch(
          `${STAFF_ENDPOINT}/invite/preview?token=${encodeURIComponent(token)}&companyId=${encodeURIComponent(companyId)}&email=${encodeURIComponent(email)}`,
        );
        const payload = (await response.json().catch(() => ({}))) as InvitePreviewResponse;

        if (!response.ok || !payload?.success) {
          setPreviewError(payload.error || "Não foi possível validar este convite.");
          return;
        }

        setPreview(payload);
      } catch {
        setPreviewError("Falha ao validar convite. Tente novamente em instantes.");
      } finally {
        setIsLoadingPreview(false);
      }
    };

    loadPreview();
  }, [token, companyId, email]);

  const handleLoginAndReturn = () => {
    router.push(`/admin?redirect=${encodeURIComponent(invitePath)}`);
  };

  const handleAccept = async () => {
    if (!session?.user) {
      handleLoginAndReturn();
      return;
    }

    setIsAccepting(true);
    setAcceptMessage(null);

    try {
      const response = await customFetch(`${STAFF_ENDPOINT}/invite/accept`, {
        method: "POST",
        body: JSON.stringify({ token, companyId, email }),
      });
      const payload = (await response.json().catch(() => ({}))) as InviteAcceptResponse;

      if (!response.ok || !payload?.success) {
        setAcceptMessage(payload.error || "Não foi possível aceitar o convite.");
        return;
      }

      const dashboardUrl = payload.dashboardUrl || preview?.dashboardUrl || "/admin";
      setAcceptMessage("Convite aceito com sucesso. Redirecionando...");
      setTimeout(() => {
        window.location.assign(dashboardUrl);
      }, 900);
    } catch {
      setAcceptMessage("Falha ao aceitar convite. Tente novamente.");
    } finally {
      setIsAccepting(false);
    }
  };

  const sessionEmail = (session?.user?.email || "").trim().toLowerCase();
  const isSessionEmailDifferent =
    Boolean(sessionEmail) && Boolean(email) && sessionEmail !== email;

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Aceitar Convite de Colaborador
            </CardTitle>
            <CardDescription>
              Valide os dados do convite e conclua seu acesso ao painel.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoadingPreview && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando convite...
              </div>
            )}

            {!isLoadingPreview && previewError && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                <p className="flex items-center gap-2 font-medium">
                  <ShieldAlert className="h-4 w-4" />
                  Convite inválido
                </p>
                <p className="mt-1">{previewError}</p>
                <Button className="mt-3" variant="outline" onClick={() => router.push("/admin")}>
                  Ir para login
                </Button>
              </div>
            )}

            {!isLoadingPreview && !previewError && preview && (
              <>
                <div className="rounded-lg border p-4 text-sm">
                  <p>
                    <strong>Empresa:</strong> {preview.company?.name || "Não informada"}
                  </p>
                  <p>
                    <strong>Colaborador:</strong> {preview.member?.name || "Não informado"}
                  </p>
                  <p>
                    <strong>E-mail do convite:</strong> {email}
                  </p>
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando sessão...
                  </div>
                )}

                {!isPending && !session?.user && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    <p className="flex items-center gap-2 font-medium">
                      <MailWarning className="h-4 w-4" />
                      Faça login para aceitar o convite
                    </p>
                    <p className="mt-1">
                      Entre com o e-mail <strong>{email}</strong> para concluir a vinculação.
                    </p>
                    <Button className="mt-3" onClick={handleLoginAndReturn}>
                      Entrar e voltar para o convite
                    </Button>
                  </div>
                )}

                {!isPending && session?.user && (
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3 text-sm">
                      <p>
                        Logado como: <strong>{session.user.email}</strong>
                      </p>
                      {isSessionEmailDifferent && (
                        <p className="mt-1 text-amber-700">
                          Este convite foi enviado para <strong>{email}</strong>. Faça login com esse
                          e-mail para aceitar.
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleAccept}
                      disabled={isAccepting || isSessionEmailDifferent}
                      className="gap-2"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Aceitando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Aceitar convite
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {acceptMessage && (
                  <p className="text-sm text-muted-foreground">{acceptMessage}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/20 p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <InviteCollaboratorPage />
    </Suspense>
  );
}
