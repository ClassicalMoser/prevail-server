import type { BoundaryConfig } from 'eslint-plugin-import-boundaries';

export const boundaries: BoundaryConfig[] = [
  {
    identifier: '@assets',
    dir: 'assets',
    alias: '@assets',
  },
  {
    identifier: '@interface',
    dir: 'interface',
    alias: '@interface',
    allowImportsFrom: ['@application', '@composition', '@domain', '@assets'],
  },
  {
    identifier: '@composition',
    dir: 'composition',
    alias: '@composition',
    allowImportsFrom: ['@application', '@domain', '@infrastructure'],
  },
  {
    identifier: '@application',
    dir: 'application',
    alias: '@application',
    allowImportsFrom: ['@domain', '@infrastructure'],
  },
  {
    identifier: '@domain',
    dir: 'domain',
    alias: '@domain',
  },
  {
    identifier: '@infrastructure',
    dir: 'infrastructure',
    alias: '@infrastructure',
    allowImportsFrom: ['@domain'],
  },
];
