import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@domain': path.join(root, 'src/domain'),
      '@domain/*': path.join(root, 'src/domain/*'),
      '@interface': path.join(root, 'src/interface'),
      '@interface/*': path.join(root, 'src/interface/*'),
      '@application': path.join(root, 'src/application'),
      '@application/*': path.join(root, 'src/application/*'),
      '@infrastructure': path.join(root, 'src/infrastructure'),
      '@infrastructure/*': path.join(root, 'src/infrastructure/*'),
      '@testing': path.join(root, 'src/testing'),
      '@testing/*': path.join(root, 'src/testing/*'),
    },
  },
});
