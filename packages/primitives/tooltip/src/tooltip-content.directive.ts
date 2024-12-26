import { NumberInput } from '@angular/cdk/coercion';
import { computed, Directive, forwardRef, inject, input, numberAttribute, output, TemplateRef } from '@angular/core';
import { getContentPosition, RdxPositionAlign, RdxPositionSide } from '@radix-ng/primitives/core';
import { RdxTooltipContentToken } from './tooltip-content.token';

@Directive({
    selector: '[rdxTooltipContent]',
    providers: [{ provide: RdxTooltipContentToken, useExisting: forwardRef(() => RdxTooltipContentDirective) }]
})
export class RdxTooltipContentDirective {
    /** @ignore */
    readonly templateRef = inject(TemplateRef);

    /**
     * The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<RdxPositionSide>(RdxPositionSide.Top);

    /**
     * The distance in pixels from the trigger.
     */
    readonly sideOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /**
     * The preferred alignment against the trigger. May change when collisions occur.
     */
    readonly align = input<RdxPositionAlign>(RdxPositionAlign.Center);

    /**
     * An offset in pixels from the "start" or "end" alignment options.
     */
    readonly alignOffset = input<number, NumberInput>(0, { transform: numberAttribute });

    /** @ingore */
    readonly position = computed(() =>
        getContentPosition({
            side: this.side(),
            align: this.align(),
            sideOffset: this.sideOffset(),
            alignOffset: this.alignOffset()
        })
    );

    /**
     * Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.
     */
    readonly onEscapeKeyDown = output<KeyboardEvent>();

    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.
     */
    readonly onPointerDownOutside = output<MouseEvent>();
}
