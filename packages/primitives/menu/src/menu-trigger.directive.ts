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
    untracked
} from '@angular/core';
import { RdxPositionAlign, RdxPositionSide } from '@radix-ng/primitives/core';

@Directive({
    selector: '[MenuTrigger]',
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
     * @default top
     */
    readonly side = input<RdxPositionSide | undefined>(undefined);
    /**
     * @description The distance in pixels from the trigger.
     * @default undefined
     */
    readonly sideOffset = input<number, NumberInput>(NaN, {
        transform: numberAttribute
    });
    /**
     * @description The preferred alignment against the trigger. May change when collisions occur.
     * @default center
     */
    readonly align = input<RdxPositionAlign | undefined>(undefined);
    /**
     * @description An offset in pixels from the "start" or "end" alignment options.
     * @default undefined
     */
    readonly alignOffset = input<number, NumberInput>(NaN, {
        transform: numberAttribute
    });

    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    private readonly positions = computed(() => this.computePositions());

    private computePositions() {}

    #onPositionChangeEffect = effect(() => {
        // const positions = this.positions();
        untracked(() => {
            // TODO: added poisitions and for subMenu
            // this.cdkTrigger.menuPosition = positions;
        });
    });

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
}
