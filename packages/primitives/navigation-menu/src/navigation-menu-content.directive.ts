import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    Input,
    input,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef
} from '@angular/core';
import { ESCAPE, injectDocument } from '@radix-ng/primitives/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { getMotionAttribute, makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuContent]'
})
export class RdxNavigationMenuContentDirective implements OnInit, OnDestroy {
    private readonly elementRef = inject(ElementRef);
    private readonly ngZone = inject(NgZone);
    private readonly template = inject(TemplateRef);
    private readonly document = injectDocument();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    private readonly context = injectNavigationMenu();

    @Input({ transform: booleanAttribute })
    set rdxNavigationMenuContent(value: boolean) {
        // structural directive requires this input even if unused
    }

    /**
     * Used to keep the content rendered and available in the DOM, even when closed.
     * Useful for animations or SEO.
     * @default false
     */
    readonly forceMount = input(false, { transform: booleanAttribute });

    /** @ignore */
    readonly contentId = makeContentId(this.context.baseId, this.item.value());
    /** @ignore */
    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value());

    private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

    /** @ignore */
    ngOnInit() {
        this.item.contentRef.set(this.elementRef.nativeElement);

        // register template with viewport in root menu via context
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentChange) {
            this.context.onViewportContentChange(this.item.value(), {
                ref: this.elementRef,
                templateRef: this.template,
                forceMount: this.forceMount(),
                value: this.item.value(),
                getMotionAttribute: this.getMotionAttribute.bind(this),
                additionalAttrs: {
                    id: this.contentId,
                    'aria-labelledby': this.triggerId,
                    role: 'menu'
                }
            });
        }

        // add Escape key handler
        this.escapeHandler = (event: KeyboardEvent) => {
            if (event.key === ESCAPE && this.context.value() === this.item.value()) {
                // mark that this close was triggered by Escape
                this.item.wasEscapeCloseRef.set(true);

                // close the content
                if (this.context.onItemDismiss) {
                    this.context.onItemDismiss();
                }

                // refocus the trigger
                setTimeout(() => {
                    const trigger = this.item.triggerRef();
                    if (trigger) trigger.focus();
                }, 0);

                event.preventDefault();
                event.stopPropagation();
            }
        };

        this.ngZone.runOutsideAngular(() => {
            if (this.escapeHandler) {
                this.document.addEventListener('keydown', this.escapeHandler);
            }
        });
    }

    /** @ignore */
    ngOnDestroy() {
        // unregister from viewport
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentRemove) {
            this.context.onViewportContentRemove(this.item.value());
        }

        // remove escape key handler
        if (this.escapeHandler) {
            this.document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }

    /** @ignore - Compute motion attribute for animations */
    getMotionAttribute(): string | null {
        if (!isRootNavigationMenu(this.context)) return null;

        const itemValues = Array.from(this.context.viewportContent?.() ?? new Map()).map(([value]) => value);

        return getMotionAttribute(
            this.context.value(),
            this.context.previousValue(),
            this.item.value(),
            itemValues,
            this.context.dir
        );
    }
}
