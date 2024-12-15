import { NumberInput } from '@angular/cdk/coercion';
import { Component, computed, input, numberAttribute, signal } from '@angular/core';
import { radii, RadixColor } from '@radix-ng/components/types';
import {
    RdxAvatarFallbackDirective,
    RdxAvatarImageDirective,
    RdxAvatarRootDirective,
    RdxImageLoadingStatus
} from '@radix-ng/primitives/avatar';
import classNames from 'classnames';

export type AvatarVariant = 'solid' | 'soft';

@Component({
    selector: 'rdx-theme-avatar',
    standalone: true,
    imports: [RdxAvatarRootDirective, RdxAvatarImageDirective, RdxAvatarFallbackDirective],
    template: `
        <span [class]="computedClass()" [attr.data-radius]="radius()" [attr.data-accent-color]="color()" rdxAvatarRoot>
            <img
                class="rt-AvatarImage"
                [src]="src()"
                [alt]="altImg()"
                (onLoadingStatusChange)="handleLoadingStatus($event)"
                rdxAvatarImage
            />

            @if (statusLoading() === 'idle' || statusLoading() === 'loading') {
                <span class="rt-AvatarFallback" rdxAvatarFallback></span>
            }
            @if (statusLoading() === 'error') {
                <span class="rt-AvatarFallback" [delayMs]="0" rdxAvatarFallback>{{ fallback() }}</span>
            }
        </span>
    `
})
export class RdxThemeAvatarComponent {
    readonly radius = input<radii>();

    readonly size = input<number, NumberInput>(3, { transform: numberAttribute });

    readonly variant = input<AvatarVariant>('soft');

    readonly color = input<RadixColor>();

    readonly fallback = input<string>();

    readonly src = input<string>();

    readonly altImg = input<string>('');

    readonly statusLoading = signal<RdxImageLoadingStatus>('loaded');

    protected computedClass = computed(() =>
        classNames(
            'rt-reset',
            'rt-AvatarRoot',
            this.size() && `rt-r-size-${this.size()}`,
            this.variant() && `rt-variant-${this.variant()}`
        )
    );

    handleLoadingStatus(event: RdxImageLoadingStatus) {
        this.statusLoading.set(event);
    }
}
