import {
    afterRenderEffect,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    signal,
    viewChild,
    viewChildren
} from '@angular/core';
import { LucideArrowUpRight, LucideChevronDown } from '@lucide/angular';
import {
    RdxAccordionHeaderDirective,
    RdxAccordionItemDirective,
    RdxAccordionPanelDirective,
    RdxAccordionPanelPresenceDirective,
    RdxAccordionRootDirective,
    RdxAccordionTriggerDirective
} from '@radix-ng/primitives/accordion';

type AccordionPart = 'root' | 'trigger' | 'panel';

interface Connector {
    part: AccordionPart;
    path: string;
    x: number;
    y: number;
}

@Component({
    selector: 'app-landing-accordion',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LucideArrowUpRight,
        LucideChevronDown,
        RdxAccordionHeaderDirective,
        RdxAccordionItemDirective,
        RdxAccordionPanelDirective,
        RdxAccordionPanelPresenceDirective,
        RdxAccordionRootDirective,
        RdxAccordionTriggerDirective
    ],
    host: { class: 'block' },
    templateUrl: './landing-accordion.html'
})
export class LandingAccordion {
    private readonly accordionRoot = viewChild(RdxAccordionRootDirective);
    private readonly stage = viewChild.required<ElementRef<HTMLDivElement>>('stage');
    private readonly accordion = viewChild.required<ElementRef<HTMLDivElement>>('accordion');
    private readonly triggers = viewChildren<ElementRef<HTMLButtonElement>>('trigger');
    private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel');
    private readonly callouts = viewChildren<ElementRef<HTMLButtonElement>>('callout');

    protected readonly items = [
        {
            id: 'accessibility',
            question: 'Is it accessible?',
            answer: 'Keyboard support, focus management and ARIA relationships are already part of the behavior.'
        },
        {
            id: 'styling',
            question: 'Is it unstyled?',
            answer: 'Yes. Bring your design, then style each part with the state attributes it exposes.'
        },
        {
            id: 'animation',
            question: 'Can it be animated?',
            answer: 'Yes. Panel size variables and state attributes let you animate the opening and closing with CSS.'
        }
    ] as const;

    protected readonly parts = [
        { id: 'root', name: 'Root', directive: 'rdxAccordionRoot', description: 'Owns expanded state.' },
        {
            id: 'trigger',
            name: 'Trigger',
            directive: 'rdxAccordionTrigger',
            description: 'Activates with a click or keyboard.'
        },
        {
            id: 'panel',
            name: 'Panel',
            directive: 'rdxAccordionPanel',
            description: 'Reveals content and supports motion.'
        }
    ] as const;

    protected readonly defaultValue = [this.items[0].id];
    protected readonly openItem = computed(() => this.accordionRoot()?.value()[0]);
    protected readonly selectedPart = signal<AccordionPart>('root');
    protected readonly hoveredPart = signal<AccordionPart | null>(null);
    protected readonly focusedPart = signal<AccordionPart | null>(null);
    protected readonly activePart = computed(() => this.hoveredPart() ?? this.focusedPart() ?? this.selectedPart());

    protected readonly connectors = signal<Connector[]>([]);

    constructor() {
        afterRenderEffect({
            read: (onCleanup) => {
                const stage = this.stage().nativeElement;
                const accordion = this.accordion().nativeElement;
                const triggers = this.triggers();
                const openIndex = this.items.findIndex((item) => item.id === this.openItem());
                const trigger = (triggers[openIndex] ?? triggers[0]).nativeElement;
                const panel = this.panel()?.nativeElement;
                const callouts = this.callouts().map((ref) => ref.nativeElement);
                const targets = { root: accordion, trigger, panel };

                const measure = () => this.measureConnectors(stage, callouts, targets);
                measure();

                // The panel, typography and callout wrapping all affect the wire endpoints.
                const observer = new ResizeObserver(measure);
                for (const element of [stage, accordion, trigger, panel, ...callouts]) {
                    if (element) observer.observe(element);
                }
                onCleanup(() => observer.disconnect());
            }
        });
    }

    protected focusPart(part: AccordionPart): void {
        this.hoveredPart.set(null);
        this.focusedPart.set(part);
    }

    private measureConnectors(
        stage: HTMLElement,
        callouts: readonly HTMLElement[],
        targets: Record<AccordionPart, HTMLElement | undefined>
    ): void {
        const stageBounds = stage.getBoundingClientRect();
        const connectors: Connector[] = [];
        for (const [index, part] of this.parts.entries()) {
            const target = targets[part.id];
            if (!target) continue;
            const targetBounds = target.getBoundingClientRect();
            const labelBounds = callouts[index].getBoundingClientRect();
            const x = targetBounds.right - stageBounds.left + 4;
            const y = targetBounds.top - stageBounds.top + targetBounds.height / 2;
            const endX = labelBounds.left - stageBounds.left - 6;
            const endY = labelBounds.top - stageBounds.top + labelBounds.height / 2;
            if (endX <= x) continue;
            const elbowX = x + (endX - x) * 0.48;

            connectors.push({ part: part.id, x, y, path: `M ${x} ${y} H ${elbowX} V ${endY} H ${endX}` });
        }
        this.connectors.set(connectors);
    }
}
