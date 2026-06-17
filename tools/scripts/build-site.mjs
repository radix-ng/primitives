import { existsSync } from 'node:fs';
import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const siteDist = join(root, 'dist/radix-site');
const playgroundDist = join(root, 'dist/apps/radix-playground');
const playgroundBrowserDist = join(playgroundDist, 'browser');
const storybookDist = join(root, 'dist/radix-storybook');
const storybookPublic = join(root, 'apps/radix-storybook/public');

const playgroundSource = existsSync(playgroundBrowserDist) ? playgroundBrowserDist : playgroundDist;

if (!existsSync(playgroundSource)) {
    throw new Error(`Playground build output not found: ${playgroundSource}`);
}

if (!existsSync(storybookDist)) {
    throw new Error(`Storybook build output not found: ${storybookDist}`);
}

await rm(siteDist, { recursive: true, force: true });
await mkdir(siteDist, { recursive: true });

await cp(playgroundSource, siteDist, { recursive: true });
await cp(storybookDist, join(siteDist, 'docs'), { recursive: true });

if (existsSync(storybookPublic)) {
    await cp(storybookPublic, siteDist, { recursive: true, force: true });
}

const spaRoutes = [
    'playground',
    'playground/accordion',
    'playground/checkbox',
    'playground/dialog',
    'playground/popover',
    'playground/select',
    'playground/slider',
    'playground/switch',
    'playground/tabs'
];

await Promise.all(
    spaRoutes.map(async (route) => {
        const routeDir = join(siteDist, route);
        await mkdir(routeDir, { recursive: true });
        await copyFile(join(siteDist, 'index.html'), join(routeDir, 'index.html'));
    })
);

console.log(`Composed site at ${siteDist}`);
