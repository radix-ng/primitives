import { ConnectedPosition } from '@angular/cdk/overlay';
import { computed, Directive, forwardRef, inject, input, output, TemplateRef } from '@angular/core';
import { getContentPosition } from './get-content-position';
import { RdxTooltipContentToken } from './tooltip-content.token';
import { RdxTooltipAlign, RdxTooltipSide } from './tooltip.types';

@Directive({
    selector: '[rdxTooltipContent]',
    standalone: true,
    providers: [{ provide: RdxTooltipContentToken, useExisting: forwardRef(() => RdxTooltipContentDirective) }]
})
export class RdxTooltipContentDirective {
    /** @ignore */
    readonly templateRef = inject(TemplateRef);

    /**
     * The preferred side of the trigger to render against when open. Will be reversed when collisions occur and avoidCollisions is enabled.
     */
    readonly side = input<RdxTooltipSide>(RdxTooltipSide.Top);

    /**
     * The distance in pixels from the trigger.
     */
    readonly sideOffset = input<number>(0);

    /**
     * The preferred alignment against the trigger. May change when collisions occur.
     */
    readonly align = input<RdxTooltipAlign>(RdxTooltipAlign.Center);

    /**
     * An offset in pixels from the "start" or "end" alignment options.
     */
    readonly alignOffset = input<number>(0);

    /** @ingore */
    readonly position = computed<ConnectedPosition>(() =>
        getContentPosition(this.side(), this.align(), this.sideOffset(), this.alignOffset())
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
