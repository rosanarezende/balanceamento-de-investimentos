# Configuração de Qualidade dos Diagramas Mermaid

## 📋 Resumo

Este documento detalha como a qualidade dos diagramas Mermaid foi configurada para gerar imagens de alta resolução e com cores personalizadas.

## ✅ Solução Implementada

### 1. **Arquivos de Configuração**

#### `docs/mermaid-cli.json`
```json
{
  "theme": "default",
  "width": 1920,
  "height": 1080,
  "backgroundColor": "#FFFFFF",
  "scale": 3,
  "outputFormat": "png",
  "quiet": false,
  "puppeteerConfig": {
    "headless": "new",
    "args": [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  },
  "flowchart": {
    "useMaxWidth": true,
    "htmlLabels": true,
    "curve": "basis",
    "padding": 25,
    "nodeSpacing": 75,
    "rankSpacing": 100
  },
  "themeVariables": {
    // Cores personalizadas para cada tipo de componente
    "uiFill": "#D0E8FF",
    "uiStroke": "#3399FF",
    "serviceFill": "#DFF7D8",
    "serviceStroke": "#28A745",
    // ... outras configurações de cor
  }
}
```

### 2. **Scripts do Package.json**

```json
{
  "scripts": {
    "generate-diagram": "npx mmdc -i ./docs/arquitetura.mmd -o ./docs/arquitetura.png -c ./docs/mermaid-cli.json -s 3 -w 1920 -H 1080 && echo \"Gerado: ./docs/arquitetura.png\"",
    "generate-diagram:svg": "npx mmdc -i ./docs/arquitetura.mmd -o ./docs/arquitetura.svg -c ./docs/mermaid-cli.json -s 3 -w 1920 -H 1080 && echo \"Gerado: ./docs/arquitetura.svg\"",
    "generate-diagram:both": "npm run _archive-current-diagrams && npm run generate-diagram && npm run generate-diagram:svg"
  }
}
```

## 📊 Resultados Obtidos

### Antes (Baixa Qualidade)
- **Resolução**: ~800x600 pixels
- **Escala**: 1x (padrão)
- **Tamanho do arquivo**: ~40KB
- **Qualidade**: Pixelizada quando ampliada

### Depois (Alta Qualidade)
- **Resolução**: 5712x3009 pixels
- **Escala**: 3x (tripla resolução)
- **Dimensões base**: 1920x1080 pixels
- **Tamanho do arquivo**: ~575KB
- **Qualidade**: Nítida em qualquer ampliação

## 🔧 Como Funciona

### 1. **Parâmetros de Linha de Comando**
- `-s 3`: Define escala 3x para aumentar a resolução
- `-w 1920`: Define largura base de 1920 pixels
- `-H 1080`: Define altura base de 1080 pixels
- `-c ./docs/mermaid-cli.json`: Aplica configurações de tema e cores

### 2. **Configurações de Tema**
O arquivo `mermaid-cli.json` define:
- **Cores personalizadas** para cada tipo de componente
- **Espaçamento** entre elementos do diagrama
- **Tipografia** e estilos visuais
- **Configurações do Puppeteer** para renderização

### 3. **Arquivamento Automático**
O script `_archive-current-diagrams` move versões anteriores para `docs/arquivo/` com timestamp antes de gerar novas versões.

## 🚀 Como Usar

### Gerar apenas PNG:
```bash
npm run generate-diagram
```

### Gerar apenas SVG:
```bash
npm run generate-diagram:svg
```

### Gerar ambos (com arquivamento):
```bash
npm run generate-diagram:both
```

## 📁 Estrutura de Arquivos

```
docs/
├── arquitetura.mmd          # Código-fonte do diagrama
├── arquitetura.png          # Imagem PNG de alta qualidade
├── arquitetura.svg          # Imagem SVG vetorial
├── mermaid-cli.json         # Configurações de tema e qualidade
└── arquivo/                 # Versões arquivadas com timestamp
    ├── arquitetura_20250604-150138.png
    ├── arquitetura_20250604-150138.svg
    └── ...
```

## 🎨 Cores Personalizadas

O diagrama usa um esquema de cores consistente:

| Componente | Cor de Fundo | Cor da Borda | Descrição |
|------------|--------------|--------------|-----------|
| UI Components | #D0E8FF | #3399FF | Azul claro para interface |
| Services | #DFF7D8 | #28A745 | Verde para serviços |
| APIs | #C8F0FF | #0CA2DB | Azul água para APIs |
| Data | #FFE8B8 | #E09F3E | Amarelo para dados |
| External | #E0E0E0 | #A0A0A0 | Cinza para externos |
| Infrastructure | #F0E6FF | #8C41FF | Roxo para infraestrutura |

## ✅ Validação

Para verificar se a configuração está funcionando:

1. Execute: `npm run generate-diagram`
2. Verifique as dimensões: `file docs/arquitetura.png`
3. Resultado esperado: `PNG image data, 5712 x 3009, 8-bit/color RGB`

## 🔍 Troubleshooting

### Problema: Comando `mmdc` não encontrado
**Solução**: Use `npx mmdc` em vez de `mmdc` diretamente

### Problema: Configurações não são aplicadas
**Solução**: Verifique se o arquivo `mermaid-cli.json` tem sintaxe JSON válida

### Problema: Imagem com baixa qualidade
**Solução**: Confirme que o parâmetro `-s 3` está sendo usado nos scripts

---

**Status**: ✅ **COMPLETO** - Qualidade de imagem configurada e funcionando perfeitamente.
