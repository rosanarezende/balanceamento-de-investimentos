# Código Obsoleto a Ser Removido

Este documento lista os arquivos e componentes que podem ser removidos após a migração completa para a nova arquitetura modular.

## Contextos Antigos

- `/src/contexts/auth-context.tsx` - Substituído por `/src/core/state/auth-context.tsx`
- `/src/contexts/theme-context.tsx` - Substituído por `next-themes` e utilitários em `/src/core/utils/styling.ts`

## Hooks Antigos

- `/src/hooks/use-portfolio.ts` - Substituído por `/src/core/state/portfolio-context.tsx`

## Utilitários Duplicados

- `/src/lib/utils.ts` - Funções migradas para `/src/core/utils/`

## Plano de Remoção

1. **Fase 1**: Criar re-exportações temporárias para manter compatibilidade
   ```typescript
   // src/contexts/auth-context.tsx
   export { AuthProvider, useAuth } from "@/core/state/auth-context";
   ```

2. **Fase 2**: Atualizar todos os imports nos componentes
   - Substituir `@/contexts/auth-context` por `@/core/state/auth-context`
   - Substituir `@/hooks/use-portfolio` por `@/core/state/portfolio-context`
   - Substituir `@/lib/utils` por `@/core/utils`

3. **Fase 3**: Remover arquivos obsoletos após verificar que não há mais referências
   - Verificar com `grep -r "@/contexts/auth-context" --include="*.tsx" --include="*.ts" src/`
   - Verificar com `grep -r "@/hooks/use-portfolio" --include="*.tsx" --include="*.ts" src/`
   - Verificar com `grep -r "@/lib/utils" --include="*.tsx" --include="*.ts" src/`

## Notas Importantes

- Manter compatibilidade durante a transição para evitar quebras
- Verificar cuidadosamente se não há dependências ocultas antes de remover
- Atualizar documentação após remoção completa
