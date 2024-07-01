import tailwindTypography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

import { shadcnUIPlugin } from './plugin';

export const shadcnUIPreset = {
    darkMode: ['class'],
    content: [],
    plugins: [shadcnUIPlugin, tailwindTypography]
} satisfies Config;
