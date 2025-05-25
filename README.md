# Investir para o futuro

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rosana-rezendes-projects/v0-investir-para-o-futuro)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/QNdp8n2hReh)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/rosana-rezendes-projects/v0-investir-para-o-futuro](https://vercel.com/rosana-rezendes-projects/v0-investir-para-o-futuro)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/QNdp8n2hReh](https://v0.dev/chat/projects/QNdp8n2hReh)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## New Features and Improvements

### Gerenciamento de Estado
- Implementação de uma solução centralizada para estados complexos.
- Redução da duplicação de lógica em diferentes componentes.
- Tratamento de erros consistente em toda a aplicação.

### Tratamento de Dados e API
- Mecanismo de cache adicionado à função `fetchStockPrice` para evitar chamadas repetidas.
- Estratégia clara para lidar com falhas de API implementada.
- Validação robusta de dados recebidos das APIs.

### Performance
- Redução de recálculos desnecessários em componentes.
- Implementação de carregamento lazy para componentes e rotas.
- Simulação de variação diária otimizada para evitar inconsistências.

### Testes
- Cobertura abrangente de testes adicionada.
- Testes para hooks personalizados e contextos implementados.
- Testes de integração e end-to-end adicionados.

### Segurança
- Regras de segurança do Firestore claramente definidas no código.
- Validação de entrada do usuário antes de salvar no banco de dados.
- Proteção contra manipulação de dados no cliente implementada.

### Usabilidade e Acessibilidade
- Indicadores claros de carregamento adicionados em todas as operações assíncronas.
- Suporte para temas claros/escuros consistentes implementado.
- Conformidade com diretrizes de acessibilidade (WCAG) melhorada.

### Arquitetura e Organização
- Separação da lógica de negócios dos componentes de UI.
- Padronização na estrutura de pastas e organização de arquivos.
- Camada de serviço bem definida para operações de dados adicionada.

### Documentação
- Documentação técnica sobre a arquitetura e decisões de design adicionada.
- Documentação clara sobre o uso e propósito de componentes e hooks.

### Dependências e Configuração
- Versões específicas de dependências definidas para evitar problemas de compatibilidade.
- Configuração de build otimizada para produção.
- Estratégia clara para gerenciamento de variáveis de ambiente implementada.

### Experiência do Desenvolvedor
- Ferramentas de linting e formatação configuradas.
- Scripts de utilidade para tarefas comuns de desenvolvimento adicionados.
- Pipeline de CI/CD configurado além do deploy básico da Vercel.

## Arquitetura e Decisões de Design

### Arquitetura
A arquitetura do projeto foi projetada para ser modular e escalável. Abaixo estão os principais componentes e suas responsabilidades:

- **Componentes de UI**: Responsáveis pela renderização da interface do usuário. Eles são projetados para serem reutilizáveis e desacoplados da lógica de negócios.
- **Hooks Personalizados**: Utilizados para encapsular lógica de estado e efeitos colaterais. Eles ajudam a manter os componentes de UI limpos e focados na renderização.
- **Contextos**: Utilizados para gerenciar o estado global da aplicação. Eles fornecem uma maneira eficiente de compartilhar dados entre componentes sem a necessidade de prop drilling.
- **Camada de Serviço**: Responsável por todas as operações de dados, como chamadas de API e interações com o banco de dados. Isso ajuda a manter a lógica de negócios separada dos componentes de UI.
- **Gerenciamento de Estado**: Implementado usando uma combinação de hooks personalizados e contextos. Isso permite um gerenciamento de estado eficiente e centralizado.

### Decisões de Design
- **Separação de Preocupações**: A lógica de negócios é separada dos componentes de UI para melhorar a manutenibilidade e a escalabilidade do código.
- **Reutilização de Código**: Componentes de UI e hooks personalizados são projetados para serem reutilizáveis em diferentes partes da aplicação.
- **Desempenho**: Técnicas como memoização e carregamento lazy são utilizadas para melhorar o desempenho da aplicação.
- **Acessibilidade**: A aplicação segue as diretrizes de acessibilidade (WCAG) para garantir que seja utilizável por todos os usuários.
- **Segurança**: Regras de segurança do Firestore e validação de entrada do usuário são implementadas para proteger os dados da aplicação.

## Uso e Propósito de Componentes e Hooks

### Componentes de UI
- **Button**: Componente de botão reutilizável com suporte para diferentes variantes e tamanhos.
- **Card**: Componente de cartão utilizado para agrupar conteúdo relacionado.
- **LoadingSpinner**: Componente de spinner de carregamento utilizado para indicar operações assíncronas em andamento.
- **Tooltip**: Componente de tooltip utilizado para fornecer informações adicionais ao usuário.

### Hooks Personalizados
- **usePortfolio**: Hook personalizado para gerenciar o estado do portfólio de investimentos do usuário.
- **useAuth**: Hook personalizado para gerenciar a autenticação do usuário.
- **useTheme**: Hook personalizado para gerenciar o tema da aplicação (claro/escuro).

### Contextos
- **AuthContext**: Contexto para gerenciar o estado de autenticação do usuário.
- **ThemeContext**: Contexto para gerenciar o tema da aplicação.

### Camada de Serviço
- **api.ts**: Arquivo responsável por todas as chamadas de API.
- **firestore.ts**: Arquivo responsável por todas as interações com o Firestore.

### Exemplos de Uso
- **Button**: `<Button variant="primary" size="lg">Clique Aqui</Button>`
- **usePortfolio**: `const { stocks, addStock } = usePortfolio()`
- **AuthContext**: `<AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>`

