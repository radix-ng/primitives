import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    numberAttribute,
    SimpleChange,
    untracked
} from '@angular/core';

export type RdxMenuAlign = 'start' | 'center' | 'end';
export type RdxMenuSide = 'top' | 'right' | 'bottom' | 'left';

@Directive({
    selector: '[RdxMenuTrigger]',
    hostDirectives: [
        {
            directive: CdkMenuTrigger,
            inputs: ['cdkMenuTriggerFor: menuTriggerFor', 'cdkMenuPosition: menuPosition']
        }
    ],
    host: {
        role: 'menuitem',
        '[attr.aria-haspopup]': "'menu'",
        '[attr.aria-expanded]': 'cdkTrigger.isOpen()',
        '[attr.data-state]': "cdkTrigger.isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled() ? '' : undefined",

        '(pointerdown)': 'onPointerDown($event)'
    }
})
export class RdxMenuTriggerDirective {
    protected readonly cdkTrigger = inject(CdkMenuTrigger, { host: true });

    readonly menuTriggerFor = input.required();

    /**
     * @description The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<RdxMenuSide>();

    readonly align = input<RdxMenuAlign>();

    /**
     * @description The distance in pixels from the trigger.
     */
    readonly sideOffset = input<number, NumberInput>(NaN, {
        transform: numberAttribute
    });

    /**
     * @description An offset in pixels from the "start" or "end" alignment options.
     */
    readonly alignOffset = input<number, NumberInput>(NaN, {
        transform: numberAttribute
    });

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    private enablePositions = false;

    // TODO
    private readonly positions = computed(() => this.computePositions());

    private computePositions() {
        if (this.align() || this.sideOffset() || this.alignOffset() || this.side()) {
            this.enablePositions = true;
        }

        const side = this.side() || 'bottom';
        const align = this.align() || 'center';
        const sideOffset = this.sideOffset() || 0;
        const alignOffset = this.alignOffset() || 0;

        let originX: 'start' | 'center' | 'end' = 'center';
        let originY: 'top' | 'center' | 'bottom' = 'center';
        let overlayX: 'start' | 'center' | 'end' = 'center';
        let overlayY: 'top' | 'center' | 'bottom' = 'center';
        let offsetX = 0;
        let offsetY = 0;

        switch (side) {
            case 'top':
                originY = 'top';
                overlayY = 'bottom';
                offsetY = -sideOffset;
                break;
            case 'bottom':
                originY = 'bottom';
                overlayY = 'top';
                offsetY = sideOffset;
                break;
            case 'left':
                originX = 'start';
                overlayX = 'end';
                offsetX = -sideOffset;
                break;
            case 'right':
                originX = 'end';
                overlayX = 'start';
                offsetX = sideOffset;
                break;
        }

        switch (align) {
            case 'start':
                if (side === 'top' || side === 'bottom') {
                    originX = 'start';
                    overlayX = 'start';
                    offsetX = alignOffset;
                } else {
                    originY = 'top';
                    overlayY = 'top';
                    offsetY = alignOffset;
                }
                break;
            case 'end':
                if (side === 'top' || side === 'bottom') {
                    originX = 'end';
                    overlayX = 'end';
                    offsetX = -alignOffset;
                } else {
                    originY = 'bottom';
                    overlayY = 'bottom';
                    offsetY = -alignOffset;
                }
                break;
            case 'center':
            default:
                if (side === 'top' || side === 'bottom') {
                    originX = 'center';
                    overlayX = 'center';
                } else {
                    originY = 'center';
                    overlayY = 'center';
                }
                break;
        }

        return {
            originX,
            originY,
            overlayX,
            overlayY,
            offsetX,
            offsetY
        };
    }

    constructor() {
        this.onMenuPositionEffect();
    }

    /** @ignore */
    onPointerDown($event: MouseEvent) {
        // only call handler if it's the left button (mousedown gets triggered by all mouse buttons)
        // but not when the control key is pressed (avoiding MacOS right click)
        if (!this.disabled() && $event.button === 0 && !$event.ctrlKey) {
            /* empty */
            if (!this.cdkTrigger.isOpen()) {
                // prevent trigger focusing when opening
                // this allows the content to be given focus without competition
                $event.preventDefault();
            }
        }
    }

    private onMenuPositionEffect() {
        effect(() => {
            const positions = this.positions();

            untracked(() => {
                if (this.enablePositions) {
                    this.setMenuPositions([positions]);
                }
            });
        });
    }

    private setMenuPositions(positions: CdkMenuTrigger['menuPosition']) {
        const prevMenuPosition = this.cdkTrigger.menuPosition;
        this.cdkTrigger.menuPosition = positions;
        this.fireNgOnChanges('menuPosition', this.cdkTrigger.menuPosition, prevMenuPosition);
    }

    private fireNgOnChanges<K extends keyof CdkMenuTrigger, V extends CdkMenuTrigger[K]>(
        input: K,
        currentValue: V,
        previousValue: V,
        firstChange = false
    ) {
        this.cdkTrigger.ngOnChanges({
            [input]: new SimpleChange(previousValue, currentValue, firstChange)
        });
    }
}
