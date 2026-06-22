module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Allow a capitalized subject (config-conventional forbids sentence/start/pascal/upper case).
        'subject-case': [0]
    }
};
