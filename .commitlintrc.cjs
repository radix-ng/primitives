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
                'avatar',
                'collapsible',
                'context-menu',
                'dropdown-menu',
                'dialog',
                'radio',
                'radio-group',
                'code',
                'kbd',
                'radix-docs',
                'shadcn',
                'docs',
                'release',
                'deps',
                'deps-dev',
                'changelog',
                'ci',
                'build',
                'theme'
            ]
        ]
    }
};

module.exports = config;
