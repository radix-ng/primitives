import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    PLATFORM_ID,
    computed,
    inject,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import {
    LucideBookOpen,
    LucideExternalLink,
    LucideEye,
    LucideLightbulb,
    LucideSearch,
    LucideSparkles,
    LucideX
} from '@lucide/angular';
import { filter } from 'rxjs';
import { PlaygroundMascotAvatar } from './playground-mascot-avatar';
import type { InspectedElement, LiveStateChange, PinGeometry } from './playground-mascot-data';
import {
    DEFAULT_MASCOT_HINTS,
    MASCOT_HINTS,
    RDX_ATTRIBUTE_LABELS,
    isStateAttribute,
    searchMascotDocs
} from './playground-mascot-data';
import { PlaygroundMascotPin } from './playground-mascot-pin';
import { PRIMITIVES } from './shared/primitives';

@Component({
    selector: 'app-playground-mascot',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LucideBookOpen,
        LucideExternalLink,
        LucideEye,
        LucideLightbulb,
        LucideSearch,
        LucideSparkles,
        LucideX,
        PlaygroundMascotAvatar,
        PlaygroundMascotPin
    ],
    host: {
        class: 'pointer-events-none fixed inset-0 z-[200] [--mascot-accent:#e4005a] [--mascot-accent-foreground:#ffffff] [--mascot-accent-ring:color-mix(in_srgb,var(--mascot-accent)_35%,transparent)] [--mascot-accent-soft:color-mix(in_srgb,var(--mascot-accent)_18%,transparent)]'
    },
    template: `
        @if (pinGeometry(); as pin) {
            <app-playground-mascot-pin [geometry]="pin" />
        }

        @if (visible()) {
            <section
                class="pointer-events-auto fixed right-5 bottom-5 grid max-w-[calc(100vw-2.5rem)] grid-cols-[minmax(0,22rem)_auto] items-end gap-3"
                aria-label="Playground mascot assistant"
            >
                <div
                    class="border-border bg-popover text-popover-foreground ring-border max-h-[min(44rem,calc(100vh-3rem))] w-[22rem] max-w-[calc(100vw-7rem)] overflow-y-auto rounded-lg border p-3 shadow-lg ring-1"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                                <svg class="text-primary size-3.5" lucideSparkles aria-hidden="true"></svg>
                                {{ primitiveLabel() }} helper
                            </div>
                            <p class="text-muted-foreground mt-1 text-xs leading-5">
                                {{ message() }}
                            </p>
                        </div>
                        <button
                            class="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-md"
                            (click)="hide()"
                            type="button"
                            aria-label="Hide mascot"
                        >
                            <svg class="size-3.5" lucideX aria-hidden="true"></svg>
                        </button>
                    </div>

                    @if (inspected(); as target) {
                        <div class="border-border bg-muted/40 mt-3 rounded-md border p-2">
                            <div class="flex items-center justify-between gap-2">
                                <div class="text-foreground text-xs font-medium">{{ target.label }}</div>
                                <div class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                                    {{ target.source }}
                                </div>
                            </div>
                            @if (target.attrs.length) {
                                <dl class="mt-2 grid gap-1">
                                    @for (attr of target.attrs; track attr.name) {
                                        <div class="grid grid-cols-[7rem_1fr] gap-2 text-[11px] leading-4">
                                            <dt class="text-muted-foreground truncate">{{ attr.name }}</dt>
                                            <dd class="text-foreground truncate font-mono">{{ attr.value }}</dd>
                                        </div>
                                    }
                                </dl>
                            } @else {
                                <p class="text-muted-foreground mt-1 text-[11px]">No state attributes found yet.</p>
                            }
                        </div>
                    }

                    @if (docsMode()) {
                        <div class="border-border bg-muted/30 mt-3 rounded-md border p-2">
                            <label
                                class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase"
                                for="mascot-docs-search"
                            >
                                Search docs
                            </label>
                            <div
                                class="border-border bg-background mt-1.5 flex h-8 items-center gap-2 rounded-md border px-2"
                            >
                                <svg
                                    class="text-muted-foreground size-3.5 shrink-0"
                                    lucideSearch
                                    aria-hidden="true"
                                ></svg>
                                <input
                                    class="placeholder:text-muted-foreground text-foreground min-w-0 flex-1 bg-transparent text-xs outline-none"
                                    id="mascot-docs-search"
                                    [value]="docsQuery()"
                                    (input)="updateDocsQuery($event)"
                                    placeholder="Ask about state, forms, keyboard..."
                                    type="search"
                                />
                            </div>
                            <p class="text-muted-foreground mt-1.5 text-[11px] leading-4">
                                Local docs index, scoped to {{ primitiveLabel() }} first.
                            </p>

                            @if (docsResults(); as results) {
                                @if (results.length) {
                                    <div class="mt-2 grid gap-2">
                                        @for (result of results; track result.id) {
                                            <article class="border-border bg-background rounded-md border p-2">
                                                <div class="flex items-start justify-between gap-2">
                                                    <div class="min-w-0">
                                                        <div class="text-foreground truncate text-xs font-semibold">
                                                            {{ result.title }}
                                                        </div>
                                                        <div
                                                            class="text-muted-foreground mt-0.5 text-[10px] font-semibold tracking-wide uppercase"
                                                        >
                                                            {{ result.source }}
                                                        </div>
                                                    </div>
                                                    <a
                                                        class="text-muted-foreground hover:text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-md"
                                                        [href]="result.href"
                                                        aria-label="Open docs"
                                                    >
                                                        <svg
                                                            class="size-3.5"
                                                            lucideExternalLink
                                                            aria-hidden="true"
                                                        ></svg>
                                                    </a>
                                                </div>
                                                <p class="text-muted-foreground mt-1 text-[11px] leading-4">
                                                    {{ result.summary }}
                                                </p>
                                                <ul class="mt-1.5 grid gap-1">
                                                    @for (bullet of result.bullets.slice(0, 2); track bullet) {
                                                        <li
                                                            class="text-muted-foreground flex gap-1.5 text-[11px] leading-4"
                                                        >
                                                            <span
                                                                class="mt-1 size-1 shrink-0 rounded-full bg-[var(--mascot-accent)]"
                                                            ></span>
                                                            <span>{{ bullet }}</span>
                                                        </li>
                                                    }
                                                </ul>
                                                <div class="mt-2 flex gap-1.5">
                                                    <a
                                                        class="border-border text-foreground hover:bg-muted inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium"
                                                        [href]="result.href"
                                                    >
                                                        Docs
                                                    </a>
                                                    @if (result.exampleHref) {
                                                        <a
                                                            class="border-border text-foreground hover:bg-muted inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium"
                                                            [href]="result.exampleHref"
                                                        >
                                                            Example
                                                        </a>
                                                    }
                                                </div>
                                            </article>
                                        }
                                    </div>
                                } @else {
                                    <p class="text-muted-foreground mt-2 text-[11px] leading-4">
                                        No local docs match this query yet.
                                    </p>
                                }
                            }
                        </div>
                    }

                    @if (liveChanges().length) {
                        <div class="border-border mt-2 rounded-md border p-2">
                            <div class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                                Live state
                            </div>
                            <div class="mt-2 grid gap-1.5">
                                @for (change of liveChanges(); track change.id) {
                                    <div class="grid gap-0.5 text-[11px] leading-4">
                                        <div class="text-foreground flex min-w-0 items-center gap-1.5">
                                            <span class="truncate font-medium">{{ change.target }}</span>
                                            <span class="text-muted-foreground shrink-0">{{ change.name }}</span>
                                        </div>
                                        <div class="text-muted-foreground truncate font-mono">
                                            {{ change.previousValue }} -> {{ change.value }}
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    }

                    <div class="mt-3 flex gap-2">
                        <button
                            class="border-border bg-background text-foreground hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-xs"
                            (click)="nextHint()"
                            type="button"
                        >
                            <svg class="size-3.5" lucideLightbulb aria-hidden="true"></svg>
                            Hint
                        </button>
                        <button
                            class="border-border inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-xs"
                            [class.bg-[var(--mascot-accent)]]="docsMode()"
                            [class.text-[var(--mascot-accent-foreground)]]="docsMode()"
                            [class.bg-background]="!docsMode()"
                            [class.text-foreground]="!docsMode()"
                            [class.hover:bg-muted]="!docsMode()"
                            [attr.aria-pressed]="docsMode()"
                            (click)="toggleDocs()"
                            type="button"
                        >
                            <svg class="size-3.5" lucideBookOpen aria-hidden="true"></svg>
                            Docs
                        </button>
                        <button
                            class="border-border inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-xs"
                            [class.bg-[var(--mascot-accent)]]="inspectMode()"
                            [class.text-[var(--mascot-accent-foreground)]]="inspectMode()"
                            [class.bg-background]="!inspectMode()"
                            [class.text-foreground]="!inspectMode()"
                            [class.hover:bg-muted]="!inspectMode()"
                            [attr.aria-pressed]="inspectMode()"
                            (click)="toggleInspect()"
                            type="button"
                        >
                            <svg class="size-3.5" lucideEye aria-hidden="true"></svg>
                            Inspect
                        </button>
                    </div>
                </div>

                <button
                    class="group focus-visible:ring-ring focus-visible:ring-offset-background relative mb-1 inline-flex size-16 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    (click)="nextHint()"
                    type="button"
                    aria-label="Show next mascot hint"
                >
                    <app-playground-mascot-avatar />
                    @if (inspectMode()) {
                        <span
                            class="absolute -top-1 -right-1 rounded-full bg-[var(--mascot-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--mascot-accent-foreground)]"
                        >
                            on
                        </span>
                    }
                </button>
            </section>
        } @else {
            <button
                class="pointer-events-auto fixed right-5 bottom-5 inline-flex size-12 items-center justify-center rounded-full bg-[var(--mascot-accent)] text-[var(--mascot-accent-foreground)] shadow-lg transition-transform hover:scale-105"
                (click)="show()"
                type="button"
                aria-label="Show mascot"
            >
                <svg class="size-5" lucideSparkles aria-hidden="true"></svg>
            </button>
        }
    `
})
export class PlaygroundMascot {
    private readonly destroyRef = inject(DestroyRef);
    private readonly document = inject(DOCUMENT);
    private readonly host = inject(ElementRef<HTMLElement>);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly router = inject(Router);
    private inspectedElement: HTMLElement | null = null;
    private stateChangeId = 0;
    private mutationObserver: MutationObserver | null = null;
    private pinFrame = 0;

