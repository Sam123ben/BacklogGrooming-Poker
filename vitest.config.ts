import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.config.ts',
        'vitest.setup.ts',
        'playwright.config.ts',
        'tailwind.config.ts',
        'next.config.js',
        'postcss.config.js',
      ],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
});