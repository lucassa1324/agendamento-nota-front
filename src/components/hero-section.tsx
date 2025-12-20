import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/elegant-eyebrow-studio-interior-with-soft-lighting.jpg" alt="Studio" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Especialistas em Design de Sobrancelhas</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            Realce Sua Beleza Natural
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed max-w-2xl mx-auto">
            Transforme seu olhar com técnicas profissionais de design de sobrancelhas. Atendimento personalizado para
            destacar sua beleza única.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8">
              <Link href="/agendamento">Agendar Horário</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/galeria">Ver Trabalhos</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
