import type { BoundaryConfig } from 'eslint-plugin-import-boundaries';

export const boundaries: BoundaryConfig[] = [
  {
    identifier: '@assets',
    dir: 'assets',
    alias: '@assets',
  },
  {
    identifier: '@domain',
    dir: 'domain',
    alias: '@domain',
  },
  {
    identifier: '@ports',
    dir: 'ports',
    alias: '@ports',
    allowImportsFrom: ['@domain'],
  },
  {
    identifier: '@utils',
    dir: 'utils',
    alias: '@utils',
    allowImportsFrom: ['@domain', '@ports'],
  },
  {
    identifier: '@application',
    dir: 'application',
    alias: '@application',
    allowImportsFrom: ['@domain', '@ports', '@utils'],
  },
  {
    identifier: '@infrastructure',
    dir: 'infrastructure',
    alias: '@infrastructure',
    allowImportsFrom: ['@domain', '@ports', '@utils'],
  },
  {
    identifier: '@interface',
    dir: 'interface',
    alias: '@interface',
    allowImportsFrom: ['@domain', '@ports', '@utils'],
  },
  {
    identifier: '@composition',
    dir: 'composition',
    alias: '@composition',
    allowImportsFrom: [
      '@domain',
      '@ports',
      '@utils',
      '@application',
      '@infrastructure',
      '@interface',
    ],
  },
];
