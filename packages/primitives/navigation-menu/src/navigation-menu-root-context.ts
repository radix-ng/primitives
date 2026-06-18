import { Signal, TemplateRef } from '@angular/core';
import { createContext, RdxCancelableChangeEventDetails, RdxTransitionStatus } from '@radix-ng/primitives/core';

export type NavigationMenuOrientation = 'horizontal' | 'vertical';
export type NavigationMenuDirection = 'ltr' | 'rtl';

export type RdxNavigationMenuOpenChangeReason =
    | 'trigger-hover'
    | 'trigger-focus'
    | 'trigger-press'
    | 'list-navigation'
    | 'outside-press'
    | 'focus-out'
    | 'escape-key'
    | 'link-select'
    | 'list-leave'
    | 'none';

export type RdxNavigationMenuOpenChangeEventDetails =
    RdxCancelableChangeEventDetails<RdxNavigationMenuOpenChangeReason>;

export interface RdxNavigationMenuOpenChange {
    value: string | null;
    open: boolean;
    reason: RdxNavigationMenuOpenChangeReason;
    event: Event;
    trigger: HTMLElement | undefined;
    eventDetails: RdxNavigationMenuOpenChangeEventDetails;
}

/**
 * A registered item content template, rendered into the shared viewport when its item is active.
 */
export interface RdxNavigationMenuContentEntry {
    value: string;
    contentId: string;
    triggerId: string;
    templateRef: TemplateRef<unknown>;
    forceMount: Signal<boolean>;
}

export interface RdxNavigationMenuRootContext {
    /** Whether this menu is nested inside another navigation menu's content. */
    readonly nested: boolean;
    readonly baseId: string;
    readonly orientation: Signal<NavigationMenuOrientation>;
    readonly dir: Signal<NavigationMenuDirection>;
    readonly loop: Signal<boolean>;

    /** Value of the currently open item, or `null` when closed. */
    readonly value: Signal<string | null>;
    /** Value of the previously open item (used for slide-direction morphing). */
    readonly previousValue: Signal<string | null>;
    readonly isOpen: Signal<boolean>;
    readonly present: Signal<boolean>;
    readonly instant: Signal<boolean>;
    readonly transitionStatus: Signal<RdxTransitionStatus>;

    /** The active trigger element the popup is anchored to. */
    readonly trigger: Signal<HTMLElement | undefined>;
    readonly triggers: Signal<HTMLElement[]>;
    readonly list: Signal<HTMLElement | undefined>;
    readonly contents: Signal<Map<string, RdxNavigationMenuContentEntry>>;
    readonly activeContent: Signal<RdxNavigationMenuContentEntry | undefined>;
    readonly popup: Signal<HTMLElement | undefined>;
    readonly size: Signal<{ width: number; height: number } | null>;

    contentId(value: string): string;
    triggerId(value: string): string;

    setValue(value: string | null, reason?: RdxNavigationMenuOpenChangeReason, event?: Event): void;
    open(value: string, trigger: HTMLElement, reason?: RdxNavigationMenuOpenChangeReason, event?: Event): void;
    close(reason?: RdxNavigationMenuOpenChangeReason, event?: Event): void;
    toggle(value: string, trigger: HTMLElement, event?: Event): void;
    openOnHover(value: string, trigger: HTMLElement, event: PointerEvent): void;
    closeOnHover(event?: PointerEvent): void;
    cancelHoverOpen(): void;
    cancelHoverClose(): void;
    setSize(size: { width: number; height: number } | null): void;

    registerTrigger(value: string, trigger: HTMLElement): () => void;
    registerList(list: HTMLElement): () => void;
    registerContent(entry: RdxNavigationMenuContentEntry): () => void;
    registerPopup(element: HTMLElement): () => void;
    registerTransitionElement(element: HTMLElement): () => void;
    registerViewport(onTriggerChange: (previous: HTMLElement, next: HTMLElement) => void): () => void;
}

export const [injectNavigationMenuRootContext, provideNavigationMenuRootContext] =
    createContext<RdxNavigationMenuRootContext>('RdxNavigationMenuRootContext', 'components/navigation-menu');
