import { BookingFlow } from "@/components/booking-flow";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Agendar Horário | Brow Studio",
  description: "Agende seu horário e escolha o melhor serviço para você",
};

export default function AgendamentoPage() {
  return (
    <main>
      <section className="py-20 md:py-32 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-balance">
              Agende Seu Horário
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Escolha o serviço, data e horário que melhor se encaixam na sua
              rotina
            </p>
          </div>

          <BookingFlow />
        </div>
      </section>
      <Footer />
    </main>
  );
}
