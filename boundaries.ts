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
    identifier: '@application',
    dir: 'application',
    alias: '@application',
    allowImportsFrom: ['@domain', '@ports'],
  },
  {
    identifier: '@infrastructure',
    dir: 'infrastructure',
    alias: '@infrastructure',
    allowImportsFrom: ['@domain', '@ports'],
  },
  {
    identifier: '@interface',
    dir: 'interface',
    alias: '@interface',
    allowImportsFrom: ['@domain', '@ports', '@application'],
  },
  {
    identifier: '@composition',
    dir: 'composition',
    alias: '@composition',
    allowImportsFrom: [
      '@domain',
      '@ports',
      '@application',
      '@infrastructure',
      '@interface',
    ],
  },
];
