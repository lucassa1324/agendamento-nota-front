import { ProfileManager } from "@/components/admin/profile-manager";

export default function PerfilPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Dados da Empresa
        </h2>
        <p className="text-muted-foreground">
          Informações comerciais, contatos e redes sociais
        </p>
      </div>
      <ProfileManager />
    </div>
  );
}
