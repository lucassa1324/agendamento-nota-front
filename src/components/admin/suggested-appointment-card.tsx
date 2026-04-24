"use client";

import { Sparkles } from "lucide-react";
import type { Appointment } from "@/lib/api-appointments";
import { cn } from "@/lib/utils";
import { BadgeStatus } from "./badge-status";

type SuggestedAppointmentCardProps = {
  appointment: Appointment;
  timeLabel: string;
  className?: string;
  onDragStart?: (appointment: Appointment) => void;
};

export function SuggestedAppointmentCard({
  appointment,
  timeLabel,
  className,
  onDragStart,
}: SuggestedAppointmentCardProps) {
  const isSuggested =
    appointment.assignedBy === "system" && appointment.validationStatus === "suggested";

  return (
    <article
      draggable
      onDragStart={() => onDragStart?.(appointment)}
      className={cn(
        "rounded-lg border bg-card p-2 text-xs shadow-xs transition hover:shadow-sm",
        isSuggested
          ? "border-dashed border-[var(--suggested-border)] bg-[var(--suggested-bg)]"
          : "border-solid border-[var(--confirmed-border)] bg-[var(--confirmed-bg)]",
        className,
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-semibold">{timeLabel}</span>
        {isSuggested && <Sparkles className="h-3.5 w-3.5 text-[var(--suggested-text)]" />}
      </div>
      <p className="truncate font-medium">{appointment.customerName}</p>
      <p className="truncate text-[11px] text-muted-foreground">{appointment.serviceNameSnapshot}</p>
      <div className="mt-1.5">
        <BadgeStatus
          assignedBy={appointment.assignedBy}
          validationStatus={appointment.validationStatus}
        />
      </div>
    </article>
  );
}
