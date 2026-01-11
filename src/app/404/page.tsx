import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Studio não encontrado</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        O estabelecimento que você está procurando não existe ou o endereço está
        incorreto.
      </p>
      <Link href="/">
        <Button size="lg">Voltar para o início</Button>
      </Link>
    </div>
  );
}
