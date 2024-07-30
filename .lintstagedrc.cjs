module.exports = {
    '*.{css,scss,md,yml,json,js,cjs,mjs}': 'prettier --write',
    '*.{css,scss}': 'stylelint --max-warnings=0 --fix'
};
