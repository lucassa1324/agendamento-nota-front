# Configuração de Ambiente na Vercel (Staging)

Para que o ambiente de Staging funcione corretamente com os subdomínios e proxy, configure as seguintes variáveis de ambiente nas configurações do projeto na Vercel (aba **Settings > Environment Variables**), selecionando o ambiente **Preview** (ou **Production** se for o caso para Staging).

## Variáveis Obrigatórias

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `/api-proxy` | Força o uso do proxy local para evitar problemas de CORS e SSL misto. |
| `NEXT_PUBLIC_BASE_DOMAIN` | `staging.meudominio.com` | O domínio base que você configurou para este ambiente. |
| `NEXT_PUBLIC_VERCEL_URL` | `staging.meudominio.com` | Sobrescreve a URL automática da Vercel para garantir callbacks corretos. |
| `API_PROXY_TARGET_URL` | `https://api-staging.meudominio.com` | A URL **real** onde seu backend está rodando (sem `/api` no final se o backend já tiver). |

## Notas Importantes

1. **Logo e Imagens**: Com `NEXT_PUBLIC_API_URL=/api-proxy`, todas as imagens relativas serão carregadas via `https://staging.meudominio.com/api-proxy/...`, que redireciona internamente para seu backend. Isso resolve problemas de imagens carregando de domínios antigos.

2. **Notificações**: A rota `/api/notifications/test` agora será chamada como `/api-proxy/api/notifications/test`. Certifique-se de que seu backend responde nesse caminho.

3. **Autenticação**: O Better Auth usará `/api-proxy/api/auth` como base. Certifique-se de que o backend aceita requisições com esse prefixo ou que o rewrite remove o prefixo se necessário (o padrão atual mantém o path).
