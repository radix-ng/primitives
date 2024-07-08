module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'primitives',
                'shadcn',
                'docs',
                'release',
                'deps',
                'deps-dev',
                'changelog',
                'ci',
                'build'
            ]
        ]
    }
};
