import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-playground-mascot-avatar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <svg
            class="size-full drop-shadow-lg transition-transform group-hover:-translate-y-0.5"
            viewBox="0 0 96 96"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="mascotBody" x1="18" x2="78" y1="14" y2="82" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#ff3aa2" />
                    <stop offset="0.58" stop-color="#e4005a" />
                    <stop offset="1" stop-color="#9b0059" />
                </linearGradient>
            </defs>
            <path
                fill="url(#mascotBody)"
                stroke="currentColor"
                stroke-linejoin="round"
                stroke-width="2"
                d="M48 7 82 28l-7 46-27 15-27-15-7-46L48 7Z"
            />
            <path fill="#f5e8f1" d="M26 36 48 44l22-8-5 31-17 8-17-8-5-31Z" />
            <path
                fill="none"
                stroke="#3b1431"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M26 36 48 44l22-8M48 9v35M31 67l17 8 17-8"
            />
            <path
                fill="#3b1431"
                d="M37 55c0 5-2.5 8-5.5 8S26 60 26 55s2.5-8 5.5-8 5.5 3 5.5 8ZM70 55c0 5-2.5 8-5.5 8S59 60 59 55s2.5-8 5.5-8 5.5 3 5.5 8Z"
            />
            <path
                fill="#e4005a"
                stroke="#3b1431"
                stroke-width="1.5"
                d="M31 42c4-4 9-4 12-1-3 2-8 2-12 1ZM65 42c-4-4-9-4-12-1 3 2 8 2 12 1Z"
            />
            <path fill="none" stroke="#3b1431" stroke-linecap="round" stroke-width="1.5" d="M41 67c4 3 10 3 14 0" />
            <path
                class="origin-center animate-pulse"
                fill="#f5e8f1"
                stroke="#3b1431"
                stroke-width="1.5"
                d="M17 61c-6 1-8 8-5 13 3 4 9 3 13-1l-8-12Z"
            />
            <path
                class="origin-center animate-pulse"
                fill="#f5e8f1"
                stroke="#3b1431"
                stroke-width="1.5"
                d="M79 61c6 1 8 8 5 13-3 4-9 3-13-1l8-12Z"
            />
            <path
                fill="#e4005a"
                stroke="#3b1431"
                stroke-width="1.5"
                d="M11 73c4-7 11-8 16-2-3 8-14 10-16 2ZM85 73c-4-7-11-8-16-2 3 8 14 10 16 2Z"
            />
        </svg>
    `
})
export class PlaygroundMascotAvatar {}
