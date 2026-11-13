module.exports = {
    '*': 'prettier --check --ignore-unknown',
    '*.{css,scss}': 'stylelint --max-warnings=0',
    '*.{js,cjs,mjs,ts,html}': 'eslint --max-warnings=0 --no-warn-ignored'
};
