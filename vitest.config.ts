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
      '@domain': path.join(root, 'domain'),
      '@domain/*': path.join(root, 'domain/*'),
      '@interface': path.join(root, 'interface'),
      '@interface/*': path.join(root, 'interface/*'),
      '@application': path.join(root, 'application'),
      '@application/*': path.join(root, 'application/*'),
      '@infrastructure': path.join(root, 'infrastructure'),
      '@infrastructure/*': path.join(root, 'infrastructure/*'),
      '@testing': path.join(root, 'testing'),
      '@testing/*': path.join(root, 'testing/*'),
    },
  },
});
