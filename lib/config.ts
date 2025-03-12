export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Planning Poker',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A real-time planning poker application for agile teams',
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  features: {
    auth: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
    darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
};