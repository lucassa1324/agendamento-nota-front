/**
 * Hook utilitário para detectar se a tela atual é de um dispositivo móvel.
 * Baseado no breakpoint de largura da janela (padrão 1024px).
 */
import { useEffect, useState } from "react";

export function useIsMobile(breakpoint: number = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
