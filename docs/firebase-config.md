# Configuração do Firebase

## Variáveis de Ambiente Necessárias

Para o correto funcionamento da aplicação, é necessário configurar as seguintes variáveis de ambiente:

```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

## Problemas Identificados e Correções

### Problema 1: Storage Bucket Incorreto
O valor padrão para `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` estava configurado como `equilibra-invest.firebasestorage.app`, quando o correto é `equilibra-invest.appspot.com`.

**Correção**: Atualizar o valor para o formato correto do Firebase Storage.

### Problema 2: Validação de Configuração Bloqueante
O arquivo `next.config.mjs` contém uma validação que bloqueia a inicialização da aplicação se alguma variável de ambiente estiver ausente, mas não fornece mensagens de erro claras para o usuário.

**Correção**: Implementar validação mais amigável que exiba mensagens de erro específicas e não bloqueie completamente a inicialização da aplicação.

### Problema 3: Ausência de Fallbacks
Não há valores padrão ou fallbacks para ambientes de desenvolvimento, o que dificulta o trabalho dos desenvolvedores.

**Correção**: Implementar valores de fallback para ambiente de desenvolvimento.

## Implementação da Correção

1. Criar ou atualizar o arquivo `.env.local` com as variáveis corretas
2. Modificar o `next.config.mjs` para melhorar a validação
3. Adicionar mecanismo de fallback para ambiente de desenvolvimento

## Exemplo de Implementação para next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  publicRuntimeConfig: {
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dev-key",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dev.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dev-project",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dev-project.appspot.com",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0000000000",
    },
  },
  webpack: (config) => {
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.beforeRun.tap("CheckFirebaseConfig", (compilation) => {
          const firebaseConfig = nextConfig.publicRuntimeConfig.firebaseConfig;
          const isProd = process.env.NODE_ENV === "production";
          
          // Só validar estritamente em produção
          if (isProd) {
            const requiredProperties = [
              "apiKey",
              "authDomain",
              "projectId",
              "storageBucket",
              "messagingSenderId",
              "appId",
              "measurementId",
            ];

            const missingProps = requiredProperties.filter(prop => !firebaseConfig[prop]);
            
            if (missingProps.length > 0) {
              console.error(`⚠️ Configuração do Firebase incompleta. Propriedades ausentes: ${missingProps.join(", ")}`);
              if (isProd) {
                throw new Error(`Configuração do Firebase incompleta para ambiente de produção`);
              }
            }
          }
        });
      },
    });
    return config;
  },
};

export default nextConfig;
```
