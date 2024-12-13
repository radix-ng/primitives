import {
    blackA,
    crimson,
    cyan,
    gold,
    grass,
    gray,
    grayA,
    green,
    indigo,
    mauve,
    pink,
    purple,
    red,
    slate,
    teal,
    tomato,
    violet
} from '@radix-ui/colors';
import { type Config } from 'tailwindcss';

import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
    content: ['./src/**/*.{astro,html,mdx,ts}'],
    darkMode: 'selector',
    theme: {
        container: {
            center: true,
            padding: '2rem',

            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
                sans: ['Inter Variable', ...defaultTheme.fontFamily.sans]
            },
            screens: {
                phone: '400px'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                ...blackA,
                ...crimson,
                ...tomato,
                ...gold,
                ...gray,
                ...grayA,
                ...mauve,
                ...violet,
                ...green,
                ...red,
                ...grass,
                ...teal,
                ...cyan,
                ...pink,
                ...indigo,
                ...purple,
                ...slate,

                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                'primitive-demo': 'var(--bg-primitive-demo)',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                }
            }
        }
    },
    plugins: [require('@tailwindcss/typography')]
} satisfies Config;

export default config;
