import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">E-mail Verificado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Sua conta foi verificada com sucesso. Agora você tem acesso total a
            todos os recursos.
          </p>
          <Button asChild className="w-full">
            <Link href="/admin">Voltar para o Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
