const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Путь к вашему Next.js приложению для загрузки next.config.js и .env файлов
  dir: './'
})

// Пользовательский конфигурационный объект Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],
  moduleNameMapper: {
    // Разрешение алиасов Next.js
    '^@/(.*)$': '<rootDir>/src/$1',
    // Обработка CSS модулей
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
  }
}

// createJestConfig возвращает объединенный next/jest конфиг
module.exports = createJestConfig(customJestConfig)