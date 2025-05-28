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
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
  },
  webpack: (config) => {
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.beforeRun.tap("CheckFirebaseConfig", (compilation) => {
          const firebaseConfig = nextConfig.publicRuntimeConfig.firebaseConfig;
          if (!firebaseConfig) {
            throw new Error("Configuração do Firebase não pode ser nula");
          }

          const requiredProperties = [
            "apiKey",
            "authDomain",
            "projectId",
            "storageBucket",
            "messagingSenderId",
            "appId",
            "measurementId",
          ];

          requiredProperties.forEach((property) => {
            if (!firebaseConfig[property]) {
              throw new Error(`Propriedade ${property} está faltando na configuração do Firebase`);
            }
          });
        });
      },
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
