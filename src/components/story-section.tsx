export function StorySection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/professional-eyebrow-artist-at-work.jpg"
              alt="Nossa História"
              className="rounded-2xl w-full h-auto"
            />
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-balance">Nossa História</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                O Brow Studio nasceu da paixão por realçar a beleza natural de cada pessoa através do design de
                sobrancelhas. Com mais de 10 anos de experiência no mercado, nos especializamos em técnicas avançadas
                que valorizam a individualidade de cada cliente.
              </p>
              <p>
                Nossa missão é proporcionar não apenas um serviço de qualidade, mas uma experiência transformadora.
                Acreditamos que sobrancelhas bem feitas têm o poder de elevar a autoestima e destacar a beleza única de
                cada pessoa.
              </p>
              <p>
                Investimos constantemente em capacitação e nas melhores técnicas do mercado para garantir resultados
                excepcionais e a satisfação total de nossas clientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
