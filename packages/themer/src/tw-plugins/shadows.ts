import type { Shadows } from '../types';

const none = 'box-shadow: 0 0 #0000;';

const getShadows = (component: string): Shadows => {
    return {
        default: `0 1px 3px 0 theme(colors.gray.950 / var(--${component}-shadow-opacity)), 0 1px 2px -1px theme(colors.gray.950 / var(--${component}-shadow-opacity))`,
        sm: `0 1px 2px 0 theme(colors.gray.950 / var(--${component}-shadow-opacity))`,
        md: `0 4px 6px -1px theme(colors.gray.950 / var(--${component}-shadow-opacity)), 0 2px 4px -2px theme(colors.gray.950 / var(--${component}-shadow-opacity))`,
        lg: `0 10px 15px -3px theme(colors.gray.950 / var(--${component}-shadow-opacity)), 0 4px 6px -4px theme(colors.gray.950 / var(--${component}-shadow-opacity))`,
        xl: `0 20px 25px -5px theme(colors.gray.950 / var(--${component}-shadow-opacity)), 0 10px 10px -6px theme(colors.gray.950 / var(--${component}-shadow-opacity))`,
        '2xl': `0 25px 50px -12px theme(colors.gray.950 / var(--${component}-shadow-opacity))`,
        none: none
    };
};

export default getShadows;
