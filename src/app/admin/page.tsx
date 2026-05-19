import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Admin Login",
  description: "Área administrativa",
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
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
