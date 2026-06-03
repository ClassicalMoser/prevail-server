import path from 'node:path';
import oxlint from './oxlint.config';
import oxfmt from './oxfmt.config';
import { defineConfig } from 'vite-plus';

const rootDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      '@domain': path.join(rootDir, 'domain'),
      '@domain/*': path.join(rootDir, 'domain/*'),
      '@interface': path.join(rootDir, 'interface'),
      '@interface/*': path.join(rootDir, 'interface/*'),
      '@application': path.join(rootDir, 'application'),
      '@application/*': path.join(rootDir, 'application/*'),
      '@infrastructure': path.join(rootDir, 'infrastructure'),
      '@infrastructure/*': path.join(rootDir, 'infrastructure/*'),
    },
  },
  fmt: oxfmt,
  lint: oxlint,
});
