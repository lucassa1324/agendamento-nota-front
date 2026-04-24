"use client";

import { Sparkles, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BadgeStatusProps = {
  assignedBy?: "system" | "staff";
  validationStatus?: "suggested" | "confirmed";
};

export function BadgeStatus({ assignedBy, validationStatus }: BadgeStatusProps) {
  const isSuggested = assignedBy === "system" && validationStatus === "suggested";

  if (isSuggested) {
    return (
      <Badge
        variant="outline"
        className="border-[var(--suggested-border)] bg-[var(--suggested-bg)] text-[var(--suggested-text)]"
      >
        <Sparkles className="mr-1 h-3 w-3" />
        Sistema
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-[var(--confirmed-border)] bg-[var(--confirmed-bg)] text-[var(--confirmed-text)]"
    >
      <UserCheck className="mr-1 h-3 w-3" />
      Manual
    </Badge>
  );
}
