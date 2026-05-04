import { SignUpForm } from "@/components/admin/signup-form";

export const metadata = {
  title: "Cadastro | Admin",
  description: "Crie sua conta administrativa",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold mb-2">Comece Agora</h1>
            <p className="text-muted-foreground">
              Crie sua conta para gerenciar seu negócio
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </main>
  );
}
