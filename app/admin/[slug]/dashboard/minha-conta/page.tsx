import { AdminProfileManager } from "@/components/admin/admin-profile-manager";

export default function MinhaContaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Minha Conta
        </h2>
        <p className="text-muted-foreground">
          Gerencie seus dados de acesso e informações pessoais
        </p>
      </div>
      <AdminProfileManager />
    </div>
  );
}
