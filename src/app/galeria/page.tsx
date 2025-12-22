import { Footer } from "@/components/footer";
import { GalleryGrid } from "@/components/gallery-grid";

export const metadata = {
  title: "Galeria de Trabalhos | Brow Studio",
  description:
    "Veja nossos trabalhos e resultados incríveis em design de sobrancelhas",
};

export default function GaleriaPage() {
  return (
    <main>
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-balance">
              Nossa Galeria
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Confira alguns dos nossos trabalhos e veja a transformação que
              podemos fazer por você
            </p>
          </div>

          <GalleryGrid />
        </div>
      </section>
      <Footer />
    </main>
  );
}
