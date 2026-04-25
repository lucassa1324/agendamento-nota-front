"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminAssignmentBoard } from "@/components/admin/admin-assignment-board";
import { EmployeeAgendaView } from "@/components/admin/employee-agenda-view";
import { TutorialContextualLink } from "@/components/admin/tutorial-reminder";
import { useStudio } from "@/context/studio-context";
import { appointmentService } from "@/lib/api-appointments";
import { useSession } from "@/lib/auth-client";

export default function AgendaPage() {
  const { data: session } = useSession();
  const { studio } = useStudio();
  const role = (session?.user as { role?: string } | undefined)?.role?.toLowerCase();
  const isSecretaryRole = role === "secretary";
  const [hasManagerAccess, setHasManagerAccess] = useState<boolean>(
    role === "admin" || role === "super_admin" || isSecretaryRole,
  );
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
      if (isSecretaryRole) {
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
  }, [studio?.id, isAdminUser, isSecretaryRole, isStaffUser]);

  const title = useMemo(() => {
    if (hasManagerAccess) return "Calendário de Agendamentos";
    return "Minha Agenda";
  }, [hasManagerAccess]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 font-sans text-3xl font-bold text-primary">{title}</h2>
          <p className="text-muted-foreground">
            {hasManagerAccess
              ? "Acompanhe o mês inteiro com uma legenda de cores por funcionária e pendências em destaque."
              : "Acompanhe seu próximo cliente e assuma oportunidades compatíveis com suas skills."}
          </p>
        </div>
        <TutorialContextualLink />
      </div>

      {isCheckingManagerAccess ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          Carregando calendário...
        </div>
      ) : hasManagerAccess || isAdminUser ? (
        <AdminAssignmentBoard mode="calendar" />
      ) : (
        <EmployeeAgendaView />
      )}
    </div>
  );
}
