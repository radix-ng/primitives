// @ts-check

/** @type {import('prettier').Options} */
const config = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'none',
    htmlWhitespaceSensitivity: 'ignore',
    endOfLine: 'lf',
    plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
    overrides: [
        {
            files: ['*.yml'],
            options: {
                tabWidth: 2
            }
        },
        {
            files: ['*.md', '*.mdx'],
            options: {
                tabWidth: 2
            }
        },
        {
            files: ['*.html'],
            excludeFiles: ['index.html'],
            options: {
                parser: 'angular'
            }
        },
        {
            files: ['index.html'],
            options: {
                parser: 'html'
            }
        },
        {
            files: '*.astro',
            options: {
                parser: 'astro'
            }
        }
    ]
};

module.exports = config;
