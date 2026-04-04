"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redireciona para o login informando que foi verificado
    const timer = setTimeout(() => {
      router.replace("/admin?verified=true");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-medium">Verificando seu e-mail...</h1>
      <p className="text-muted-foreground">Você será redirecionado em instantes.</p>
    </div>
  );
}
