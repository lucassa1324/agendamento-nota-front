"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Globe,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Server,
  Link2,
  ArrowRight,
} from "lucide-react";
import { dnsService, CustomDomain } from "@/lib/dns-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function DNSPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [domainRecord, setDomainRecord] = useState<CustomDomain | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await dnsService.getDomain();

      setDomainRecord(res.domain);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados de domínio");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleAddDomain = async () => {
    if (!newDomain) return;

    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    if (!domainRegex.test(newDomain)) {
      toast.error(
        "Por favor, insira um domínio válido (ex: seudominio.com.br)",
      );
      return;
    }

    setIsActionLoading(true);

    try {
      await dnsService.addDomain(newDomain);
      toast.success("Domínio adicionado com sucesso!");
      setNewDomain("");
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar domínio");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!domainRecord) return;

    if (
      !confirm(
        `Tem certeza que deseja remover o domínio ${domainRecord.domain}?`,
      )
    )
      return;

    setIsActionLoading(true);

    try {
      await dnsService.removeDomain(domainRecord.domain);
      toast.success("Domínio removido com sucesso");
      fetchStatus();
    } catch (err) {
      toast.error("Erro ao remover domínio");
    } finally {
      setIsActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Ativo
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
            <Clock className="w-3 h-3 mr-1.5" /> Pendente
          </Badge>
        );
      case "ERROR":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1.5" /> Erro
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Card className="border-border/50">
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Domínio Customizado
              </h1>
            </div>
            <p className="text-muted-foreground text-sm pl-[52px]">
              Configure um domínio personalizado para o seu estúdio de
              agendamentos.
            </p>
          </div>

          {!domainRecord ? (
            /* Add New Domain Card */
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">
                  Adicionar Domínio
                </CardTitle>
                <CardDescription className="text-sm">
                  Insira o domínio que você deseja usar para seu estúdio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      placeholder="agendamento.meustudio.com.br"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      disabled={isActionLoading}
                      className="flex-1 h-10 bg-secondary/50 border-border/50 focus:border-primary/50"
                    />
                    <Button
                      onClick={handleAddDomain}
                      disabled={!newDomain || isActionLoading}
                      className="h-10 px-6"
                    >
                      {isActionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Adicionar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Você precisará configurar registros DNS no seu provedor após
                    adicionar o domínio.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Domain Status Card */}
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                        <Link2 className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {domainRecord.domain}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Configurado em{" "}
                          {new Date(domainRecord.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(domainRecord.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchStatus}
                        disabled={isActionLoading}
                        className="h-8 w-8"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${isActionLoading ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {domainRecord.status === "ACTIVE" ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <div>
                            <h3 className="font-medium text-foreground">
                              Domínio configurado com sucesso
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Seu domínio está apontando corretamente para
                              nossos servidores.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600"
                            asChild
                          >
                            <a
                              href={`https://${domainRecord.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Acessar Site
                              <ExternalLink className="ml-1.5 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Pending Alert */}
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                        <div className="flex gap-3">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Verificação Pendente
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Configure os registros abaixo no seu provedor de
                              DNS (GoDaddy, Cloudflare, Registro.br, etc).
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* DNS Records */}
                      {domainRecord.status === "PENDING" &&
                        domainRecord.verificationData && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Registros DNS
                              </span>
                            </div>

                            <div className="space-y-3">
                              {domainRecord.verificationData.map((v, i) => (
                                <div
                                  key={v.value}
                                  className="rounded-lg border border-border/50 bg-secondary/30 overflow-hidden"
                                >
                                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-secondary/50">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] font-mono px-1.5 py-0"
                                      >
                                        {v.type}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Registro
                                      </span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2 text-[10px]"
                                      onClick={() =>
                                        copyToClipboard(v.value, `val-${i}`)
                                      }
                                    >
                                      {copiedField === `val-${i}` ? (
                                        <>
                                          <Check className="w-3 h-3 mr-1 text-emerald-500" />
                                          <span className="text-emerald-500">
                                            Copiado
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 mr-1" />
                                          Copiar
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Nome / Host
                                      </p>
                                      <p className="font-mono text-xs bg-background/80 border border-border/50 px-2.5 py-1.5 rounded truncate">
                                        {v.domain}
                                      </p>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                        Valor / Destino
                                      </p>
                                      <p className="font-mono text-xs bg-background/80 border border-border/50 px-2.5 py-1.5 rounded truncate">
                                        {v.value}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {domainRecord.status !== "PENDING" && (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center space-y-2">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Buscando instruções...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <Separator />

                <CardFooter className="py-4 bg-secondary/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveDomain}
                    disabled={isActionLoading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Remover Domínio
                  </Button>
                </CardFooter>
              </Card>

              {/* Instructions Card */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Como configurar
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ol className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-foreground">
                        1
                      </span>
                      <span>Acesse o painel do seu provedor de DNS.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-foreground">
                        2
                      </span>
                      <span>
                        Crie um novo registro conforme mostrado acima.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-foreground">
                        3
                      </span>
                      <span>Aguarde a propagação (5 min a 24 horas).</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-foreground">
                        4
                      </span>
                      <span>
                        Clique em{" "}
                        <RefreshCw className="inline h-3 w-3 mx-0.5" /> para
                        verificar o status.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
