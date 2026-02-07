import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.d.ts', 'bin/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
    },
    testTimeout: 30_000,
  },
});
