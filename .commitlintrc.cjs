// @ts-check

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'release',
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'style',
                'test'
            ]
        ],
        'scope-enum': [
            2,
            'always',
            [
                'primitives',
                'accordion',
                'alert-dialog',
                'aspect-ratio',
                'avatar',
                'card',
                'collapsible',
                'context-menu',
                'dropdown-menu',
                'dialog',
                'radio',
                'radio-group',
                'toggle',
                'toggle-group',
                'code',
                'separator',
                'kbd',
                'radix-docs',
                'radix-ssr-testing',
                'showcase-taxonomy',
                'progress',
                'shadcn',
                'switch',
                'docs',
                'release',
                'deps',
                'deps-dev',
                'changelog',
                'ci',
                'build',
                'theme',
                'themer'
            ]
        ]
    }
};

module.exports = config;
