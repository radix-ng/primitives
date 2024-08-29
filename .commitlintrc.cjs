module.exports = {
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
                'collapsible',
                'code',
                'kbq',
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
