import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { makeContentId, makeTriggerId } from './utils';

/**
 * Structural directive (*rdxNavigationMenuContent) that registers content
 * with the parent menu item and root navigation menu's viewport.
 */
@Directive({
    selector: '[rdxNavigationMenuContent]',
    standalone: true
})
export class RdxNavigationMenuContentDirective implements OnInit, OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    private readonly template = inject(TemplateRef);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly elementRef = inject(ElementRef);

    @Input({ transform: booleanAttribute })
    set rdxNavigationMenuContent(value: BooleanInput) {
        // Structural directive requires this input even if unused
    }

    @Input({ transform: booleanAttribute }) forceMount: BooleanInput;

    readonly contentId = makeContentId(this.context.baseId, this.item.value);
    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value);

    ngOnInit() {
        // Don't create the view directly when using structural directive
        // Instead, register the template with the viewport

        // Register with the item
        this.item.contentRef.set(this.elementRef.nativeElement);

        // Register with viewport in root menu
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentChange) {
            this.context.onViewportContentChange(this.item.value, {
                ref: this.elementRef,
                templateRef: this.template,
                forceMount: this.forceMount,
                value: this.item.value
            });
        }
    }

    ngOnDestroy() {
        // Unregister from viewport
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentRemove) {
            this.context.onViewportContentRemove(this.item.value);
        }
    }
}
