import {
    blackA,
    cyan,
    grass,
    gray,
    grayA,
    green,
    indigo,
    mauve,
    purple,
    red,
    slate,
    teal,
    violet
} from '@radix-ui/colors';
import { type Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config = {
    content: ['./src/**/*.{astro,html,mdx,ts}'],
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
                ...blackA,
                ...gray,
                ...grayA,
                ...mauve,
                ...violet,
                ...green,
                ...red,
                ...grass,
                ...teal,
                ...cyan,
                ...indigo,
                ...purple,
                ...slate,

                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            fontFamily: {
                sans: ['Inter', ...fontFamily.sans]
            },
            screens: {
                phone: '400px'
            }
        }
    },
    plugins: [require('@tailwindcss/typography')]
} satisfies Config;

export default config;
