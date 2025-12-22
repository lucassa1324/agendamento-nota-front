import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const team = [
  {
    name: "Ana Silva",
    role: "Fundadora & Designer de Sobrancelhas",
    image: "professional+eyebrow+artist+portrait",
    description:
      "Especialista em micropigmentação com mais de 10 anos de experiência.",
  },
  {
    name: "Carla Santos",
    role: "Designer de Sobrancelhas",
    image: "beauty+professional+portrait+woman",
    description:
      "Certificada em técnicas avançadas de design e laminação de sobrancelhas.",
  },
  {
    name: "Juliana Costa",
    role: "Especialista em Coloração",
    image: "makeup+artist+professional+portrait",
    description:
      "Expert em coloração e henna, com foco em resultados naturais.",
  },
];

export function TeamSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">
            Nossa Equipe
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Profissionais qualificadas e apaixonadas por realçar sua beleza
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member) => (
            <Card key={member.name} className="border-border overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={`/.jpg?height=400&width=400&query=${member.image}`}
                  alt={member.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="font-serif text-xl font-semibold mb-1">
                  {member.name}
                </h3>
                <p className="text-accent text-sm font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
