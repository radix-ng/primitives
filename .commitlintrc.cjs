module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "release",
                "build",
                "chore",
                "ci",
                "docs",
                "feat",
                "fix",
                "perf",
                "refactor",
                "revert",
                "style",
                "test",
            ],
        ],
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
                'build',
                'theme'
            ]
        ]
    }
};
