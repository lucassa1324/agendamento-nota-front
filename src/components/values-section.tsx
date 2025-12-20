import { Heart, Award, Users, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const values = [
  {
    icon: Heart,
    title: "Paixão pelo que Fazemos",
    description: "Cada atendimento é realizado com dedicação e amor pela arte de realçar a beleza natural.",
  },
  {
    icon: Award,
    title: "Excelência e Qualidade",
    description: "Utilizamos apenas produtos de alta qualidade e técnicas comprovadas para resultados perfeitos.",
  },
  {
    icon: Users,
    title: "Atendimento Personalizado",
    description: "Cada cliente é única e merece um design exclusivo que valorize suas características.",
  },
  {
    icon: Sparkles,
    title: "Inovação Constante",
    description: "Sempre atualizadas com as últimas tendências e técnicas do mercado de beleza.",
  },
]

export function ValuesSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">Nossos Valores</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Os princípios que guiam nosso trabalho e relacionamento com cada cliente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <Card key={index} className="border-border text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
