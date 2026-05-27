module.exports = {
    '*': 'prettier --write --ignore-unknown',
    '*.{css,scss}': 'stylelint --max-warnings=0 --fix',
    '*.{js,cjs,mjs,ts,html}': 'eslint --max-warnings=0 --fix'
};
