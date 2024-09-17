import { CdkContextMenuTrigger, MENU_STACK, MENU_TRIGGER, MenuStack } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { booleanAttribute, Directive, Input, numberAttribute, TemplateRef } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';

export enum ContextMenuSide {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

const ContextMenuPositions: Record<ContextMenuSide, ConnectedPosition> = {
    top: {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offsetX: 0,
        offsetY: 0
    },
    right: {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 0
    },
    bottom: {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 0
    },
    left: {
        originX: 'start',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 0
    }
};

@Directive({
    selector: '[rdxContextMenuTrigger]',
    standalone: true,
    host: {
        '[attr.data-state]': "isOpen() ? 'open': 'closed'",
        '[attr.data-disabled]': "disabled ? '' : null",

        '(contextmenu)': '_openOnContextMenu($event)'
    },
    providers: [
        { provide: MENU_TRIGGER, useExisting: RdxContextMenuTriggerDirective },
        { provide: MENU_STACK, useClass: MenuStack }
    ]
})
export class RdxContextMenuTriggerDirective extends CdkContextMenuTrigger {
    override menuPosition = [{ ...ContextMenuPositions[ContextMenuSide.Bottom] }];

    @Input()
    set rdxContextMenuTrigger(value: TemplateRef<unknown> | null) {
        this.menuTemplateRef = value;
    }

    @Input({ transform: numberAttribute })
    set alignOffset(value: number) {
        this.defaultPosition.offsetX = value;
    }

    @Input({ transform: booleanAttribute }) override disabled = false;

    onOpenChange = outputFromObservable(this.opened);

    get defaultPosition(): ConnectedPosition {
        return this.menuPosition[0];
    }
}
