import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso da plataforma Aura Manager.",
};

export default function TermsOfUsePage() {
  const updatedAt = "15/04/2026";

  return (
    <main className="min-h-screen bg-secondary/30 py-10">
      <div className="container mx-auto max-w-3xl px-4">
        <article className="rounded-xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">
              Última atualização: {updatedAt}
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Aceitação</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Ao criar sua conta e utilizar a plataforma Aura Manager, você
              concorda com estes Termos de Uso. Se não concordar com algum item,
              não conclua o cadastro.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. Uso da Plataforma</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              O serviço é destinado à gestão de agenda, clientes e operações do
              seu negócio. Você é responsável pelas informações cadastradas e
              pelo uso da conta por sua equipe.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Cobrança e Acesso</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Planos pagos podem ser suspensos em caso de inadimplência,
              conforme regras de cobrança e período de carência aplicáveis. O
              cancelamento pode ser solicitado pelo usuário e processado de
              acordo com a política do provedor de pagamentos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Condutas Proibidas</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              É proibido usar a plataforma para atividades ilícitas, tentativa
              de fraude, violação de segurança ou envio de conteúdo que infrinja
              direitos de terceiros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">
              5. Limitação de Responsabilidade
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              A plataforma é fornecida conforme disponibilidade. Não garantimos
              ausência total de interrupções, mas buscamos manter estabilidade e
              segurança em nível adequado.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">6. Alterações</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Estes Termos podem ser atualizados periodicamente. Mudanças
              relevantes passam a valer após publicação nesta página.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
