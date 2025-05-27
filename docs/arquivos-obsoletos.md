# Lista de Arquivos Obsoletos para Remoção

Este documento lista os arquivos que se tornaram obsoletos após a refatoração e integração da UI com o novo back-end, e que podem ser removidos com segurança.

## Arquivos em `/lib/`

- `/lib/api.ts` - Substituído por `/src/services/api/stockPrice.ts`
- `/lib/firebase.ts` - Substituído por `/src/services/firebase/config.ts`
- `/lib/firestore.ts` - Substituído por `/src/services/firebase/firestore.ts`
- `/lib/ai.ts` - Substituído por `/src/services/ai/textGeneration.ts`
- `/lib/cache.ts` - Substituído por `/src/utils/client/cache.ts`
- `/lib/types.ts` - Substituído por `/src/types/index.ts`
- `/lib/utils.ts` - Funcionalidades migradas para `/src/utils/`
- `/lib/client-utils/` - Migrado para `/src/utils/client/`
- `/lib/server/` - Migrado para `/src/utils/server/`

## Arquivos em `/contexts/`

- `/contexts/auth-context.tsx` - Substituído por `/src/contexts/auth-context.tsx`
- `/contexts/theme-context.tsx` - Substituído por `/src/contexts/theme-context.tsx`
- `/contexts/preview-auth-context.tsx` - Substituído por `/src/contexts/preview-auth-context.tsx`

## Arquivos em `/hooks/`

- `/hooks/use-portfolio.ts` - Substituído por `/src/hooks/use-portfolio.ts`
- Outros hooks em `/hooks/` que foram migrados para `/src/hooks/`

## Arquivos em `/app/api/`

- `/app/api/stock-price/route.ts` - Substituído por `/src/app/api/stock-price/route.ts`
- `/app/api/ai-recommendation/route.ts` - Substituído por `/src/app/api/ai-recommendation/route.ts`

## Justificativa para Remoção

Todos os arquivos listados acima foram substituídos por versões melhoradas na nova estrutura de diretórios sob `/src/`. A remoção desses arquivos é necessária para:

1. Evitar confusão sobre qual versão do código deve ser usada
2. Eliminar código duplicado que pode levar a inconsistências
3. Garantir que todas as partes do aplicativo usem a mesma lógica refatorada
4. Simplificar a manutenção futura ao ter apenas uma versão de cada funcionalidade

A integração da UI com o novo back-end foi concluída, e todos os componentes foram atualizados para usar os novos caminhos de importação. Não há mais dependências dos arquivos obsoletos listados acima.
