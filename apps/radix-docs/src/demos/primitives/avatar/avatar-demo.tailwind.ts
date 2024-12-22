import { Component } from '@angular/core';

import {
    RdxAvatarFallbackDirective,
    RdxAvatarImageDirective,
    RdxAvatarRootDirective
} from '@radix-ng/primitives/avatar';

@Component({
    selector: 'radix-avatar-tailwind-demo',
    standalone: true,
    imports: [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective],
    template: `
        <div class="flex gap-5">
            <span
                class="bg-blackA3 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle"
                rdxAvatarRoot
            >
                <img
                    class="h-full w-full rounded-[inherit] object-cover"
                    rdxAvatarImage
                    src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                    alt="Colm Tuite"
                />
                <span
                    class="text-grass11 leading-1 flex h-full w-full items-center justify-center bg-white text-sm font-medium dark:bg-stone-800 dark:text-stone-300"
                    rdxAvatarFallback
                    rdxDelayMs="600"
                >
                    CT
                </span>
            </span>
            <span
                class="bg-blackA3 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full align-middle"
                rdxAvatarRoot
            >
                <img
                    class="h-full w-full rounded-[inherit] object-cover"
                    rdxAvatarImage
                    src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80"
                    alt="Pedro Duarte"
                />
                <span
                    class="text-grass11 leading-1 flex h-full w-full items-center justify-center bg-white text-sm font-medium dark:bg-stone-800 dark:text-stone-300"
                    rdxAvatarFallback
                    rdxDelayMs="600"
                >
                    JD
                </span>
            </span>
            <span
                class="bg-blackA3 inline-flex h-[45px] w-[45px] select-none items-center justify-center overflow-hidden rounded-full border align-middle dark:border-stone-700"
                rdxAvatarRoot
            >
                <span
                    class=" text-grass11 leading-1 flex h-full w-full items-center justify-center bg-white text-sm font-medium dark:bg-stone-800 dark:text-stone-300"
                    rdxAvatarFallback
                >
                    PD
                </span>
            </span>
        </div>
    `
})
export class AvatarDemoTailwindComponent {}

export default AvatarDemoTailwindComponent;
