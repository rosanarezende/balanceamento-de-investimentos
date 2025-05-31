# Mapeamento de Componentes e Fluxos da UI

## Componentes Principais

### Componentes de Autenticação
- **auth-guard.tsx**: Proteção de rotas autenticadas, depende do contexto de autenticação
- **preview-login-form.tsx**: Formulário de login, depende do contexto de autenticação

### Componentes de Dashboard
- **portfolio-chart.tsx**: Gráfico de pizza do portfólio, depende do hook usePortfolio
- **portfolio-comparison-chart.tsx**: Gráfico de comparação, depende do hook usePortfolio
- **portfolio-summary.tsx**: Resumo do portfólio, depende do hook usePortfolio
- **insights-panel.tsx**: Painel de insights, depende do hook usePortfolio

### Componentes de Gerenciamento de Ativos
- **add-stock-form.tsx**: Formulário para adicionar ativos, depende do hook usePortfolio
- **stock-card.tsx**: Card de ativo individual, depende do hook usePortfolio
- **recommendation-editor.tsx**: Editor de recomendações, depende do hook usePortfolio
- **user-recommendation-selector.tsx**: Seletor de recomendações, componente de UI puro

### Componentes de Tema
- **theme-provider.tsx**: Provider de tema, independente
- **theme-toggle.tsx**: Alternador de tema, depende do theme-provider

## Fluxos Funcionais

### Fluxo de Autenticação
1. Usuário acessa a aplicação
2. Se não autenticado, é redirecionado para login
3. Após login bem-sucedido, é redirecionado para dashboard
4. AuthGuard protege rotas que exigem autenticação

### Fluxo de Dashboard
1. Carregamento de dados do portfólio do usuário
2. Exibição de resumo e gráficos
3. Interação com filtros e visualizações
4. Atualização em tempo real de valores

### Fluxo de Gerenciamento de Ativos
1. Adição de novos ativos ao portfólio
2. Edição de ativos existentes
3. Remoção de ativos
4. Atualização de recomendações

## Dependências de Estado

### Contexto de Autenticação
- **Componentes dependentes**: AuthGuard, PreviewLoginForm
- **Estado gerenciado**: user, loading, error, signInWithGoogle, signOut

### Hook usePortfolio
- **Componentes dependentes**: Todos os componentes de Dashboard e Gerenciamento de Ativos
- **Estado gerenciado**: stocks, stocksWithDetails, totalPortfolioValue, loading, error

## Pontos de Integração com Nova Arquitetura

### Prioridade Alta
1. **auth-context.tsx** → **core/state/auth-context.tsx**
   - Migrar componentes para usar o novo contexto
   - Garantir compatibilidade de interfaces

2. **use-portfolio.ts** → **core/state/portfolio-context.tsx**
   - Adaptar componentes para usar o novo contexto
   - Garantir que todos os métodos necessários estejam disponíveis

### Prioridade Média
1. **Componentes de UI** → **core/utils**
   - Atualizar imports de formatação e estilização
   - Usar utilitários centralizados

### Prioridade Baixa
1. **Tratamento de erros** → **core/state/error-handling.tsx**
   - Implementar ErrorBoundary nos componentes principais
   - Centralizar tratamento de erros

## Código Potencialmente Obsoleto

1. **Hooks duplicados** em diferentes componentes
2. **Formatação e validação** espalhadas pelo código
3. **Tratamento de erros** inconsistente
4. **Estados locais** que podem ser centralizados

## Próximos Passos

1. Integrar AuthGuard com o novo contexto de autenticação
2. Adaptar componentes de Dashboard para usar o novo contexto de portfólio
3. Atualizar imports de utilitários em todos os componentes
4. Implementar tratamento de erros consistente
5. Remover código duplicado e obsoleto
