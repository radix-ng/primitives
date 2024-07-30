// @ts-check

/** @type {import('stylelint').Config} */
const config = {
    defaultSeverity: 'error',
    allowEmptyInput: true,
    extends: [
        'stylelint-config-recommended-scss',
        // should be last
        'stylelint-prettier/recommended'
    ],
    rules: {
        'rule-empty-line-before': [
            'always-multi-line',
            {
                except: ['first-nested'],
                ignore: ['after-comment']
            }
        ],
        'scss/at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: ['tailwind', 'apply']
            }
        ],
        'no-descending-specificity': null,
        'scss/operator-no-unspaced': null
    }
};

module.exports = config;
