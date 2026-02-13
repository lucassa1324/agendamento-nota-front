import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function SuspensePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="mb-6 p-4 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={48} />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">Acesso Interrompido</h1>
      
      <div className="max-w-md space-y-4 mb-8">
        <p className="text-xl text-muted-foreground">
          Entre em contato com a administração para regularizar seu acesso.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          className="px-8"
          onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
        >
          Falar com Suporte
        </Button>
        <Link href="/admin">
          <Button variant="outline" size="lg" className="px-8">
            Voltar ao Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
