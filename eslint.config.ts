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
            '@angular-eslint/contextual-decorator': 'warn',
            // Angular 22 flipped the default change-detection strategy to OnPush; the upgrade preserves
            // pre-v22 behavior by adding the explicit `ChangeDetectionStrategy.Eager` opt-out (the
            // sanctioned @angular/core:change-detection-eager migration). angular-eslint 22 added this
            // rule to its recommended set, which flags exactly that opt-out — disable it until the
            // library deliberately adopts OnPush component-by-component.
            '@angular-eslint/prefer-on-push-component-change-detection': 'off'
        }
    },
    {
        // Signals-first: discourage lifecycle hooks in primitive source. Use the constructor for
        // DI/host-element setup, effect()/computed()/linkedSignal() for input-driven logic, and
        // inject(DestroyRef).onDestroy() for cleanup. AfterViewInit is intentionally excluded —
        // it needs afterNextRender()/afterRenderEffect(), migrated case by case. Story/demo and
        // test files are not covered (they live outside src/). See AGENTS.md / docs/engineering/patterns.md.
        files: ['packages/primitives/**/src/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'warn',
                {
                    selector: "MethodDefinition[key.name='ngOnInit']",
                    message:
                        'Avoid ngOnInit in signals-first code: use the constructor for DI/host-element setup and effect()/computed() for input()-driven logic. See docs/engineering/patterns.md.'
                },
                {
                    selector: "MethodDefinition[key.name='ngOnChanges']",
                    message:
                        'Avoid ngOnChanges: react to input() signals with effect()/computed()/linkedSignal(). See docs/engineering/patterns.md.'
                },
                {
                    selector: "MethodDefinition[key.name='ngOnDestroy']",
                    message:
                        'Avoid ngOnDestroy: use inject(DestroyRef).onDestroy(() => …) for cleanup. See docs/engineering/patterns.md.'
                }
            ]
        }
    },
    {
        files: ['packages/primitives/**/*.ts', 'apps/**/*.ts', 'apps/parity-testing/**/*.{tsx,mts}'],
        ignores: ['**/__tests__/**', '**/*.spec.ts', '**/*.test.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            regex: '^@radix-ng/primitives/[^/]+/',
                            message:
                                'Import from the public secondary entry point, for example @radix-ng/primitives/core.'
                        },
                        {
                            regex: '^(?:\\.\\./){2,}[^/]+/src(?:/|$)|^(?:\\.\\./)*(?:packages/)?primitives/[^/]+/src(?:/|$)',
                            message: "Use the other primitive's public entry point instead of importing its src files."
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['packages/primitives/**/stories/**/*.ts', 'packages/primitives/recipes/**/*.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "CallExpression[callee.name='Component'] > ObjectExpression > Property:matches([key.name=/^(styles|styleUrls?)$/], [key.value=/^(styles|styleUrls?)$/])",
                    message: 'Use Tailwind utilities and shared demo classes instead of story-local component styles.'
                },
                {
                    selector:
                        "Property:matches([key.name='template'], [key.value='template']) :matches(TemplateElement[value.raw=/<style\\b/i], Literal[value=/<style\\b/i])",
                    message: 'Use Tailwind utilities and shared demo classes instead of a story-local <style> block.'
                },
                {
                    // Angular's inline-template processor handles Component metadata, but not CSF render objects.
                    selector:
                        "Property:matches([key.name='template'], [key.value='template']):not(CallExpression[callee.name='Component'] > ObjectExpression > Property) :matches(TemplateElement[value.raw=/\\sstyle\\s*=/i], Literal[value=/\\sstyle\\s*=/i])",
                    message: 'Use Tailwind utilities and shared demo classes instead of a static story style attribute.'
                }
            ]
        }
    },
    {
        files: ['apps/parity-testing/**/*.tsx', 'apps/parity-testing/**/*.mts'],
        extends: [...tseslint.configs.recommended],
        languageOptions: { globals: { ...globals.node, ...globals.browser } }
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
    {
        files: ['packages/primitives/**/stories/**/*.html', 'packages/primitives/recipes/**/*.html'],
        rules: {
            // Virtualized and positioned demos need computed geometry; static visual styles use utilities.
            '@angular-eslint/template/no-inline-styles': ['error', { allowBindToStyle: true, allowNgStyle: false }]
        }
    },
    ...storybook.configs['flat/recommended'],
    prettierRecommended
]);
