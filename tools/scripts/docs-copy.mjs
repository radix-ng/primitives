import { cpSync, mkdirSync } from 'fs';

mkdirSync('apps/radix-docs/node_modules/@radix-ng/primitives', { recursive: true });

cpSync('dist/primitives', 'apps/radix-docs/node_modules/@radix-ng/primitives', { recursive: true });