    protected readonly visible = signal(true);
    protected readonly inspectMode = signal(false);
    protected readonly docsMode = signal(false);
    protected readonly docsQuery = signal('');
    protected readonly inspected = signal<InspectedElement | null>(null);
    protected readonly liveChanges = signal<readonly LiveStateChange[]>([]);
    protected readonly pinGeometry = signal<PinGeometry | null>(null);
    protected readonly hintIndex = signal(0);
    protected readonly routeKey = signal(this.getRouteKey(this.router.url));

    protected readonly primitiveLabel = computed(() => {
        const key = this.routeKey();
        return PRIMITIVES.find((item) => item.path === key)?.label ?? 'Playground';
    });

    protected readonly hints = computed(() => MASCOT_HINTS[this.routeKey()] ?? DEFAULT_MASCOT_HINTS);
    protected readonly message = computed(() => {
        if (this.docsMode()) {
            return 'Ask local docs for this primitive. I will show matching snippets and links, without using an LLM.';
        }

        return this.hints()[this.hintIndex() % this.hints().length];
    });
    protected readonly docsResults = computed(() => searchMascotDocs(this.docsQuery(), this.routeKey()));

    constructor() {
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                this.routeKey.set(this.getRouteKey(event.urlAfterRedirects));
                this.hintIndex.set(0);
                this.inspectedElement = null;
                this.inspected.set(null);
                this.liveChanges.set([]);
                this.pinGeometry.set(null);
                this.docsQuery.set('');
            });

        if (!this.isBrowser) {
            return;
        }

        const readTarget = (target: EventTarget | null, source: InspectedElement['source']) => {
            if (!this.inspectMode() || !(target instanceof HTMLElement) || this.host.nativeElement.contains(target)) {
                return;
            }

            const primitiveElement = this.resolvePrimitiveElement(target);

            if (primitiveElement) {
                this.trackElement(primitiveElement, source);
            } else if (source === 'Clicked') {
                this.clearTrackedElement();
            }
        };

        const focusHandler = (event: FocusEvent) => readTarget(event.target, 'Focused');
        const clickHandler = (event: MouseEvent) => readTarget(event.target, 'Clicked');
        const refreshPin = () => this.schedulePinRefresh();

        this.document.addEventListener('focusin', focusHandler);
        this.document.addEventListener('click', clickHandler, true);
        this.document.defaultView?.addEventListener('resize', refreshPin);
        this.document.addEventListener('scroll', refreshPin, true);

        this.destroyRef.onDestroy(() => {
            this.document.removeEventListener('focusin', focusHandler);
            this.document.removeEventListener('click', clickHandler, true);
            this.document.defaultView?.removeEventListener('resize', refreshPin);
            this.document.removeEventListener('scroll', refreshPin, true);
            this.stopLiveStateFeed();
            this.cancelPinRefresh();
        });
    }

    protected nextHint(): void {
        this.hintIndex.update((value) => value + 1);
    }

    protected toggleInspect(): void {
        this.inspectMode.update((value) => !value);

        if (!this.inspectMode()) {
            this.stopLiveStateFeed();
            this.liveChanges.set([]);
            this.clearTrackedElement();
            return;
        }

        this.startLiveStateFeed();

        if (this.document.activeElement instanceof HTMLElement) {
            const activeElement = this.document.activeElement;

            if (!this.host.nativeElement.contains(activeElement)) {
                const primitiveElement = this.resolvePrimitiveElement(activeElement);

                if (primitiveElement) {
                    this.trackElement(primitiveElement, 'Focused');
                }
            }
        }
    }

    protected toggleDocs(): void {
        this.docsMode.update((value) => !value);
    }

    protected updateDocsQuery(event: Event): void {
        if (event.target instanceof HTMLInputElement) {
            this.docsQuery.set(event.target.value);
        }
    }

    protected hide(): void {
        this.visible.set(false);
        this.pinGeometry.set(null);
    }

    protected show(): void {
        this.visible.set(true);
        this.schedulePinRefresh();
    }

    private getRouteKey(url: string): string {
        const cleanUrl = url.split('?')[0].split('#')[0];
        const segments = cleanUrl.split('/').filter(Boolean);
        const playgroundIndex = segments.indexOf('playground');
        const key = playgroundIndex >= 0 ? segments[playgroundIndex + 1] : undefined;

        return key ?? 'overview';
    }

    private trackElement(element: HTMLElement, source: InspectedElement['source']): void {
        this.inspectedElement = element;
        this.inspected.set(this.inspectElement(element, source));
        this.schedulePinRefresh();
    }

    private clearTrackedElement(): void {
        this.inspectedElement = null;
        this.inspected.set(null);
        this.pinGeometry.set(null);
    }

    private resolvePrimitiveElement(element: HTMLElement): HTMLElement | null {
        let current: HTMLElement | null = element;

        while (current && current !== this.document.body && !this.host.nativeElement.contains(current)) {
            if (this.getRdxAttributeName(current.getAttributeNames())) {
                return current;
            }

            current = current.parentElement;
        }

        return null;
    }

    private startLiveStateFeed(): void {
        if (this.mutationObserver || !this.document.body) {
            return;
        }

        this.mutationObserver = new MutationObserver((records) => {
            for (const record of records) {
                if (record.type !== 'attributes' || !record.attributeName || !isStateAttribute(record.attributeName)) {
                    continue;
                }

                if (!(record.target instanceof HTMLElement) || this.host.nativeElement.contains(record.target)) {
                    continue;
                }

                if (!this.getRdxAttributeName(record.target.getAttributeNames())) {
                    continue;
                }

                const value = this.formatAttributeValue(record.target.getAttribute(record.attributeName));
                const previousValue = this.formatAttributeValue(record.oldValue, 'unset');

                if (value === previousValue) {
                    continue;
                }

                this.pushStateChange({
                    id: ++this.stateChangeId,
                    target: this.getElementLabel(record.target, record.target.getAttributeNames()),
                    name: record.attributeName,
                    previousValue,
                    value
                });

                if (record.target === this.inspectedElement) {
                    this.inspected.set(this.inspectElement(record.target, this.inspected()?.source ?? 'Focused'));
                    this.schedulePinRefresh();
                }
            }
        });

        this.mutationObserver.observe(this.document.body, {
            attributeOldValue: true,
            attributes: true,
            subtree: true
        });
    }

    private stopLiveStateFeed(): void {
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
    }

    private pushStateChange(change: LiveStateChange): void {
        this.liveChanges.update((changes) => [change, ...changes].slice(0, 4));
    }

    private inspectElement(element: HTMLElement, source: InspectedElement['source']): InspectedElement {
        const names = element.getAttributeNames();
        const attrs = names
            .filter(isStateAttribute)
            .slice(0, 6)
            .map((name) => ({ name, value: this.formatAttributeValue(element.getAttribute(name), 'true') }));

        return {
            label: this.getElementLabel(element, names),
            attrs,
            source
        };
    }

    private getElementLabel(element: HTMLElement, names: readonly string[]): string {
        const rdxAttribute = this.getRdxAttributeName(names);

        if (rdxAttribute) {
            return `[${RDX_ATTRIBUTE_LABELS[rdxAttribute] ?? rdxAttribute}]`;
        }

        if (element.id) {
            return `${element.tagName.toLowerCase()}#${element.id}`;
        }

        const accessibleName = element.getAttribute('aria-label') || element.textContent?.trim();

        if (accessibleName) {
            return `${element.tagName.toLowerCase()} "${accessibleName.slice(0, 32)}"`;
        }

        return element.tagName.toLowerCase();
    }

    private getRdxAttributeName(names: readonly string[]): string | undefined {
        return names.find((name) => name.startsWith('rdx'));
    }

    private schedulePinRefresh(): void {
        if (!this.isBrowser || !this.inspectMode()) {
            return;
        }

        this.cancelPinRefresh();
        this.pinFrame =
            this.document.defaultView?.requestAnimationFrame(() => {
                this.pinFrame = 0;
                this.refreshPinGeometry();
            }) ?? 0;
    }

    private cancelPinRefresh(): void {
        if (!this.pinFrame) {
            return;
        }

        this.document.defaultView?.cancelAnimationFrame(this.pinFrame);
        this.pinFrame = 0;
    }

    private refreshPinGeometry(): void {
        const target = this.inspectedElement;
        const view = this.document.defaultView;

        if (!view || !target || !target.isConnected || this.host.nativeElement.contains(target)) {
            this.pinGeometry.set(null);
            return;
        }

        const targetRect = target.getBoundingClientRect();

        if (targetRect.width === 0 && targetRect.height === 0) {
            this.pinGeometry.set(null);
            return;
        }

        const padding = 6;
        const badgeX = Math.max(12, Math.min(targetRect.right + 10, view.innerWidth - 172));
        const badgeY = Math.max(12, targetRect.top - 34);

        this.pinGeometry.set({
            badgeX,
            badgeY,
            label: this.getElementLabel(target, target.getAttributeNames()),
            targetX: targetRect.left - padding,
            targetY: targetRect.top - padding,
            targetWidth: targetRect.width + padding * 2,
            targetHeight: targetRect.height + padding * 2
        });
    }

    private formatAttributeValue(value: string | null, missingValue = 'removed'): string {
        if (value === null) {
            return missingValue;
        }

        return value === '' ? 'present' : value;
    }
}
