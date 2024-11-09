/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [],
    theme: {
        extend: {}
    },
    plugins: [require('prettier-plugin-tailwindcss')],
    tailwindFunctions: ['tv']
};
