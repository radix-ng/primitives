// @ts-check

const isCI = !!process.env.CI;
const jsFileExtension = ['*.js', '*.cjs', '*.mjs'];

/** @type {import('eslint').Linter.Config} */
const config = {
    root: true,
    env: {
        es2022: true,
        commonjs: true,
        node: true
    },
    plugins: ['file-progress'],
    extends: ['plugin:eslint-comments/recommended'],
    rules: {
        // plugin:file-progress
        'file-progress/activate': isCI ? 0 : 1,
        // plugin:eslint-comments
        'eslint-comments/no-unused-disable': 1
    },
    overrides: [
        {
            files: [...jsFileExtension, '*.ts'],
            parserOptions: {
                sourceType: 'module'
            },
            extends: ['eslint:recommended', 'plugin:promise/recommended'],
            rules: {}
        },
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: __dirname
            },
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@angular-eslint/recommended',
                'plugin:@angular-eslint/template/process-inline-templates',
                'plugin:rxjs/recommended'
            ],
            rules: {
                // plugin:@typescript-eslint
                '@typescript-eslint/no-explicit-any': 0,
                '@typescript-eslint/triple-slash-reference': 0,
                '@typescript-eslint/no-unused-expressions': 0,
                '@typescript-eslint/no-require-imports': 0,
                '@typescript-eslint/no-unused-vars': [
                    1,
                    {
                        argsIgnorePattern: '^_'
                    }
                ],
                '@typescript-eslint/ban-tslint-comment': 1,

                // plugin:@angular-eslint
                '@angular-eslint/component-class-suffix': 0,
                '@angular-eslint/directive-class-suffix': 0,
                '@angular-eslint/no-output-on-prefix': 0,
                '@angular-eslint/no-input-rename': 0,
                '@angular-eslint/no-output-rename': 0,
                '@angular-eslint/no-async-lifecycle-method': 1,
                '@angular-eslint/contextual-decorator': 1,

                // plugin:rxjs
                'rxjs/no-implicit-any-catch': 0,
                'rxjs/no-topromise': 1,
                'rxjs/throw-error': 1
            }
        },
        {
            files: ['*.html'],
            extends: ['plugin:@angular-eslint/template/recommended', 'plugin:@angular-eslint/template/accessibility'],
            rules: {
                // plugin:@angular-eslint/template
                '@angular-eslint/template/label-has-associated-control': 0,
                '@angular-eslint/template/prefer-self-closing-tags': 1,
                '@angular-eslint/template/prefer-control-flow': 0
            }
        },
        {
            files: [...jsFileExtension, '*.ts', '*.html'],
            extends: [
                // should be last
                'plugin:prettier/recommended'
            ]
        }
    ]
};

module.exports = config;
