// @ts-check

const { readdirSync } = require('fs');
const { resolve } = require('path');

const makeScopeTypesByPath = (path) => {
    const files = readdirSync(resolve(__dirname, path), { withFileTypes: true });
    const directories = files.filter(
        (file) =>
            file.isDirectory() &&
            file.name !== 'node_modules' &&
            file.name !== 'dist' &&
            !file.name.startsWith('.storybook')
    );
    return directories.map((dir) => dir.name);
};

/** @type {import('@commitlint/types').UserConfig} */
const config = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                ...makeScopeTypesByPath(resolve(__dirname, 'apps')),
                ...makeScopeTypesByPath(resolve(__dirname, 'packages')),
                ...makeScopeTypesByPath(resolve(__dirname, 'packages/components')),
                ...makeScopeTypesByPath(resolve(__dirname, 'packages/primitives')),

                // Dependabot scopes
                'deps',
                'deps-dev',

                // others
                'release',
                'schematics',
                'docs'
            ]
        ]
    }
};

module.exports = config;
