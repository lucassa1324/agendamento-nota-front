import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Login | Brow Studio",
  description: "Área administrativa do Brow Studio",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold mb-2">
              Área Administrativa
            </h1>
            <p className="text-muted-foreground">
              Faça login para acessar o dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
