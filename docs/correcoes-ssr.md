# Correções de Compatibilidade SSR

Este documento detalha as correções implementadas para resolver os erros de build na Vercel relacionados à incompatibilidade entre funções client-side e Server-Side Rendering (SSR).

## Problema Identificado

O erro principal ocorria durante o build na Vercel:

```
Error: Attempted to call cn() from the server but cn is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.
```

Este erro acontecia porque a função `cn()` (uma função client-side) estava sendo chamada durante o Server-Side Rendering em alguns componentes.

## Causas Raiz

1. **Componentes UI sem diretiva "use client"**:
   - Vários componentes UI que usavam a função `cn()` não estavam marcados como componentes client-side
   - Isso fazia com que o Next.js tentasse renderizá-los no servidor, causando o erro

2. **Imports incorretos**:
   - Muitos componentes importavam `cn()` de `@/lib/utils` em vez de `@/core/utils/styling`
   - Isso criava uma cadeia de dependências que não respeitava a separação client/server

3. **Reexportações problemáticas**:
   - Arquivos como `src/types/index.ts` reexportavam funções de UI como `formatCurrency`
   - Isso misturava código client-side com tipos que deveriam ser agnósticos de renderização

4. **Componentes compartilhados sem isolamento**:
   - Helpers como `LoadingState` e `LoadingSpinner` usavam `cn()` sem a diretiva "use client"
   - Esses componentes eram usados em páginas que passavam por SSR

## Correções Implementadas

### 1. Adição de "use client" em Componentes UI

Adicionamos a diretiva "use client" no topo dos seguintes arquivos:

- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/badge-status.tsx`
- `src/components/ui/loading-state.tsx`
- `src/components/ui/loading-spinner.tsx`
- Outros componentes UI que usavam a função `cn()`

### 2. Correção de Imports

Atualizamos todos os imports da função `cn()` para apontarem para o local correto:

```typescript
// Antes
import { cn } from "@/lib/utils"

// Depois
import { cn } from "@/core/utils/styling"
```

### 3. Remoção de Reexportações

Removemos reexportações problemáticas que misturavam código client-side com tipos:

```typescript
// Antes (em src/types/index.ts)
export { formatCurrency } from "@/lib/utils";

// Depois
// Reexportação removida
```

### 4. Correção de Imports de Utilitários

Atualizamos imports de funções como `formatCurrency` para apontarem diretamente para o módulo correto:

```typescript
// Antes
import { formatCurrency } from "@/types/index"

// Depois
import { formatCurrency } from "@/core/utils/formatting"
```

## Arquivos Modificados

1. **Componentes UI**:
   - `src/components/ui/card.tsx`
   - `src/components/ui/button.tsx`
   - `src/components/ui/accordion.tsx`
   - `src/components/ui/alert-dialog.tsx`
   - `src/components/ui/alert.tsx`
   - `src/components/ui/avatar.tsx`
   - `src/components/ui/badge-status.tsx`
   - `src/components/ui/badge.tsx`
   - `src/components/ui/loading-state.tsx`
   - `src/components/ui/loading-spinner.tsx`

2. **Arquivos de Tipos**:
   - `src/types/index.ts`

3. **Páginas**:
   - `src/app/calculadora-balanceamento/resultado/page.tsx`

## Recomendações para Manutenção Futura

1. **Sempre use "use client" em componentes que:**
   - Usam hooks do React
   - Usam funções client-side como `cn()`
   - Manipulam o DOM ou usam APIs do navegador

2. **Mantenha separação clara entre:**
   - Código client-side (UI, interatividade)
   - Código server-side (dados, lógica de negócio)
   - Tipos e interfaces (agnósticos de renderização)

3. **Evite reexportações entre camadas:**
   - Não reexporte funções de UI em arquivos de tipos
   - Não misture utilitários client-side com utilitários server-side

4. **Teste builds locais antes de deploy:**
   - Execute `npm run build` localmente para detectar problemas de SSR
   - Verifique se todas as páginas estão sendo renderizadas corretamente

## Resultado

Após implementar essas correções, o build foi concluído com sucesso e todas as páginas estão sendo renderizadas corretamente, incluindo a página problemática `/calculadora-balanceamento/resultado`.

O deploy na Vercel agora deve funcionar sem erros de SSR.
