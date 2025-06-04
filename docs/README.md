# 📋 Documentação do EquilibreInvest

Esta pasta contém toda a documentação técnica e organizacional do projeto EquilibreInvest, organizada de forma hierárquica para facilitar a navegação e manutenção.

## 📑 Sumário

- [🗂️ Estrutura da Documentação](#%EF%B8%8F-estrutura-da-documentação)
- [🚀 Início Rápido](#-início-rápido)
- [🔄 Geração de Diagramas](#-geração-de-diagramas)
- [📋 Controle de Versão](#-controle-de-versão)
- [🤝 Como Contribuir](#-como-contribuir)

---

## 🗂️ Estrutura da Documentação

<details>
<summary><strong>📁 technical/ - Documentação Técnica</strong></summary>

### Guias de Desenvolvimento e Configuração

| Arquivo | Descrição | Uso Principal |
|---------|-----------|---------------|
| [`DEVELOPMENT_MODE.md`](./technical/DEVELOPMENT_MODE.md) | Guia completo do modo de desenvolvimento offline | Desenvolvedores iniciantes |

**Quando usar esta seção:**
- 🔧 Configuração do ambiente de desenvolvimento
- 💻 Debug e troubleshooting
- ⚙️ Implementação de novas funcionalidades técnicas

</details>

<details>
<summary><strong>📁 config/ - Configurações e Ferramentas</strong></summary>

### Arquivos de Configuração do Projeto

| Arquivo | Descrição | Tecnologia |
|---------|-----------|------------|
| [`MERMAID_QUALITY_CONFIG.md`](./config/MERMAID_QUALITY_CONFIG.md) | Configuração de qualidade para diagramas Mermaid | Mermaid CLI |
| [`mermaid-cli.json`](./mermaid-cli.json) | Arquivo de configuração do Mermaid CLI | Mermaid |

**Quando usar esta seção:**
- 🎨 Personalização de diagramas
- 🔧 Configuração de ferramentas de documentação
- 📊 Geração automatizada de assets visuais

</details>

<details>
<summary><strong>📁 general/ - Documentação Geral</strong></summary>

### Visão Geral e Compilados do Projeto

| Arquivo | Descrição | Audiência |
|---------|-----------|-----------|
| [`COMPILADO_PROJETO.md`](./general/COMPILADO_PROJETO.md) | Compilado completo do projeto com arquitetura e melhorias | Todos os stakeholders |

**Quando usar esta seção:**
- 📖 Entendimento geral do projeto
- 🎯 Planejamento e roadmap
- 🤝 Onboarding de novos colaboradores

</details>

<details>
<summary><strong>📊 Diagramas e Assets Visuais</strong></summary>

### Recursos Visuais da Arquitetura

| Tipo | Arquivo | Formato | Uso Recomendado |
|------|---------|---------|-----------------|
| **Código** | [`arquitetura.mmd`](./arquitetura.mmd) | Mermaid | Edição e versionamento |
| **Imagem** | [`arquitetura.png`](./arquitetura.png) | PNG | Documentação e apresentações |
| **Vetor** | [`arquitetura.svg`](./arquitetura.svg) | SVG | Web e escalabilidade |

**Versionamento:**
- 📂 [`arquivo/`](./arquivo/) - Versões históricas com timestamp

</details>

---

## 🚀 Início Rápido

<details>
<summary><strong>👨‍💻 Para Desenvolvedores</strong></summary>

### Configuração do Ambiente

1. **Primeiro acesso**: [`technical/DEVELOPMENT_MODE.md`](./technical/DEVELOPMENT_MODE.md)
2. **Configurar diagramas**: [`config/MERMAID_QUALITY_CONFIG.md`](./config/MERMAID_QUALITY_CONFIG.md)
3. **Entender arquitetura**: [`general/COMPILADO_PROJETO.md`](./general/COMPILADO_PROJETO.md)

### Comandos Essenciais
```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Gerar documentação visual
npm run generate-diagram
```

</details>

<details>
<summary><strong>🤝 Para Contribuidores</strong></summary>

### Fluxo de Contribuição

1. **Visão geral**: [`general/COMPILADO_PROJETO.md`](./general/COMPILADO_PROJETO.md)
2. **Setup técnico**: [`technical/DEVELOPMENT_MODE.md`](./technical/DEVELOPMENT_MODE.md)
3. **Padrões visuais**: [`config/MERMAID_QUALITY_CONFIG.md`](./config/MERMAID_QUALITY_CONFIG.md)

### Antes de Contribuir
- 📋 Leia o compilado do projeto
- 🔧 Configure o ambiente de desenvolvimento
- 📊 Entenda a arquitetura visual

</details>

<details>
<summary><strong>🎨 Para Designers e Documentadores</strong></summary>

### Recursos Visuais

- **Diagramas**: Utilize [`arquitetura.svg`](./arquitetura.svg) para escalabilidade
- **Apresentações**: Use [`arquitetura.png`](./arquitetura.png) em alta qualidade
- **Edição**: Modifique [`arquitetura.mmd`](./arquitetura.mmd) e regenere

### Configuração Visual
Consulte [`config/MERMAID_QUALITY_CONFIG.md`](./config/MERMAID_QUALITY_CONFIG.md) para personalização.

</details>

---

## 🔄 Geração de Diagramas

<details>
<summary><strong>🛠️ Comandos Disponíveis</strong></summary>

### Scripts NPM para Diagramas

```bash
# Gerar todos os formatos (PNG + SVG)
npm run generate-diagram

# Gerar apenas PNG (padrão para docs)
npm run generate-diagram:png

# Gerar apenas SVG (padrão para web)
npm run generate-diagram:svg
```

### Configuração de Qualidade

A qualidade e estilo dos diagramas são controlados por:
- [`mermaid-cli.json`](./mermaid-cli.json) - Configuração principal
- [`config/MERMAID_QUALITY_CONFIG.md`](./config/MERMAID_QUALITY_CONFIG.md) - Documentação detalhada

</details>

---

## 📋 Controle de Versão

<details>
<summary><strong>📊 Histórico de Mudanças</strong></summary>

### Documentos de Controle

| Documento | Propósito | Última Atualização |
|-----------|-----------|-------------------|
| [`REORGANIZATION_SUMMARY.md`](./REORGANIZATION_SUMMARY.md) | Sumário da reorganização da documentação | 2024 |
| [`README_UPDATE_SUMMARY.md`](./README_UPDATE_SUMMARY.md) | Histórico de atualizações do README principal | 2024 |

### Versionamento de Diagramas

- **Atual**: Arquivos na raiz de [`docs/`](.)
- **Histórico**: Arquivos em [`arquivo/`](./arquivo/) com timestamp
- **Formato**: `arquitetura_YYYYMMDD_HHMMSS.{png,svg}`

</details>

---

## 🤝 Como Contribuir

<details>
<summary><strong>📝 Diretrizes de Contribuição para Documentação</strong></summary>

### 1. Estrutura de Arquivos
- **Técnico**: `technical/` para guias de desenvolvimento
- **Configuração**: `config/` para setup de ferramentas  
- **Geral**: `general/` para visão geral e compilados

### 2. Padrões de Nomenclatura
- **Arquivos**: `SCREAMING_SNAKE_CASE.md`
- **Diagramas**: `nome-descritivo.{mmd,png,svg}`
- **Versionamento**: `arquivo_YYYYMMDD_HHMMSS.ext`

### 3. Qualidade da Documentação
- ✅ Sumário com links internos
- ✅ Accordions para seções longas
- ✅ Tabelas para informações estruturadas
- ✅ Emojis para melhor navegação visual

### 4. Workflow de Atualização
1. Editar arquivo fonte (`.mmd` para diagramas)
2. Executar script de geração se aplicável
3. Atualizar links e referências
4. Testar navegação local
5. Commit com mensagem descritiva

</details>

---

<div align="center">

**📋 Documentação em Evolução**

Esta documentação está em constante melhoria. Para sugestões, correções ou novas ideias, [abra uma issue](../../issues/new) no repositório.

---

*Última atualização: 2024 | Versão: 2.0 com navegação aprimorada*

</div>
