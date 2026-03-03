import { useCallback, useRef } from "react";
import { getDraftTimestamp } from "@/lib/booking-data";

interface UseDraftRecoveryProps {
  studioId?: string;
}

export function useDraftRecovery({ studioId }: UseDraftRecoveryProps) {
  const recoveryDecisionRef = useRef<boolean | null>(null);

  const checkShouldRecoverDraft = useCallback((bankUpdatedAt: number) => {
    const draftTimestampStr = getDraftTimestamp();
    const draftTimestamp = draftTimestampStr ? new Date(draftTimestampStr).getTime() : 0;

    let shouldRecoverDrafts = false;
    if (draftTimestamp > bankUpdatedAt) {
      if (typeof window !== "undefined") {
        const recoveryStorageKey = studioId
          ? `draft_recovery_decision_${studioId}`
          : "draft_recovery_decision";
        const storedDecision = sessionStorage.getItem(recoveryStorageKey);
        
        if (recoveryDecisionRef.current === null && storedDecision) {
          try {
            const parsed = JSON.parse(storedDecision) as {
              draftTimestamp?: number;
              decision?: boolean;
            };
            if (parsed?.draftTimestamp === draftTimestamp) {
              recoveryDecisionRef.current = parsed.decision ?? null;
            } else {
              sessionStorage.removeItem(recoveryStorageKey);
            }
          } catch {
            sessionStorage.removeItem(recoveryStorageKey);
          }
        }
      }

      if (recoveryDecisionRef.current === null) {
        console.log(
          `>>> [useDraftRecovery] Rascunho local (${new Date(draftTimestamp).toISOString()}) é mais recente que o banco (${new Date(bankUpdatedAt).toISOString()})`,
        );
        recoveryDecisionRef.current = window.confirm(
          "Você tem alterações não salvas (rascunhos) que são mais recentes que a versão publicada. Deseja recuperar essas alterações?",
        );
        
        if (typeof window !== "undefined") {
          const recoveryStorageKey = studioId
            ? `draft_recovery_decision_${studioId}`
            : "draft_recovery_decision";
          sessionStorage.setItem(
            recoveryStorageKey,
            JSON.stringify({
              draftTimestamp,
              decision: recoveryDecisionRef.current,
            }),
          );
        }
      }
      shouldRecoverDrafts = recoveryDecisionRef.current ?? false;
    }
    
    return { shouldRecoverDrafts, draftTimestamp };
  }, [studioId]);

  return { checkShouldRecoverDraft };
}
