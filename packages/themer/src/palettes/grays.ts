import colors from 'tailwindcss/colors';

/**
 * Tailwindcss default grays colors plus `greenish`, `indigray` and `cyanish`.
 */
export const grays = {
    greenish: {
        '50': '#F3F8FA',
        '100': '#EEEFF2',
        '200': '#E4EBF2',
        '300': '#C1D0D5',
        '400': '#99A8AF',
        '500': '#6E7D84',
        '600': '#4E5D64',
        '700': '#384850',
        '800': '#212C34',
        '900': '#10161B',
        '925': '#0b1014',
        '950': '#020304'
    },
    indigray: {
        '50': '#FAFAFE',
        '100': '#F5F5F9',
        '200': '#E7E7F0',
        '300': '#D6D6E1',
        '400': '#A8A8B8',
        '500': '#6E6E81',
        '600': '#4D4D5F',
        '700': '#3A3A4B',
        '800': '#1F1F31',
        '900': '#121220',
        '925': '#090915',
        '950': '#02020D'
    },
    cyanish: {
        '50': '#F8F9FC',
        '100': '#E1F5FF',
        '200': '#E2EBF5',
        '300': '#CBDAEE',
        '400': '#94A3B8',
        '500': '#647E95',
        '600': '#475569',
        '700': '#334B5F',
        '800': '#14293B',
        '900': '#05172A',
        '925': '#020e1c',
        '950': '#000414'
    },
    gray: {
        ...colors.gray,
        925: '#0b0f1c'
    },
    slate: {
        ...colors.slate,
        925: '#090e1f'
    },
    zinc: {
        ...colors.zinc,
        925: '#101012'
    },
    neutral: {
        ...colors.neutral,
        925: '#111111'
    },
    stone: {
        ...colors.stone,
        925: '#131210'
    }
};
