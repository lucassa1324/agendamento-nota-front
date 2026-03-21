# Problems and Diagnostics

Este documento rastreia os problemas identificados no editor do site e as soluções implementadas.

## 1. Problemas de Sincronização no Iframe (Nossos Serviços)

### Descrição
As configurações da seção "Nossos Serviços" não estão sendo aplicadas corretamente no iframe, apesar de serem enviadas pelo editor.

### Diagnóstico
*   **Falta de Sanitização:** O fluxo de dados entre o editor (parent) e o site (iframe) exige que as cores sejam sanitizadas para garantir que formatos inválidos ou nulos não quebrem a aplicação dos estilos CSS.
*   **Pontos Críticos:**
    *   `use-editor-sync.ts`: O `previewServicesSettings` precisa garantir que todas as cores (fundo da seção, fundo do card, etc.) estejam sanitizadas antes do `postMessage`.
    *   `services-section.tsx`: O handler de mensagem `UPDATE_SERVICES_SETTINGS` no iframe deve sanitizar os valores recebidos antes de atualizar o estado local.
    *   `use-editor-state.ts`: A função `handleUpdateServices` deve sanitizar os valores assim que o usuário interage com o editor.

### Soluções
- [x] Adicionar `sanitizeColor` em `handleUpdateServices` no `use-editor-state.ts`.
- [x] Corrigir dependência `setIsDirty` no `use-editor-state.ts`.
- [ ] Refinar a sanitização em `previewServicesSettings` no `use-editor-sync.ts`.
- [ ] Adicionar sanitização no handler de mensagem em `services-section.tsx`.

---

## 2. Atraso na Sincronização da Galeria (Nossos Trabalhos)

### Descrição
As alterações na seção "Nossos Trabalhos" só aparecem no iframe quando uma propriedade específica é clicada, em vez de atualizar instantaneamente.

### Diagnóstico
*   **Gatilho de Atualização:** O `useEffect` ou o `useMemo` responsável por gerar o preview da galeria pode estar faltando dependências ou o estado não está disparando a sincronização corretamente.
*   **Sanitização Inconsistente:** Assim como em "Nossos Serviços", a falta de paridade na sanitização com a seção "Valores" (que funciona bem) causa comportamentos inesperados.

### Soluções
- [ ] Implementar `sanitizeColor` em `handleUpdateGallery` no `use-editor-state.ts`.
- [ ] Revisar as dependências de `previewGallerySettings` em `use-editor-sync.ts`.
- [ ] Verificar se o componente `GalleryPreview.tsx` (ou similar no iframe) está escutando corretamente o evento `UPDATE_GALLERY_SETTINGS`.

---

## 3. Bug de Cor de Fundo Global

### Descrição
Ao alterar a cor de fundo de uma seção, a cor é aplicada a todos os elementos ou seções, em vez de apenas ao alvo selecionado.

### Diagnóstico
*   **Alvo de Estilização em `SectionBackground.tsx`:** O componente de fundo pode estar aplicando estilos a seletores muito genéricos ou compartilhando referências de estado que afetam múltiplos componentes.
*   **Referência "Valores":** A seção de valores funciona corretamente; a comparação de como ela aplica o `SectionBackground` vs outras seções revelará a discrepância.

### Soluções
- [ ] Investigar a aplicação de classes e estilos inline no `SectionBackground.tsx`.
- [ ] Garantir que o `bgType` e `bgColor` sejam escopados corretamente por seção.

---

## 4. Erros de Linter e Manutenção

### Diagnóstico
*   `use-editor-api.ts`: Erro de dependência ausente (`setIsDirty`) no hook `useCallback` (Linha 660).

### Soluções
- [ ] Corrigir dependências do linter no `use-editor-api.ts`.
