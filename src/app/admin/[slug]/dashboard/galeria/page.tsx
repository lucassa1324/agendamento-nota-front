import { ImageIcon } from "lucide-react";
import { DashboardPageShell } from "@/components/admin/dashboard-page-shell";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default function GaleriaPage() {
  return (
    <DashboardPageShell
      title="Galeria"
      subtitle="Gerencie as fotos do seu portfólio com um layout mais elegante"
      icon={ImageIcon}
      badge="Portfólio"
    >
      <GalleryManager />
    </DashboardPageShell>
  );
}
