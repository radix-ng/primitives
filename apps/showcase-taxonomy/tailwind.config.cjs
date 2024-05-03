const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const plugin = require("tailwindcss/plugin");
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(__dirname, 'index.html'),
        join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html,analog}'),
        ...createGlobPatternsForDependencies(__dirname)
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["Inter", ...fontFamily.sans],
                heading: ["CalSans-SemiBold", ...fontFamily.sans],
            },
        },
    },
    plugins: [require('tailwindcss'), require("@tailwindcss/typography"), require('autoprefixer'), plugin(function ({ addBase, theme }) {
        addBase({
            "@font-face": {
                fontFamily: "Inter",
                fontStyle: "normal",
                fontWeight: 400,
                src: "url(/assets/fonts/Inter-Regular.ttf)",
            }
        });

        addBase({
            "@font-face": {
                fontFamily: "Inter Bold",
                fontStyle: "normal",
                fontWeight: 600,
                src: "url(/assets/fonts/Inter-Bold.ttf)",
            }
        });

        addBase({
            "@font-face": {
                fontFamily: "CalSans-SemiBold",
                fontStyle: "normal",
                fontWeight: 600,
                src: "url(/assets/fonts/CalSans-SemiBold.ttf)",
            }
        });
    })]
};
