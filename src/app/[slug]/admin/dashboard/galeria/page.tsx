import { GalleryManager } from "@/components/admin/gallery-manager";

export default function GaleriaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="font-sans text-3xl font-bold mb-2 text-primary">
          Galeria
        </h2>
        <p className="text-muted-foreground">
          Gerencie as fotos do seu portfólio
        </p>
      </div>
      <GalleryManager />
    </div>
  );
}
