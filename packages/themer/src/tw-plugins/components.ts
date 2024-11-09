import plugin from 'tailwindcss/plugin';
import getShadows from './shadows';

export const components = plugin(({ addBase, theme, addComponents, matchUtilities }) => {
    addBase({
        ':root': {
            '--card-padding': theme('spacing[6]'),

            '--display-text-color': 'theme("colors.gray.950")',
            '--title-text-color': 'var(--display-text-color)',
            '--caption-text-color': 'theme("colors.gray.500")',
            '--body-text-color': 'theme("colors.gray.700")',
            '--placeholder-text-color': 'theme("colors.gray.400")',

            "@apply dark:[--body-text-color:theme(colors.gray.300)] dark:[--title-text-color:theme('colors.white')] dark:[--display-text-color:theme('colors.white')] dark:[--placeholder-text-color:theme('colors.gray.600')]":
                {}
        }
    });
    addComponents({
        '.card-shadow': {
            boxShadow: getShadows('card').md
        },

        //typography components
        '.text-display': {
            color: 'var(--display-text-color)'
        },
        '.text-title': {
            color: 'var(--title-text-color)'
        },
        '.text-caption': {
            color: 'var(--caption-text-color)'
        },
        '.text-body': {
            color: 'var(--body-text-color)'
        },
        '.text-placeholder': {
            color: 'var(--placeholder-text-color)'
        },

        //radius components
        '.rounded-card': {
            borderRadius: 'var(--card-radius)'
        },

        '.rounded-btn': {
            borderRadius: 'var(--btn-radius)'
        }
    });
    matchUtilities({
        perspective: (value) => ({
            perspective: value
        })
    });
}, {});
