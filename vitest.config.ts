import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DB_CONNECTION_STRING: 'postgres://test:test@localhost:5432/test',
      AUTH0_DOMAIN: 'test.auth0.com',
      AUTH0_AUDIENCE: 'https://api.test',
    },
  },
  resolve: {
    alias: {
      '@domain': path.join(root, 'src/domain'),
      '@domain/*': path.join(root, 'src/domain/*'),
      '@ports': path.join(root, 'src/ports'),
      '@ports/*': path.join(root, 'src/ports/*'),
      '@utils': path.join(root, 'src/utils'),
      '@utils/*': path.join(root, 'src/utils/*'),
      '@interface': path.join(root, 'src/interface'),
      '@interface/*': path.join(root, 'src/interface/*'),
      '@application': path.join(root, 'src/application'),
      '@application/*': path.join(root, 'src/application/*'),
      '@infrastructure': path.join(root, 'src/infrastructure'),
      '@infrastructure/*': path.join(root, 'src/infrastructure/*'),
      '@composition': path.join(root, 'src/composition'),
      '@composition/*': path.join(root, 'src/composition/*'),
      '@testing': path.join(root, 'src/testing'),
      '@testing/*': path.join(root, 'src/testing/*'),
    },
  },
});
