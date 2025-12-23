import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const galleryImages = [
  { id: 1, query: "professional+eyebrow+design+before+after" },
  { id: 2, query: "beautiful+shaped+eyebrows+close+up" },
  { id: 3, query: "eyebrow+microblading+result" },
  { id: 4, query: "henna+eyebrow+tinting+result" },
  { id: 5, query: "eyebrow+lamination+before+after" },
  { id: 6, query: "perfect+eyebrow+shape+design" },
];

export function GalleryPreview() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">
            Nossos Trabalhos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Veja alguns dos resultados incríveis que alcançamos com nossas
            clientes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <Image
                src={`/.jpg?height=400&width=400&query=${image.query}`}
                alt={`Trabalho ${image.id}`}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/galeria">Ver Galeria Completa</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
