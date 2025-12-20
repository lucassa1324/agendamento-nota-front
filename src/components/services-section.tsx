import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Scissors, Palette, Star } from "lucide-react"

const services = [
  {
    icon: Scissors,
    title: "Design de Sobrancelhas",
    description: "Modelagem personalizada que valoriza seu formato de rosto e realça seu olhar.",
    price: "A partir de R$ 80",
  },
  {
    icon: Palette,
    title: "Coloração & Henna",
    description: "Técnicas de coloração para sobrancelhas mais definidas e expressivas.",
    price: "A partir de R$ 100",
  },
  {
    icon: Sparkles,
    title: "Micropigmentação",
    description: "Resultado natural e duradouro com técnicas avançadas de micropigmentação.",
    price: "A partir de R$ 600",
  },
  {
    icon: Star,
    title: "Laminação de Sobrancelhas",
    description: "Fios alinhados e volumosos por até 8 semanas com tratamento de laminação.",
    price: "A partir de R$ 150",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">Nossos Serviços</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Oferecemos uma variedade de tratamentos especializados para realçar sua beleza
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card key={index} className="border-border hover:border-accent transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>
                  <p className="text-accent font-semibold">{service.price}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
