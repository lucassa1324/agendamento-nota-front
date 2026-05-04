"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminAssignmentBoard } from "@/components/admin/admin-assignment-board";
import { EmployeeAgendaView } from "@/components/admin/employee-agenda-view";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";
import { useStudio } from "@/context/studio-context";
import { appointmentService } from "@/lib/api-appointments";
import { useSession } from "@/lib/auth-client";

export default function EncaminhamentosPage() {
  const { data: session } = useSession();
  const { studio } = useStudio();
  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  const [hasManagerAccess, setHasManagerAccess] = useState<boolean>(role === "admin");
  const [isCheckingManagerAccess, setIsCheckingManagerAccess] = useState(false);

  const isStaffUser = role === "user";
  const isAdminUser = role === "admin" || role === "super_admin";

  useEffect(() => {
    let cancelled = false;
    const probeManagerAccess = async () => {
      if (!studio?.id) return;
      if (isAdminUser) {
        if (!cancelled) setHasManagerAccess(true);
        return;
      }
      if (!isStaffUser) {
        if (!cancelled) setHasManagerAccess(false);
        return;
      }

      setIsCheckingManagerAccess(true);
      try {
        await appointmentService.listUnassigned(studio.id);
        if (!cancelled) setHasManagerAccess(true);
      } catch {
        if (!cancelled) setHasManagerAccess(false);
      } finally {
        if (!cancelled) setIsCheckingManagerAccess(false);
      }
    };

    probeManagerAccess();
    return () => {
      cancelled = true;
    };
  }, [studio?.id, isAdminUser, isStaffUser]);

  const title = useMemo(() => {
    if (hasManagerAccess) return "Painel de Encaminhamentos";
    return "Minha Agenda";
  }, [hasManagerAccess]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 font-sans text-3xl font-bold text-primary">{title}</h2>
          <p className="text-muted-foreground">
            {hasManagerAccess
              ? "Secretaria/Admin: faça encaminhamento manual, valide sugestões automáticas e distribua a agenda por funcionária."
              : "Acompanhe seu próximo cliente e assuma oportunidades compatíveis com suas skills."}
          </p>
        </div>
        <TutorialContextualLink />
      </div>

      {isCheckingManagerAccess ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          Carregando encaminhamentos...
        </div>
      ) : hasManagerAccess || isAdminUser ? (
        <AdminAssignmentBoard mode="assignment" />
      ) : (
        <EmployeeAgendaView />
      )}
    </div>
  );
}
