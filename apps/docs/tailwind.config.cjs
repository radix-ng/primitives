const {createGlobPatternsForDependencies} = require('@nx/angular/tailwind');
const {join} = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(__dirname, 'index.html'),
        join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
        ...createGlobPatternsForDependencies(__dirname),
    ],
    theme:{
        extend: {
            colors: {
                primary: "#000000",
                "blue-gray": {
                    50: "#eceff1",
                    100: "#cfd8dc",
                    200: "#b0bec5",
                    300: "#90a4ae",
                    400: "#78909c",
                    500: "#607d8b",
                    600: "#546e7a",
                    700: "#455a64",
                    800: "#37474f",
                    900: "#263238",
                },
            },
            screens: {
                sm: "540px",
                md: "720px",
                lg: "960px",
                "lg-max": { max: "960px" },
                xl: "1140px",
                "2xl": "1320px",
            },
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
                serif: ["Roboto Slab", "serif"],
                body: ["Roboto", "sans-serif"],
            }
        }
    },
    plugins: [require("tailwindcss"), require("autoprefixer")]
};
