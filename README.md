# EquilibreInvest 

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rosana-rezendes-projects/v0-investir-para-o-futuro)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/QNdp8n2hReh)


**EquilibreInvest** é uma aplicação web projetada para auxiliar no balanceamento de carteiras de investimento em ações. A ideia para este projeto nasceu de uma necessidade pessoal de gerenciar e otimizar meus próprios investimentos de forma mais estratégica e visual.

Além de resolver um desafio pessoal, o desenvolvimento do EquilibreInvest teve um forte componente experimental: o intuito foi explorar e testar as capacidades de uma série de ferramentas e agentes de Inteligência Artificial no ciclo de desenvolvimento de software, desde a concepção da interface até a implementação da lógica de negócios e integração com serviços.

## A Jornada com Inteligências Artificiais e Agentes

Um aspecto fundamental deste projeto foi a utilização extensiva do **Gemini (versão 2.5 Pro) da Google**. Meu foco com o Gemini foi em um processo iterativo de criação e otimização de prompts, visando traduzir os requisitos de negócio e as funcionalidades desejadas em instruções claras e eficazes para as demais IAs e agentes subsequentes, estes sim com a capacidade de gerar código. O Gemini atuou como um "arquiteto de prompts", ajudando a refinar a comunicação com as ferramentas de codificação.

A jornada de desenvolvimento de código assistido por IA seguiu algumas etapas:

1.  **v0.dev:** A prototipagem inicial e a primeira versão da interface foram exploradas com o `v0.dev`. Embora promissor para dar o pontapé inicial no design, o projeto encontrou limitações, seja pela ferramenta não atender precisamente aos requisitos esperados em termos de código ou pelas restrições de uso da versão gratuita.
2.  **Copilot Workspace (Preview):** Em seguida, a exploração continuou com o Copilot Workspace, em sua versão Preview ([https://copilot-workspace.githubnext.com/](https://copilot-workspace.githubnext.com/)). Esta ferramenta, apesar de inovadora, mostrou-se pouco assertiva na geração de soluções robustas para os desafios mais complexos do projeto neste estágio.
3.  **Manus AI:** A experiência com a Manus AI foi particularmente notável. Esta ferramenta surpreendeu positivamente pela sua capacidade de análise de contexto, compreensão do código existente e pela eficácia na resolução de problemas e implementação de novas funcionalidades. A assertividade da Manus AI foi um diferencial importante. Se não fosse pelo modelo de custo, teria sido a ferramenta de escolha para uma utilização mais integral e contínua no desenvolvimento do EquilibreInvest.

## Intervenção Manual

É importante salientar que, embora o objetivo fosse maximizar o uso de IAs para a geração de código, intervenções manuais foram necessárias em momentos pontuais. Esses ajustes ocorreram principalmente para corrigir pequenas inconsistências, integrar as saídas das diferentes ferramentas, ou refinar detalhes específicos da lógica de negócios, especialmente antes da fase de utilização da Manus AI, que demonstrou maior autonomia na compreensão e modificação da base de código existente.

Este projeto é, portanto, um reflexo tanto de uma necessidade prática quanto de uma exploração contínua das fronteiras do desenvolvimento de software assistido por inteligência artificial.

---

## Status do Projeto

**Em Desenvolvimento Ativo.** O projeto está continuamente recebendo novas funcionalidades e melhorias.

---

## Principais Funcionalidades

* **Autenticação Segura:** Login com conta Google (Gmail) via Firebase Authentication.
* **Gerenciamento de Carteira:**
    * Cadastro, visualização, edição e exclusão de ativos (ações).
    * Definição de percentuais meta para cada ativo.
    * Input manual de "Recomendação Própria" ('Comprar', 'Manter', 'Evitar Aporte') para guiar decisões.
* **Calculadora de Balanceamento:**
    * Sugestão de quanto investir em cada ativo para alcançar o balanceamento desejado com novos aportes, considerando as recomendações do usuário.
* **Dashboard Intuitivo:**
    * Painel de resumo com valor total da carteira, total de ativos.
    * Gráficos de composição (percentual atual vs. meta).
    * "Equilibra Insights": Dicas e observações (baseadas em regras) sobre a carteira.
* **Visualização e Organização:**
    * Cards de ativos detalhados.
    * Opções de ordenação para os ativos listados.
* **Lista de Observação (Watchlist):** Acompanhamento de ativos de interesse.
* **Perfil de Usuário:** Configurações básicas e gerenciamento da conta.

---

## Tecnologias Utilizadas

* **Frontend:** React, Next.js 
* **Autenticação:** Firebase Authentication (Google Provider)
* **Banco de Dados:** Firebase Firestore (NoSQL, em nuvem)
* **API de Cotações:** Alpha Vantage
* **Hospedagem/Deploy:** Vercel
* **Linguagem Principal:** JavaScript / TypeScript
* **Ferramentas de IA para Geração/Prototipagem de Código:** v0.dev, Copilot Workspace, Manus AI
* **Otimização de Prompts:** Gemini 2.5 Pro (Google)

---

## Como Rodar Localmente

Para rodar este projeto em seu ambiente local, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/rosanarezende/balanceamento-de-investimentos.git](https://github.com/rosanarezende/balanceamento-de-investimentos.git)
    cd balanceamento-de-investimentos
    ```

2.  **Instale as dependências:**
    (Assumindo que você usa `npm` ou `yarn`)
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure as Variáveis de Ambiente:**
    * Crie um arquivo `.env.local` na raiz do projeto.
    * Você precisará configurar as seguintes variáveis de ambiente:

### Firebase (obrigatórias)
```
NEXT_PUBLIC_FIREBASE_API_KEY=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_valor_aqui
```

### APIs Externas (obrigatórias)
```
ALPHA_VANTAGE_API_KEY=seu_valor_aqui
HF_API_KEY=seu_valor_aqui
```

### Configurações Opcionais
```
NEXT_PUBLIC_OFFLINE_MODE=false  # Defina como 'true' para testes sem dependências externas
```

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    Abra [http://localhost:3000](http://localhost:3000) (ou a porta indicada) no seu navegador para ver a aplicação.

---

## Como Contribuir

Contribuições são muito bem-vindas! Se você tem interesse em ajudar a melhorar o EquilibreInvest, seja com novas funcionalidades, correção de bugs ou otimizações, sinta-se à vontade para:

1.  Abrir uma **Issue** para discutir a mudança que você gostaria de fazer.
2.  Fazer um **Fork** do projeto, criar uma branch para sua feature (`git checkout -b feature/MinhaNovaFeature`) e enviar um **Pull Request**.

Toda ajuda é apreciada, especialmente considerando a natureza experimental e de aprendizado deste projeto.

---

## Licença

Este projeto é disponibilizado sob a **Licença MIT**.

Isso significa que você tem permissão para:
* Usar o software para qualquer propósito (incluindo fins comerciais, embora o intuito original deste projeto seja para estudo e uso não lucrativo).
* Modificar o software para atender às suas necessidades.
* Distribuir cópias do software.
* Distribuir cópias de suas versões modificadas.

A única exigência é que o aviso de copyright e esta permissão de licença sejam incluídos em todas as cópias ou partes substanciais do software.

[Clique aqui para ver o texto completo da Licença MIT](https://opensource.org/licenses/MIT)

