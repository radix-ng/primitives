import { cpSync, mkdirSync } from 'fs';

mkdirSync('apps/radix-docs/node_modules/@radix-ng/primitives', { recursive: true });
mkdirSync('apps/radix-docs/node_modules/@radix-ng/components', { recursive: true });

cpSync('dist/primitives', 'apps/radix-docs/node_modules/@radix-ng/primitives', { recursive: true });
cpSync('dist/components', 'apps/radix-docs/node_modules/@radix-ng/components', { recursive: true });
