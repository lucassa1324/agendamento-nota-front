# Configuração de Ambiente na Vercel (Staging)

Para que o frontend fale diretamente com o backend, configure as seguintes variáveis de ambiente nas configurações do projeto na Vercel (aba **Settings > Environment Variables**), selecionando o ambiente **Preview** (ou **Production** se for o caso para Staging).

## Variáveis Obrigatórias

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.meudominio.com` | URL absoluta do backend usada por todas as requisições do frontend. |
| `NEXT_PUBLIC_BASE_DOMAIN` | `staging.meudominio.com` | O domínio base que você configurou para este ambiente. |
| `NEXT_PUBLIC_VERCEL_URL` | `staging.meudominio.com` | Sobrescreve a URL automática da Vercel para garantir callbacks corretos. |
| `NEXT_PUBLIC_APP_URL` | `https://app.staging.meudominio.com` | URL pública do frontend para redirects e links absolutos. |

## Notas Importantes

1. **API e Auth**: O frontend usa `NEXT_PUBLIC_API_URL` como base absoluta e chama o backend diretamente, inclusive no Better Auth (`/api/auth`).

2. **CORS**: O backend precisa continuar permitindo `https://app.staging.meudominio.com` em `trustedOrigins` e nos headers de CORS.

3. **Token e sessão**: As chamadas enviam `credentials: include` e só adicionam `Authorization: Bearer ...` quando o token real estiver disponível.
