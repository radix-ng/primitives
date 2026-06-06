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
        // Signals-first: discourage lifecycle hooks in primitive source. Use the constructor for
        // DI/host-element setup, effect()/computed()/linkedSignal() for input-driven logic, and
        // inject(DestroyRef).onDestroy() for cleanup. AfterViewInit is intentionally excluded —
        // it needs afterNextRender()/afterRenderEffect(), migrated case by case. Story/demo and
        // test files are not covered (they live outside src/). See CLAUDE.md / patterns.md.
        files: ['packages/primitives/**/src/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'warn',
                {
                    selector: "MethodDefinition[key.name='ngOnInit']",
                    message:
                        'Avoid ngOnInit in signals-first code: use the constructor for DI/host-element setup and effect()/computed() for input()-driven logic. See CLAUDE.md.'
                },
                {
                    selector: "MethodDefinition[key.name='ngOnChanges']",
                    message:
                        'Avoid ngOnChanges: react to input() signals with effect()/computed()/linkedSignal(). See CLAUDE.md.'
                },
                {
                    selector: "MethodDefinition[key.name='ngOnDestroy']",
                    message: 'Avoid ngOnDestroy: use inject(DestroyRef).onDestroy(() => …) for cleanup. See CLAUDE.md.'
                }
            ]
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
