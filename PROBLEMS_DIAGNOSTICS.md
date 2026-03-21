# Problems and Diagnostics (#problems_and_diagnostics)

Este documento rastreia os problemas identificados no Editor do Site e as soluções aplicadas.

## 1. Configurações de "Nossos Serviços" não aplicadas no Iframe
- **Sintoma:** Alterações de cor e estilo na seção de serviços não refletem no preview (iframe).
- **Causa:** Falta de sanitização de cores (ex: falta de `#`) em múltiplos pontos do fluxo de sincronização.
- **Diagnóstico:**
    - `use-editor-state.ts`: `handleUpdateServices` não sanitizava as cores antes de atualizar o estado. (Corrigido)
    - `use-editor-sync.ts`: `previewServicesSettings` precisava de sanitização extra para garantir que o iframe receba valores válidos. (Corrigido)
    - `services-section.tsx`: O manipulador de mensagens `UPDATE_SERVICES_SETTINGS` no componente dentro do iframe não sanitizava os valores recebidos. (Pendente)
- **Status:** Parcialmente Resolvido.

## 2. Atraso na Sincronização de "Nossos Trabalhos" (Galeria)
- **Sintoma:** Configurações da galeria só são aplicadas no iframe após clicar em uma propriedade.
- **Causa:** O gatilho de sincronização postMessage pode estar vinculado a eventos incorretos ou a sanitização está falhando, impedindo a aplicação imediata.
- **Diagnóstico:** Necessário alinhar o padrão de `handleUpdateGallery` e `previewGallerySettings` com o de outras seções que funcionam (ex: "Valores").
- **Status:** Em Investigação.

## 3. Bug de Cor de Fundo Global
- **Sintoma:** Alterar a cor de fundo de uma seção afeta todos os elementos ou várias seções ao mesmo tempo.
- **Causa:** Provável erro no `SectionBackground.tsx` ou na forma como o `bgType` é tratado, possivelmente aplicando estilos a seletores genéricos ou compartilhando estado indevidamente.
- **Diagnóstico:** Verificar se a `SectionBackground` está isolada e se o `effectiveBackgroundColor` não está vazando para outros componentes via CSS global ou variáveis de ambiente.
- **Status:** Em Investigação.

## 4. Erros de Dependência de Hooks (Linter)
- **Sintoma:** Avisos do linter sobre dependências ausentes (ex: `setIsDirty`).
- **Causa:** Hooks `useCallback` e `useEffect` não incluem todas as funções/variáveis usadas em seu array de dependências.
- **Diagnóstico:** `use-editor-api.ts` na linha 660 e outros hooks no `use-editor-state.ts`.
- **Status:** Parcialmente Resolvido (Corrigido em `handleUpdateServices`).
