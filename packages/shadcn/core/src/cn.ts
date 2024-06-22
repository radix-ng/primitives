/**
 * Part of this code is taken from @spartan-ng package ❤️ and shadcn-ui
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
