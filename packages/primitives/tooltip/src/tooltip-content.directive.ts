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
    readonly templateRef = inject(TemplateRef);
    readonly side = input<RdxTooltipSide>(RdxTooltipSide.Top);
    readonly sideOffset = input<number>(0);
    readonly align = input<RdxTooltipAlign>(RdxTooltipAlign.Center);
    readonly alignOffset = input<number>(0);
    readonly position = computed<ConnectedPosition>(() =>
        getContentPosition(this.side(), this.align(), this.sideOffset(), this.alignOffset())
    );
    readonly onEscapeKeyDown = output<KeyboardEvent>();
    readonly onPointerDownOutside = output<MouseEvent>();
}
