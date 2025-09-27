import { create } from 'storybook/theming';

export const brand = {
    brandTitle: 'Radix Angular',
    brandUrl: 'https://github.com/radix-ng/primitives',
    brandTarget: '_blank',
    fontBase: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;",
    fontCode: "'JetBrains Mono', 'Roboto Mono', 'Consolas', 'Menlo', 'Monaco', monospace;"
};

export const light = create({
    ...brand,
    base: 'light'
});

export const dark = create({
    ...brand,
    base: 'dark'
});
