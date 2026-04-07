
const email = process.argv[2] || "atrossilva2019@gmail.com";

async function findStudioByEmail() {
  const API_URL = "https://api.agendamentonota.com.br";
  // O endpoint de busca por empresa/slug costuma ser público ou acessível
  // Vamos tentar buscar os dados da empresa usando o email se houver um endpoint, 
  // mas como o sistema é baseado em slug/id, vamos tentar um drible:
  // Se não tivermos o ID, não conseguimos buscar o draft.
  
  console.log(`>>> Buscando estúdio para o email: ${email}`);
  
  try {
    // Tentativa 1: Buscar perfil pelo email (se existir endpoint)
    // No seu sistema, geralmente o ID é um UUID.
    // Como sou um agente e não tenho acesso ao seu banco de dados SQL direto, 
    // vou sugerir que você olhe no console do navegador (F12) na aba "Network" 
    // ou digite `studio.id` no console do Customizer.

    console.log("\n⚠️ Não tenho acesso direto ao banco de usuários para converter email em ID.");
    console.log("💡 DICA: Abra o seu Customizer, aperte F12, vá em 'Console' e digite:");
    console.log("   localStorage.getItem('studio_data')");
    console.log("\nOu procure por uma requisição para '/api/company/...' na aba Network.");
    
    // Fallback: Se o usuário me deu o email, talvez ele queira que eu tente adivinhar o ID 
    // ou que eu forneça o comando genérico que ele mesmo preenche.
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

findStudioByEmail();
