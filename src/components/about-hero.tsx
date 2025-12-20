export function AboutHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/beauty-salon-professional-workspace.jpg"
          alt="Studio"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 text-balance">Sobre Nós</h1>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            Dedicadas a realçar a beleza natural de cada cliente através de técnicas especializadas e atendimento
            personalizado
          </p>
        </div>
      </div>
    </section>
  )
}
