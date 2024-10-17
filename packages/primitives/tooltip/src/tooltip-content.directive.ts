import { ConnectedPosition } from '@angular/cdk/overlay';
import { computed, Directive, inject, input, output, TemplateRef } from '@angular/core';
import { RdxTooltipContentToken } from './tooltip-content.token';
import { RdxTooltipRootDirective } from './tooltip-root.directive';
import { TOOLTIP_POSITIONS } from './tooltip.constants';
import { RdxTooltipAlign, RdxTooltipSide } from './tooltip.types';

@Directive({
    selector: '[rdxTooltipContent]',
    standalone: true,
    providers: [{ provide: RdxTooltipContentToken, useExisting: RdxTooltipContentDirective }]
})
export class RdxTooltipContentDirective {
    readonly templateRef = inject(TemplateRef);
    readonly tooltipRoot = inject(RdxTooltipRootDirective);
    side = input<RdxTooltipSide>(RdxTooltipSide.Top);
    sideOffset = input<number>(0);
    align = input<RdxTooltipAlign>(RdxTooltipAlign.Center);
    alignOffset = input<number>(0);
    onEscapeKeyDown = output<KeyboardEvent>();

    position = computed<ConnectedPosition>(() => {
        const side = this.side();
        const align = this.align();
        const sideOffset = this.sideOffset();
        const alignOffset = this.alignOffset();

        const position =
            TOOLTIP_POSITIONS[side][align] ?? TOOLTIP_POSITIONS[RdxTooltipSide.Top][RdxTooltipAlign.Center];

        if (sideOffset > 0) {
            let xFactor = 0;
            let yFactor = 0;

            switch (side) {
                case RdxTooltipSide.Top:
                    yFactor = -1;
                    break;
                case RdxTooltipSide.Bottom:
                    yFactor = 1;
                    break;
                case RdxTooltipSide.Left:
                    xFactor = -1;
                    break;
                case RdxTooltipSide.Right:
                    xFactor = 1;
                    break;
            }

            position.offsetX = xFactor * sideOffset;
            position.offsetY = yFactor * sideOffset;
        }

        if ([RdxTooltipAlign.Start, RdxTooltipAlign.End].includes(align) && alignOffset) {
            const alignOffsetFactor = align === RdxTooltipAlign.End ? -1 : 1;

            position.offsetX = alignOffsetFactor * alignOffset;
        }

        return position;
    });
}
