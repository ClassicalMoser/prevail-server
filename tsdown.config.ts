import type { UserConfig } from 'tsdown';

const config: UserConfig = {
  clean: true,
  entry: ['main.ts'],
  format: ['esm'],
  outDir: 'dist',
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.js',
  }),
  sourcemap: false,
  unbundle: false,
};

export default config;
