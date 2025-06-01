/** @type {import('next').NextConfig} */
const nextConfig = {
  // Определяем URL API сервера с возможностью переопределения через переменные окружения
  publicRuntimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*', // Добавляем общий префикс /api для всех запросов к API
      },
      {
        source: '/cars/:path*',
        destination: 'http://localhost:8000/cars/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8000/auth/:path*',
      },
      {
        source: '/favorites/:path*',
        destination: 'http://localhost:8000/favorites/:path*',
      },
      {
        source: '/deals/:path*',
        destination: 'http://localhost:8000/deals/:path*',
      },
      {
        source: '/queries/:path*',
        destination: 'http://localhost:8000/queries/:path*',
      },
      {
        source: '/stores/:path*',
        destination: 'http://localhost:8000/stores/:path*',
      },
      {
        source: '/users/:path*',
        destination: 'http://localhost:8000/users/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:8000/health',
      },
    ];
  },
};

module.exports = nextConfig;