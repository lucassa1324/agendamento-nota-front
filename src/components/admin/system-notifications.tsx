"use client";

import { AlertTriangle, Bell, Info, Loader2, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendVerificationEmail, useSession } from "@/lib/auth-client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { customFetch } from "@/lib/api-client";

export function SystemNotifications() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState<{ message: string | null; updatedAt: string | null }>({ message: null, updatedAt: null });
  const [isDismissed, setIsDismissed] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const { toast } = useToast();

  const isEmailVerified = session?.user?.emailVerified;

  // Só mostra a bolinha se houver algo realmente pendente/não visto
  const hasNotifications = !isEmailVerified || (!!announcement.message && !isDismissed && isNew);
  // Controla se o card de aviso deve ser exibido (independente da bolinha)
  const showAnnouncementCard = !!announcement.message && !isDismissed;

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const response = await customFetch("/api/account/system-announcement");
        if (response.ok) {
          const data = await response.json();
          setAnnouncement(data);

          if (data.updatedAt) {
            const lastDismissed = localStorage.getItem("dismissed_announcement_at");
            const lastSeen = localStorage.getItem("last_seen_announcement_at");
            
            setIsDismissed(lastDismissed === data.updatedAt);
            setIsNew(lastSeen !== data.updatedAt);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar aviso do sistema:", error);
      }
    }

    fetchAnnouncement();
  }, []);

  const handleDismissAnnouncement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (announcement.updatedAt) {
      localStorage.setItem("dismissed_announcement_at", announcement.updatedAt);
      localStorage.setItem("last_seen_announcement_at", announcement.updatedAt);
      setIsDismissed(true);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open && announcement.updatedAt && isNew) {
      localStorage.setItem("last_seen_announcement_at", announcement.updatedAt);
      setIsNew(false);
    }
  };

  const handleResendEmail = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      await sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/email-verified",
      });

      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para validar sua conta.",
      });
    } catch (error) {
      console.error("Erro ao enviar e-mail de verificação:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o e-mail. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={10}>
        <div className="p-4 flex items-center justify-between">
          <h4 className="font-semibold text-sm">Notificações do Sistema</h4>
          {hasNotifications && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Pendente
            </Badge>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-75">
          <div className="p-2">
            {(!showAnnouncementCard && isEmailVerified) ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Nenhuma notificação pendente.
              </div>
            ) : (
              <div className="space-y-2">
                {showAnnouncementCard && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleDismissAnnouncement}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                          Aviso do Sistema
                          {isNew && (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                          {announcement.message}
                        </p>
                        {announcement.updatedAt && (
                          <p className="text-[10px] text-muted-foreground/60 mt-2">
                            Atualizado em: {new Date(announcement.updatedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {!isEmailVerified && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                    <div className="flex gap-3 mb-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          E-mail não verificado
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300/80 mt-1">
                          Verifique seu e-mail para garantir a segurança dos seus dados.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleResendEmail}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-500/50 dark:text-yellow-400"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-3 w-3" />
                          Reenviar e-mail
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
