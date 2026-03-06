import { useCallback } from "react";
import { getDraftTimestamp } from "@/lib/booking-data";

export function useDraftRecovery() {
  const checkShouldRecoverDraft = useCallback(() => {
    const draftTimestampStr = getDraftTimestamp();
    const draftTimestamp = draftTimestampStr ? new Date(draftTimestampStr).getTime() : 0;

    // Lógica de recuperação desativada temporariamente conforme solicitado
    const shouldRecoverDrafts = false;
    
    return { shouldRecoverDrafts, draftTimestamp };
  }, []);

  return { checkShouldRecoverDraft };
}
