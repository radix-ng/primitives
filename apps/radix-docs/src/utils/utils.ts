import { computed, effect, signal } from '@angular/core';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useMediaQuery(query: string) {
    const matches = signal<boolean>(false);

    const mediaQueryList = matchMedia(query);

    const updateMatches = (event: MediaQueryListEvent) => {
        matches.set(event.matches);
    };

    matches.set(mediaQueryList.matches);

    mediaQueryList.addEventListener('change', updateMatches);

    effect(() => {
        return () => {
            mediaQueryList.removeEventListener('change', updateMatches);
        };
    });

    return matches;
}

export function useIsMobile() {
    const isMobileQuery = useMediaQuery('(pointer:coarse)');
    const maxWidthQuery = useMediaQuery('(max-width: 1024px)');

    const isMobile = computed(() => {
        return isMobileQuery() && maxWidthQuery();
    });

    return isMobile;
}
