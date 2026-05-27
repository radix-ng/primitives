import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import angularEslint from 'angular-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import storybook from 'eslint-plugin-storybook';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

export default defineConfig([
    includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
    { ignores: ['**/index.html'] },
    {
        files: ['**/*.{js,cjs,mjs,ts}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.es2022,
                ...globals.node
            }
        },
        plugins: {
            '@eslint-community/eslint-comments': eslintComments
        },
        rules: {
            ...js.configs.recommended.rules,
            ...eslintComments.configs.recommended.rules,
            '@eslint-community/eslint-comments/no-unused-disable': 'warn'
        }
    },
    {
        files: ['**/*.ts'],
        extends: [...tseslint.configs.recommended, ...angularEslint.configs.tsRecommended],
        processor: angularEslint.processInlineTemplates,
        rules: {
            // plugin:@typescript-eslint
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/ban-tslint-comment': 'warn',

            // plugin:@angular-eslint
            '@angular-eslint/component-class-suffix': 'off',
            '@angular-eslint/directive-class-suffix': 'off',
            '@angular-eslint/no-output-on-prefix': 'off',
            '@angular-eslint/no-input-rename': 'off',
            '@angular-eslint/no-output-rename': 'off',
            '@angular-eslint/no-async-lifecycle-method': 'warn',
            '@angular-eslint/contextual-decorator': 'warn'
        }
    },
    {
        files: ['**/*.html'],
        extends: [...angularEslint.configs.templateRecommended, ...angularEslint.configs.templateAccessibility],
        rules: {
            // plugin:@angular-eslint/template
            '@angular-eslint/template/label-has-associated-control': 'off',
            '@angular-eslint/template/prefer-self-closing-tags': 'warn',
            '@angular-eslint/template/prefer-control-flow': 'off'
        }
    },
    ...storybook.configs['flat/recommended'],
    prettierRecommended
]);
