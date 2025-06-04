// Configuração do Mermaid para geração de diagramas
// Usado pelo mermaid-cli para customizar a aparência dos diagramas

const config = {
  // Configurações gerais do diagrama
  theme: 'default',

  // Configurações de flowchart
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
    padding: 30,
    nodeSpacing: 80,
    rankSpacing: 120,
    diagramPadding: 20,
    marginX: 20,
    marginY: 20,
  },

  // Configurações de tema
  themeVariables: {
    // Cores principais
    primaryColor: '#D0E8FF',
    primaryTextColor: '#000000',
    primaryBorderColor: '#3399FF',
    lineColor: '#666666',

    // Cores de fundo para diferentes tipos de nós
    background: '#ffffff',
    secondaryColor: '#DFF7D8',
    tertiaryColor: '#C8F0FF',

    // Configurações de fonte
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',
    fontWeight: '500',

    // Configurações de bordas
    edgeLabelBackground: '#ffffff',
    clusterBkg: '#f9f9f9',
    clusterBorder: '#cccccc',

    // Configurações específicas para flowchart
    cScale0: '#D0E8FF', // UI components
    cScale1: '#DFF7D8', // Services
    cScale2: '#C8F0FF', // APIs
    cScale3: '#FFE8B8', // Data
    cScale4: '#E0E0E0', // External
    cScale5: '#F0E6FF', // Infrastructure

    // Configurações de nós
    nodeBorder: '#333333',
    nodeTextColor: '#000000',
    mainBkg: '#ffffff',

    // Configurações de setas e conexões
    arrowheadColor: '#333333',
    edgeLabelBackground: '#ffffff',
    edgeLabelColor: '#000000',
  },

  // Configurações de segurança
  secure: ['secure', 'securityLevel', 'startOnLoad', 'maxTextSize'],
  securityLevel: 'strict',

  // Configurações de inicialização
  startOnLoad: false,
  maxTextSize: 50000,

  // Configurações de log
  logLevel: 'error',

  // Configurações específicas para diferentes tipos de diagrama
  gantt: {
    useWidth: 1200,
  },

  sequence: {
    useMaxWidth: true,
    rightAngles: false,
    showSequenceNumbers: true,
  },

  class: {
    useMaxWidth: true,
  },
}

// Exportar configuração para uso com mermaid-cli
module.exports = config
