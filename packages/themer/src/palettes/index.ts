import colors from 'tailwindcss/colors';
import { grays } from './grays';

export const palettes = {
    trust: {
        primary: colors.blue,
        secondary: colors.purple,
        accent: colors.lime,
        gray: grays.slate
    }
};

export { grays } from './grays';

export { type Palette } from '../types';
