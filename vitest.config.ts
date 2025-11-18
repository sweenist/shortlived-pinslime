import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['tsconfig.test.json'] })],
  base: './',
  test: {
    include: [
      'tests/**/*.spec.ts'
    ],
    exclude: [
      'node_modules',
      'dist'
    ],
    typecheck: {
      tsconfig: 'tsconfig.test.json'
    },
    environment: 'jsdom',
    coverage: {
      exclude: [
        'src/levels/**',
        'src/*.ts',
        'vite*.ts',
        '**/*.d.ts'
      ]
    }
  },
});