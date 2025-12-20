import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Maria Oliveira",
    text: "Simplesmente perfeito! A Ana entendeu exatamente o que eu queria e o resultado ficou incrível. Minhas sobrancelhas nunca estiveram tão bonitas!",
    rating: 5,
  },
  {
    name: "Fernanda Lima",
    text: "Profissionais extremamente capacitadas e atenciosas. O ambiente é acolhedor e o resultado superou minhas expectativas. Super recomendo!",
    rating: 5,
  },
  {
    name: "Beatriz Costa",
    text: "Fiz a micropigmentação e estou apaixonada pelo resultado! Natural, delicado e exatamente como eu queria. Melhor investimento que fiz!",
    rating: 5,
  },
  {
    name: "Camila Rodrigues",
    text: "Atendimento impecável do início ao fim. A equipe é super profissional e o cuidado com cada detalhe faz toda a diferença. Voltarei com certeza!",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">O Que Dizem Nossas Clientes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            A satisfação de nossas clientes é nossa maior conquista
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">{testimonial.text}</p>
                <p className="font-semibold">{testimonial.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
