import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-none">
        <CardHeader className="pt-8 pb-6">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-slate-900">
            E-mail Verificado!
          </CardTitle>
          <CardDescription className="text-slate-500 text-lg mt-2">
            Sua conta foi confirmada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          <p className="text-slate-600 leading-relaxed">
            Agora você já pode acessar o sistema e gerenciar seus agendamentos sem restrições.
          </p>
          <div className="pt-2">
            <Button asChild className="w-full h-12 text-lg font-medium shadow-md transition-all hover:scale-[1.02]">
              <Link href="/admin">
                Ir para o Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
