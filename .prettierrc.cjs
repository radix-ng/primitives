// @ts-check

/** @type {import('prettier').Options} */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    singleAttributePerLine: true,
    htmlWhitespaceSensitivity: 'ignore',
    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
        'prettier-plugin-tailwindcss',
        // should be last
        'prettier-plugin-multiline-arrays'
    ],
    overrides: [
        {
            files: ['*.yml'],
            options: {
                tabWidth: 2
            }
        },
        {
            files: ['.component.html', '.page.html'],
            options: {
                parser: 'angular'
            }
        },
        {
            files: ['*.html'],
            options: {
                parser: 'html',
                singleQuote: false
            }
        }
    ],
    importOrderParserPlugins: ['typescript', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrder: [
        '<BUILTIN_MODULES>',
        '',
        '^@angular/(.*)$',
        '^rxjs(.*)$',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '^[./]',
        ''
    ]
};

module.exports = config;
