/**
 * Part of this code is taken from @spartan-ng package ❤️
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge as TailwindMerge } from 'tailwind-merge';

export function twMerge(...inputs: ClassValue[]) {
    return TailwindMerge(clsx(inputs));
}
