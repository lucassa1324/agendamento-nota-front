"use client";

import {
  CheckCircle2,
  KeyRound,
  MailPlus,
  Save,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useStudio } from "@/context/studio-context";
import { customFetch } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  isSecretary: boolean;
  isProfessional: boolean;
  commissionRate: number;
  serviceIds: string[];
};

type ServiceItem = {
  id: string;
  name: string;
};

type CompanySecurityState = {
  hasFinancialPassword: boolean;
};

const STAFF_ENDPOINT = `${API_BASE_URL}/api/staff`;
const SERVICES_ENDPOINT = `${API_BASE_URL}/api/services`;
const BUSINESS_ENDPOINT = `${API_BASE_URL}/api/business`;

export function TeamRbacManager() {
  const { studio } = useStudio();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [securityState, setSecurityState] = useState<CompanySecurityState>({
    hasFinancialPassword: false,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isStaffEndpointAvailable, setIsStaffEndpointAvailable] = useState(true);
  const [financialPassword, setFinancialPassword] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [isProcessingSecurity, setIsProcessingSecurity] = useState(false);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedId) ?? null,
    [members, selectedId],
  );

  useEffect(() => {
    const load = async () => {
      if (!studio?.id) return;
      setIsLoading(true);

      try {
        const [staffResult, servicesResult, companyResult] = await Promise.allSettled([
          customFetch(`${STAFF_ENDPOINT}/company/${studio.id}`),
          customFetch(`${SERVICES_ENDPOINT}/company/${studio.id}`),
          customFetch(`${BUSINESS_ENDPOINT}/${studio.id}`),
        ]);

        if (staffResult.status === "fulfilled" && staffResult.value.ok) {
          const data = (await staffResult.value.json()) as Array<Partial<StaffMember>>;
          const normalized = data.map((item) => ({
            id: item.id || crypto.randomUUID(),
            name: item.name || "Colaborador",
            email: item.email || "",
            isActive: item.isActive ?? true,
            isAdmin: item.isAdmin ?? false,
            isSecretary: item.isSecretary ?? false,
            isProfessional: item.isProfessional ?? false,
            commissionRate: Number(item.commissionRate ?? 0),
            serviceIds: Array.isArray(item.serviceIds) ? item.serviceIds : [],
          }));
          setMembers(normalized);
          setSelectedId(normalized[0]?.id ?? null);
          setIsStaffEndpointAvailable(true);
        } else {
          setMembers([]);
          setSelectedId(null);
          setIsStaffEndpointAvailable(false);
        }

        if (servicesResult.status === "fulfilled" && servicesResult.value.ok) {
          const serviceData = (await servicesResult.value.json()) as Array<{
            id: string;
            name: string;
          }>;
          setServices(serviceData.map((item) => ({ id: item.id, name: item.name })));
        } else {
          setServices([]);
        }

        if (companyResult.status === "fulfilled" && companyResult.value.ok) {
          const business = (await companyResult.value.json()) as {
            financialPassword?: string | null;
          };
          setSecurityState({
            hasFinancialPassword: Boolean(business.financialPassword),
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados de times:", error);
        toast.error("Não foi possível carregar os dados de times.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [studio?.id]);

  const updateSelectedMember = (patch: Partial<StaffMember>) => {
    if (!selectedMember) return;
    setMembers((current) =>
      current.map((member) =>
        member.id === selectedMember.id ? { ...member, ...patch } : member,
      ),
    );
  };

  const toggleService = (serviceId: string) => {
    if (!selectedMember) return;
    const exists = selectedMember.serviceIds.includes(serviceId);
    updateSelectedMember({
      serviceIds: exists
        ? selectedMember.serviceIds.filter((id) => id !== serviceId)
        : [...selectedMember.serviceIds, serviceId],
    });
  };

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Preencha nome e e-mail do colaborador.");
      return;
    }

    const optimisticMember: StaffMember = {
      id: `temp-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      isActive: true,
      isAdmin: false,
      isSecretary: false,
      isProfessional: true,
      commissionRate: 0,
      serviceIds: [],
    };

    setMembers((current) => [optimisticMember, ...current]);
    setSelectedId(optimisticMember.id);
    setInviteName("");
    setInviteEmail("");

    if (!studio?.id) return;

    try {
      const response = await customFetch(`${STAFF_ENDPOINT}/invite`, {
        method: "POST",
        body: JSON.stringify({
          companyId: studio.id,
          name: optimisticMember.name,
          email: optimisticMember.email,
        }),
      });

      if (!response.ok) {
        toast.warning(
          "Convite adicionado localmente. Endpoint de convite ainda não respondeu com sucesso.",
        );
        return;
      }

      toast.success("Convite enviado com sucesso.");
    } catch {
      toast.warning(
        "Convite adicionado localmente. Endpoint de convite ainda não está disponível.",
      );
    }
  };

  const handleSaveMember = async () => {
    if (!selectedMember || !studio?.id) return;
    setIsSaving(true);

    try {
      const response = await customFetch(`${STAFF_ENDPOINT}/${selectedMember.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          companyId: studio.id,
          name: selectedMember.name,
          email: selectedMember.email,
          isActive: selectedMember.isActive,
          isAdmin: selectedMember.isAdmin,
          isSecretary: selectedMember.isSecretary,
          isProfessional: selectedMember.isProfessional,
          commissionRate: selectedMember.commissionRate,
          serviceIds: selectedMember.serviceIds,
        }),
      });

      if (!response.ok) {
        toast.warning(
          "Alterações mantidas na interface, mas o endpoint de times ainda não confirmou o salvamento.",
        );
        return;
      }

      toast.success("Permissões do colaborador salvas com sucesso.");
    } catch {
      toast.warning(
        "Alterações mantidas na interface. Endpoint de times ainda não está disponível.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigureFinancialPassword = async () => {
    if (!studio?.id) return;
    if (financialPassword.trim().length < 4) {
      toast.error("A senha financeira deve ter ao menos 4 caracteres.");
      return;
    }

    setIsProcessingSecurity(true);
    try {
      const response = await customFetch(
        `${STAFF_ENDPOINT}/company/${studio.id}/financial-password`,
        {
          method: "PATCH",
          body: JSON.stringify({
            password: financialPassword.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          (errorData as { error?: string })?.error ||
            "Não foi possível configurar a senha financeira.",
        );
        return;
      }

      setSecurityState({ hasFinancialPassword: true });
      setFinancialPassword("");
      toast.success("Senha financeira configurada com sucesso.");
    } catch {
      toast.error("Falha ao configurar a senha financeira.");
    } finally {
      setIsProcessingSecurity(false);
    }
  };

  const handleResetMemberPassword = async () => {
    if (!selectedMember || !studio?.id) return;
    if (selectedMember.id.startsWith("temp-")) {
      toast.error("Salve o colaborador antes de redefinir a senha.");
      return;
    }
    if (memberPassword.trim().length < 6) {
      toast.error("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }

    setIsProcessingSecurity(true);
    try {
      const response = await customFetch(
        `${STAFF_ENDPOINT}/${selectedMember.id}/reset-password`,
        {
          method: "PATCH",
          body: JSON.stringify({
            companyId: studio.id,
            password: memberPassword.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          (errorData as { error?: string })?.error ||
            "Não foi possível redefinir a senha do colaborador.",
        );
        return;
      }

      setMemberPassword("");
      toast.success("Senha de acesso do colaborador redefinida com sucesso.");
    } catch {
      toast.error("Falha ao redefinir a senha do colaborador.");
    } finally {
      setIsProcessingSecurity(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember || !studio?.id) return;
    if (!confirm(`Deseja excluir o colaborador ${selectedMember.name}?`)) return;

    if (selectedMember.id.startsWith("temp-")) {
      setMembers((current) => current.filter((member) => member.id !== selectedMember.id));
      setSelectedId((current) => (current === selectedMember.id ? null : current));
      toast.success("Colaborador removido da lista local.");
      return;
    }

    setIsProcessingSecurity(true);
    try {
      const response = await customFetch(
        `${STAFF_ENDPOINT}/${selectedMember.id}?companyId=${encodeURIComponent(studio.id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          (errorData as { error?: string })?.error ||
            "Não foi possível excluir o colaborador.",
        );
        return;
      }

      const deletedId = selectedMember.id;
      setMembers((current) => {
        const remaining = current.filter((member) => member.id !== deletedId);
        setSelectedId((currentSelected) =>
          currentSelected === deletedId ? (remaining[0]?.id ?? null) : currentSelected,
        );
        return remaining;
      });
      toast.success("Colaborador excluído com sucesso.");
    } catch {
      toast.error("Falha ao excluir colaborador.");
    } finally {
      setIsProcessingSecurity(false);
    }
  };

  const effectivePermissions = useMemo(() => {
    if (!selectedMember) return [];

    const permissions: string[] = [];
    if (selectedMember.isAdmin) permissions.push("Acesso total ao painel");
    if (selectedMember.isSecretary) permissions.push("Gestão operacional de agendas");
    if (selectedMember.isProfessional) permissions.push("Execução de serviços e agenda própria");
    if (!selectedMember.isAdmin && !selectedMember.isSecretary) {
      permissions.push("Sem acesso a relatórios e configurações globais");
    }
    return permissions;
  }, [selectedMember]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando times e permissões...</p>;
  }

  return (
    <div className="space-y-6">
      {!isStaffEndpointAvailable && (
        <Card className="border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              O endpoint de times ainda não está ativo no backend. A tela já está pronta e operando
              em modo local para acelerar a integração.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-primary" />
                Gestão de Time e Permissões
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Convide colaboradores e configure perfis híbridos com regras de RBAC.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={inviteName}
                onChange={(event) => setInviteName(event.target.value)}
                placeholder="Nome"
                className="w-40"
              />
              <Input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="email@dominio.com"
                className="w-52"
              />
              <Button onClick={handleInvite} className="gap-2">
                <MailPlus className="h-4 w-4" />
                Convidar Colaborador
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 pr-2">
              <div className="space-y-2">
                {members.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum membro encontrado. Use o convite para iniciar seu time.
                  </p>
                )}
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedId(member.id)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-colors",
                      selectedId === member.id
                        ? "border-primary/40 bg-primary/5"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{member.name}</p>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{member.email}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="h-4 w-4" />
              {selectedMember ? `Permissões de ${selectedMember.name}` : "Selecione um membro"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!selectedMember && (
              <p className="text-sm text-muted-foreground">
                Escolha um membro na lista para editar papéis, comissão e serviços vinculados.
              </p>
            )}

            {selectedMember && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={selectedMember.name}
                      onChange={(event) => updateSelectedMember({ name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={selectedMember.email}
                      onChange={(event) => updateSelectedMember({ email: event.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border p-4">
                  <p className="text-sm font-semibold">Perfis Híbridos</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Label className="flex items-center justify-between rounded-lg border px-3 py-2">
                      Administrador
                      <Switch
                        checked={selectedMember.isAdmin}
                        onCheckedChange={(value) => updateSelectedMember({ isAdmin: value })}
                      />
                    </Label>
                    <Label className="flex items-center justify-between rounded-lg border px-3 py-2">
                      Secretária
                      <Switch
                        checked={selectedMember.isSecretary}
                        onCheckedChange={(value) => updateSelectedMember({ isSecretary: value })}
                      />
                    </Label>
                    <Label className="flex items-center justify-between rounded-lg border px-3 py-2">
                      Profissional
                      <Switch
                        checked={selectedMember.isProfessional}
                        onCheckedChange={(value) => updateSelectedMember({ isProfessional: value })}
                      />
                    </Label>
                    <Label className="flex items-center justify-between rounded-lg border px-3 py-2">
                      Membro ativo
                      <Switch
                        checked={selectedMember.isActive}
                        onCheckedChange={(value) => updateSelectedMember({ isActive: value })}
                      />
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comissão (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={selectedMember.commissionRate}
                    onChange={(event) =>
                      updateSelectedMember({
                        commissionRate: Number(event.target.value || 0),
                      })
                    }
                  />
                </div>

                <div className="space-y-3 rounded-xl border p-4">
                  <p className="text-sm font-semibold">Serviços vinculados</p>
                  {services.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Nenhum serviço carregado. Cadastre serviços para vincular especialidades.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => {
                      const checked = selectedMember.serviceIds.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs transition-colors",
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:bg-muted",
                          )}
                          onClick={() => toggleService(service.id)}
                        >
                          {service.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Card className="border-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Segurança Financeira
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        {securityState.hasFinancialPassword ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Senha financeira configurada
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-amber-500" />
                            Senha financeira não configurada
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        type="password"
                        placeholder="Nova senha financeira"
                        value={financialPassword}
                        onChange={(event) => setFinancialPassword(event.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConfigureFinancialPassword}
                        disabled={isProcessingSecurity}
                      >
                        Configurar senha
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Senha de Acesso do Colaborador
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        type="password"
                        placeholder="Nova senha de login"
                        value={memberPassword}
                        onChange={(event) => setMemberPassword(event.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetMemberPassword}
                        disabled={isProcessingSecurity || !selectedMember}
                      >
                        Redefinir senha
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use ao menos 6 caracteres. Esta ação atualiza o acesso do colaborador imediatamente.
                    </p>
                  </CardContent>
                </Card>

                <div className="rounded-xl border p-4">
                  <p className="mb-2 text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Permissões efetivas
                  </p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {effectivePermissions.map((permission) => (
                      <li key={permission}>- {permission}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteMember}
                    disabled={isSaving || isProcessingSecurity}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir colaborador
                  </Button>
                  <Button onClick={handleSaveMember} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? "Salvando..." : "Salvar permissões"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
